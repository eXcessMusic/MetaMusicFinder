const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 3000;
const host = "0.0.0.0"; // Added this line for Railway

app.use(cors());
app.use(express.json());

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

/* Hopefully I won't need those anymore but coding is full of surprises so let's keep them around...
console.log('Current working directory:', process.cwd());
console.log('Contents of current directory:', fs.readdirSync('.'));
console.log('Contents of dist directory:', fs.existsSync('./dist') ? fs.readdirSync('./dist') : 'dist directory not found');
console.log('Spotify Client ID available:', !!spotifyClientId);
console.log('Spotify Client Secret available:', !!spotifyClientSecret); */

// Serve static files from the Angular app build directory
app.use(
    express.static(path.join(__dirname, "dist/music-search-angular/browser"))
);

// Proxy middleware options
const songlinkApiProxy = createProxyMiddleware({
    target: "https://api.song.link", // URL of the Songlink API
    changeOrigin: true,
    pathRewrite: {
        "^/songlink-api": "", // remove the path prefix when forwarding the request
    },
});

// Use the proxy middleware
app.use("/songlink-api", songlinkApiProxy);

/**
 * Safely attempts to find an alternative preview URL from Deezer
 * @param {Object} track The track object from Spotify
 * @returns {Promise<string|null>} The preview URL or null if not found
 */
async function findAlternativePreviewUrl(track) {
    if (!track || typeof track !== 'object') return null;
    if (track.preview_url) return track.preview_url;
    
    try {
        // Safely extract track name and artist
        const trackName = track.name || '';
        const artistName = track.artists && 
                          track.artists.length > 0 && 
                          track.artists[0].name ? 
                          track.artists[0].name : '';
        
        if (!trackName || !artistName) return null;
        
        // Create a safe search query
        const searchQuery = encodeURIComponent(`${trackName} ${artistName}`);
        
        // Call Deezer API
        const deezerResponse = await axios.get(`https://api.deezer.com/search?q=${searchQuery}&limit=1`);
        
        if (deezerResponse.data && 
            deezerResponse.data.data && 
            deezerResponse.data.data.length > 0 && 
            deezerResponse.data.data[0].preview) {
            console.log(`Found Deezer preview for: ${trackName} by ${artistName}`);
            return deezerResponse.data.data[0].preview;
        }
        
        return null;
    } catch (error) {
        console.error(`Error finding alternative preview:`, error.message);
        return null;
    }
}

