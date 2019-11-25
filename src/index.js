/*
 * Author: David Shefcik
 * Created: 11/16/19
 * Project | File: Spotify Queue API | src/index.js
 * Purpose: Create express server, configure middleware for express server, and add routes to the express server.
 */

'use strict'

// Configure dotenv
require('dotenv').config()

// Module imports
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')

// Mongoose connect
mongoose
  .connect(process.env.MONGO_DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(error => {
    console.log('Could not connect to MongoDB!')
  })
// Create server
const app = express()

// Add/Configure middleware
// Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// CORS
app.use(cors())

// Load routes
require(path.join(__dirname, './routes/queue/isOwner'))(app)
require(path.join(__dirname, './routes/queue/codeUpdate'))(app)
require(path.join(__dirname, './routes/queue/queue'))(app)
require(path.join(__dirname, './routes/queue/create'))(app)
require(path.join(__dirname, './routes/users/user'))(app)
require(path.join(__dirname, './routes/users/me'))(app)
require(path.join(__dirname, './routes/auth/logout'))(app)
require(path.join(__dirname, './routes/auth/refresh_token'))(app)
require(path.join(__dirname, './routes/auth/callback'))(app)
require(path.join(__dirname, './routes/auth/url'))(app)
require(path.join(__dirname, './routes/catch'))(app) // Catch all route

// Start server on port specified in .env file
app.listen(process.env.PORT, () => {
  console.log(
    `Authentication express server started on port ${process.env.PORT}!`
  )
})
