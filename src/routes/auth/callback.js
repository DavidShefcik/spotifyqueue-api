/*
* Author: David Shefcik
* Created: 11/16/19
* Project | File: Spotify Queue Authentication API | src/routes/auth/callback.js
* Purpose: The route to handle to response from Spotify after the user goes through the OAuth consent page.
*/

// Module imports
const axios = require("axios");
const qs = require("querystring");

// Route
module.exports = app => {
    app.get("/auth/callback", (request, response) => {
        let code = request.query.code;
        let accessToken;
        let refreshToken;
        let user;
        if(code === undefined) {
            return response.status(400).send({"error": "denied"});
        } else {
            let data = {
                "grant_type": "authorization_code",
                "client_id": process.env.SPOTIFY_CLIENT_ID,
                "client_secret": process.env.SPOTIFY_CLIENT_SECRET,
                "code": code,
                "redirect_uri": process.env.SPOTIFY_REDIRECT_URI
            }
            let headers = {
                "Content-Type": "application/x-www-form-urlencoded",
            };
            axios.post(
                "https://accounts.spotify.com/api/token",
                qs.stringify(data),
                { headers: headers }
            ).then(res => {
                accessToken = res["data"]["access_token"];
                refreshToken = res["data"]["refresh_token"];

                axios.get("https://api.spotify.com/v1/me", {headers: {"Authorization": `Bearer ${accessToken}`}}).then(r => {
                    return response.status(200).send(r["data"]);
                }).catch(error => {
                    if(process.env.PRODUCTION === "false") {
                        console.log(error);
                    }
                    return response.status(400).send({"error": "token"});
                });
            }).catch(error => {
                if(process.env.PRODUCTION === "false") {
                    console.log(error);
                }
                return response.status(400).send({"error": "code"});
            });
        }
    });
};