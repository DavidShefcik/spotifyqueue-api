/*
* Author: David Shefcik
* Created: 11/16/19
* Project | File: Spotify Queue Authentication API | src/routes/auth/callback.js
* Purpose: The route to handle to response from Spotify after the user goes through the OAuth consent page.
*/

// Route
module.exports = app => {
    app.get("/auth/callback", (request, response) => {
        let code = request.query.code;
        if(code === undefined) {
            return response.status(400).send({"error": "code"});
        } else {
            return response.status(200).send({"content": "Callback!"});
        }
    });
};