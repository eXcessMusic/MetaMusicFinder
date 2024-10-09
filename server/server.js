const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
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
        if (isTrack) {
            spotifyResponse = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        } else {
            // Assume it's an album/EP
            spotifyResponse = await axios.get(`https://api.spotify.com/v1/albums/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        }

        let previewUrl = null;
        if (isTrack) {
            previewUrl = spotifyResponse.data.preview_url;
        } else if (spotifyResponse.data.tracks && spotifyResponse.data.tracks.items.length > 0) {
            // For albums/EPs, get the preview URL of the first track
            previewUrl = spotifyResponse.data.tracks.items[0].preview_url;
        }

        // Fetch additional links from Songlink
        const songlinkResponse = await axios.get(`https://api.song.link/v1-alpha.1/links`, {
            params: { url: spotify_url },
        });

        // Combine the data
        const result = {
            name: spotifyResponse.data.name,
            artist: isTrack 
                ? spotifyResponse.data.artists.map((a) => a.name).join(", ")
                : spotifyResponse.data.artists[0].name,
            artwork: isTrack 
                ? spotifyResponse.data.album.images[0].url
                : spotifyResponse.data.images[0].url,
            release_date: isTrack
                ? spotifyResponse.data.album.release_date
                : spotifyResponse.data.release_date,
            preview_url: previewUrl || "",
            spotify_url: spotify_url,
            soundcloud_url: songlinkResponse.data.linksByPlatform?.soundcloud?.url || "",
            applemusic_url: songlinkResponse.data.linksByPlatform?.appleMusic?.url || "",
            youtube_url: songlinkResponse.data.linksByPlatform?.youtube?.url || "",
            deezer_url: songlinkResponse.data.linksByPlatform?.deezer?.url || "",
            type: isTrack ? "track" : spotifyResponse.data.album_type,
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
