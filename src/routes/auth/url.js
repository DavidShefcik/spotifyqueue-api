/*
* Author: David Shefcik
* Created: 11/16/19
* Project | File: Spotify Queue API | src/routes/auth/url.js
* Purpose: The route to send the Spotify login url.
*/

// Route
module.exports = app => {
    app.get("/auth/login", (request, response) => {
        let scopes = "streaming user-read-playback-state user-read-currently-playing user-modify-playback-state";
        let url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)}`
        return response.status(200).send({"url": url});
    });
};