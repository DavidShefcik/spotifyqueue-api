/*
 * Author: David Shefcik
 * Created: 11/23/19
 * Project | File: Spotify Queue Authentication API | src/mongoose/schemas/queueSchema.js
 * Purpose: Mongoose data schema for the queue to be inserted into the database.
 */

// Module imports
const mongoose = require('mongoose')

// Queue schema
const queueSchema = new mongoose.Schema({
  queueid: 'string',
  ownerid: 'string',
  code: 'string',
  memberids: ['string'],
  songs: [
    {
      addedByID: 'string',
      uri: 'string',
      id: 'string'
    }
  ]
})

// Export
module.exports = queueSchema