async function getSpotifyAccessToken() {
    if (!spotifyClientId || !spotifyClientSecret) {
        throw new Error(
            "Spotify credentials are not properly set in the environment variables."
        );
    }

    const auth = Buffer.from(
        spotifyClientId + ":" + spotifyClientSecret
    ).toString("base64");

    try {
        const tokenResponse = await axios.post(
            "https://accounts.spotify.com/api/token",
            "grant_type=client_credentials",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: "Basic " + auth,
                },
            }
        );

        return tokenResponse.data.access_token;
    } catch (error) {
        console.error(
            "Error getting Spotify access token:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

app.get("/api/search", async (req, res) => {
    try {
        const { q, type } = req.query;

        if (!q || !type) {
            return res.status(400).json({
                error: "Missing required parameters: q (query) and type",
            });
        }

        const accessToken = await getSpotifyAccessToken();

        const spotifyResponse = await axios.get(
            "https://api.spotify.com/v1/search",
            {
                params: { q, type },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        // Send the Spotify response as-is - we'll handle missing previews in the frontend
        res.json(spotifyResponse.data);
    } catch (error) {
        console.error("Error in /api/search:", error);
        res.status(500).json({
            error: "An error occurred while fetching data from Spotify",
            details: error.message,
        });
    }
});

// New route for album details
app.get("/api/albums/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const accessToken = await getSpotifyAccessToken();

        const spotifyResponse = await axios.get(
            `https://api.spotify.com/v1/albums/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        res.json(spotifyResponse.data);
    } catch (error) {
        console.error("Error in /api/albums/:id:", error);
        res.status(500).json({
            error: "An error occurred while fetching album details from Spotify",
            details: error.message,
        });
    }
});

// New route for track details
app.get("/api/tracks", async (req, res) => {
    try {
        const { ids } = req.query;
        const accessToken = await getSpotifyAccessToken();

        const spotifyResponse = await axios.get(
            "https://api.spotify.com/v1/tracks",
            {
                params: { ids },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        // Try to find missing preview URLs
        if (spotifyResponse.data && spotifyResponse.data.tracks && Array.isArray(spotifyResponse.data.tracks)) {
            for (let i = 0; i < spotifyResponse.data.tracks.length; i++) {
                const track = spotifyResponse.data.tracks[i];
                // Only if preview_url is null or undefined
                if (track && !track.preview_url) {
                    try {
                        const alternativePreview = await findAlternativePreviewUrl(track);
                        if (alternativePreview) {
                            track.preview_url = alternativePreview;
                        }
                    } catch (previewError) {
                        console.error("Error finding preview:", previewError);
                        // Continue even if finding preview fails
                    }
                }
            }
        }

        res.json(spotifyResponse.data);
    } catch (error) {
        console.error("Error in /api/tracks:", error);
        res.status(500).json({
            error: "An error occurred while fetching track details from Spotify",
            details: error.message,
        });
    }
});

// New route for sending data to Django
app.post("/api/send-to-django", async (req, res) => {
    try {
        const response = await axios.post(
            "http://your-django-api.com/endpoint",
            req.body
        );
        res.json(response.data);
    } catch (error) {
        console.error("Error sending data to Django:", error);
        res.status(500).json({ error: "Failed to communicate with Django" });
    }
});

// New route for external searches
app.get("/api/external-search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res
                .status(400)
                .json({ error: "Query parameter is required" });
        }

        // Search Spotify
        const accessToken = await getSpotifyAccessToken();
        const spotifyResponse = await axios.get(
            "https://api.spotify.com/v1/search",
            {
                params: { q: query, type: "track", limit: 5 },
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (spotifyResponse.data.tracks.items.length === 0) {
            return res.status(404).json({ error: "No results found" });
        }

        // Format the results
        const results = spotifyResponse.data.tracks.items.map((track) => ({
            name: track.name,
            artist: track.artists.map((a) => a.name).join(", "),
            spotify_url: track.external_urls.spotify,
            preview_url: track.preview_url,
            album: track.album.name,
            release_date: track.album.release_date,
        }));

        res.json({ results });
    } catch (error) {
        console.error("Error in external search:", error);
        res.status(500).json({ error: "An error occurred while searching" });
    }
});

app.get("/api/track-details", async (req, res) => {
    try {
        const { spotify_url } = req.query;
        if (!spotify_url) {
            return res.status(400).json({ error: "Spotify URL parameter is required" });
        }

        const accessToken = await getSpotifyAccessToken();

        // Extract ID from Spotify URL
        const id = spotify_url.split("/").pop().split("?")[0];
        
        // Determine if it's a track or album/EP
        const isTrack = spotify_url.includes("/track/");
        
        let spotifyResponse;
        let previewUrl = null;
        
        if (isTrack) {
            spotifyResponse = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            // Try to find alternative preview
            if (!spotifyResponse.data.preview_url) {
                try {
                    const alternativePreview = await findAlternativePreviewUrl(spotifyResponse.data);
                    if (alternativePreview) {
                        spotifyResponse.data.preview_url = alternativePreview;
                    }
                } catch (previewError) {
                    console.error("Error finding preview:", previewError);
                }
            }
            
            previewUrl = spotifyResponse.data.preview_url || "";
        } else {
            // Assume it's an album/EP
            spotifyResponse = await axios.get(`https://api.spotify.com/v1/albums/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            // For albums, check the first track
            if (spotifyResponse.data.tracks && 
                spotifyResponse.data.tracks.items && 
                spotifyResponse.data.tracks.items.length > 0) {
                
                const firstTrack = spotifyResponse.data.tracks.items[0];
                
                if (!firstTrack.preview_url) {
                    try {
                        const alternativePreview = await findAlternativePreviewUrl(firstTrack);
                        if (alternativePreview) {
                            firstTrack.preview_url = alternativePreview;
                        }
                    } catch (previewError) {
                        console.error("Error finding preview for first track:", previewError);
                    }
                }
                
                previewUrl = firstTrack.preview_url || "";
            }
        }

        // Fetch additional links from Songlink
        const songlinkResponse = await axios.get(`https://api.song.link/v1-alpha.1/links`, {
            params: { url: spotify_url },
        });

        // Combine the data
        const result = {
            name: spotifyResponse.data.name,
            artist: isTrack 
                ? spotifyResponse.data.artists && spotifyResponse.data.artists.map((a) => a.name).join(", ")
                : spotifyResponse.data.artists && spotifyResponse.data.artists[0] && spotifyResponse.data.artists[0].name || "",
            artwork: isTrack 
                ? (spotifyResponse.data.album && 
                   spotifyResponse.data.album.images && 
                   spotifyResponse.data.album.images[0] && 
                   spotifyResponse.data.album.images[0].url) || ""
                : (spotifyResponse.data.images && 
                   spotifyResponse.data.images[0] && 
                   spotifyResponse.data.images[0].url) || "",
            release_date: isTrack
                ? (spotifyResponse.data.album && spotifyResponse.data.album.release_date) || ""
                : spotifyResponse.data.release_date || "",
            preview_url: previewUrl,
            spotify_url: spotify_url,
            soundcloud_url: songlinkResponse.data.linksByPlatform?.soundcloud?.url || "",
            applemusic_url: songlinkResponse.data.linksByPlatform?.appleMusic?.url || "",
            youtube_url: songlinkResponse.data.linksByPlatform?.youtube?.url || "",
            deezer_url: songlinkResponse.data.linksByPlatform?.deezer?.url || "",
            type: isTrack ? "track" : spotifyResponse.data.album_type || "",
        };

        res.json(result);
    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(500).json({
            error: "An error occurred while fetching details",
            details: error.message
        });
    }
});

// This should be the last route
app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "dist/music-search-angular/browser/index.html")
    );
});

app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});