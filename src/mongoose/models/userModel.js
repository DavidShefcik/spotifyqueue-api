/*
* Author: David Shefcik
* Created: 11/16/19
* Project | File: Spotify Queue Authentication API | src/mongoose/models/userModel.js
* Purpose: Mongoose data model for the user to be inserted into the database.
*/

// Module imports
const mongoose = require("mongoose");
const path = require("path");

// Schema import
const userSchema = require(path.join(__dirname, "../schemas/userSchema"));

// User model
const userModel = mongoose.model("users", userSchema);

// Export
module.exports = userModel;