const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

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
app.use(express.static(path.join(__dirname, 'dist/music-search-angular/browser')));

// Proxy middleware options
const songlinkApiProxy = createProxyMiddleware({
    target: 'https://api.song.link', // URL of the Songlink API
    changeOrigin: true,
    pathRewrite: {
      '^/songlink-api': '', // remove the path prefix when forwarding the request
    },
});

// Use the proxy middleware
app.use('/songlink-api', songlinkApiProxy);

async function getSpotifyAccessToken() {
    if (!spotifyClientId || !spotifyClientSecret) {
        throw new Error('Spotify credentials are not properly set in the environment variables.');
    }

    const auth = (Buffer.from(spotifyClientId + ':' + spotifyClientSecret).toString('base64'));

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + auth
                }
            }
        );

        return tokenResponse.data.access_token;
    } catch (error) {
        console.error('Error getting Spotify access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

app.get('/api/search', async (req, res) => {
    try {
        const { q, type } = req.query;
        
        if (!q || !type) {
            return res.status(400).json({ error: 'Missing required parameters: q (query) and type' });
        }

        const accessToken = await getSpotifyAccessToken();
        
        const spotifyResponse = await axios.get('https://api.spotify.com/v1/search', {
            params: { q, type },
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json(spotifyResponse.data);
    } catch (error) {
        console.error('Error in /api/search:', error);
        res.status(500).json({ 
            error: 'An error occurred while fetching data from Spotify',
            details: error.message
        });
    }
});

// New route for album details
app.get('/api/albums/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const accessToken = await getSpotifyAccessToken();
        
        const spotifyResponse = await axios.get(`https://api.spotify.com/v1/albums/${id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json(spotifyResponse.data);
    } catch (error) {
        console.error('Error in /api/albums/:id:', error);
        res.status(500).json({ 
            error: 'An error occurred while fetching album details from Spotify',
            details: error.message
        });
    }
});

// New route for track details
app.get('/api/tracks', async (req, res) => {
    try {
        const { ids } = req.query;
        const accessToken = await getSpotifyAccessToken();
        
        const spotifyResponse = await axios.get('https://api.spotify.com/v1/tracks', {
            params: { ids },
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json(spotifyResponse.data);
    } catch (error) {
        console.error('Error in /api/tracks:', error);
        res.status(500).json({ 
            error: 'An error occurred while fetching track details from Spotify',
            details: error.message
        });
    }
});

// This should be the last route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/music-search-angular/browser/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});