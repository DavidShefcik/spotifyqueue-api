/*
* Author: David Shefcik
* Created: 11/16/19
* Project | File: Spotify Queue API | src/routes/auth/callback.js
* Purpose: The route to handle to response from Spotify after the user goes through the OAuth consent page.
*/

// Module imports
const axios = require("axios");
const qs = require("querystring");
const path = require("path");

// Model imports
const userModel = require(path.join(__dirname, "../../mongoose/models/userModel"));

// Route
module.exports = app => {
    app.get("/auth/callback", (request, response) => {
        let code = request.query.code;
        let accessToken;
        let refreshToken;
        let id;
        let user;
        let returnUser;
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
                    let token = require("crypto").randomBytes(64).toString('hex');
                    user = {
                        "userid": r["data"]["id"],
                        "username": r["data"]["display_name"],
                        "access_token": accessToken,
                        "refresh_token": refreshToken,
                        "token": token
                    };
                    userModel.findOneAndUpdate({"userid": user["userid"]}, user, {new: true, upsert: true, useFindAndModify: false}).then(doc => {
                        returnUser = {
                            "username": doc["username"],
                            "token": doc["token"]
                        }
                        return response.status(200).send({"user": returnUser});
                    }).catch(error => {
                        if(process.env.PRODUCTION === "false") {
                            console.log(error);
                        }
                        return response.status(400).send({"error": "db"});
                    });
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