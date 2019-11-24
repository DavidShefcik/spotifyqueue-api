/*
 * Author: David Shefcik
 * Created: 11/23/19
 * Project | File: Spotify Queue Authentication API | src/mongoose/models/queueModel.js
 * Purpose: Mongoose data model for the queue to be inserted into the database.
 */

// Module imports
const mongoose = require('mongoose')
const path = require('path')

// Schema import
const queueSchema = require(path.join(__dirname, '../schemas/queueSchema'))

// Queue model
const queueModel = mongoose.model('queues', queueSchema)

// Export
module.exports = queueModel
