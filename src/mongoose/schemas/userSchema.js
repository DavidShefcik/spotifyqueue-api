/*
* Author: David Shefcik
* Created: 11/16/19
* Project | File: Spotify Queue Authentication API | src/mongoose/schemas/userSchema.js
* Purpose: Mongoose data schema for the user to be inserted into the database.
*/

// Module imports
const mongoose = require("mongoose");

// User schema
const userSchema = new mongoose.Schema({
    userid: "string",
    access_token: "string",
    refresh_token: "string"
});

// Export
export default userSchema;