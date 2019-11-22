/*
* Author: David Shefcik
* Created: 11/16/19
* Project | File: Spotify Queue API | src/routes/catch.js
* Purpose: The catch all route.
*/

// Route
module.exports = app => {
    app.get("*", (request, response) => {
        return response.status(404).send({"error": "404"});
    });
};