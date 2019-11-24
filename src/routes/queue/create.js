/*
 * Author: David Shefcik
 * Created: 11/23/19
 * Project | File: Spotify Queue API | src/routes/queue/create.js
 * Purpose: The route to create a user's queue.
 */

// Module imports
const path = require('path')

// Middleware imports
const requireToken = require(path.join(
  __dirname,
  '../../middleware/requireToken'
))

// Model imports
const userModel = require(path.join(
  __dirname,
  '../../mongoose/models/userModel'
))
const queueModel = require(path.join(
  __dirname,
  '../../mongoose/models/queueModel'
))

// Route
module.exports = app => {
  app.post('/queue/create', requireToken, (request, response) => {
    let token = request.headers.token
    if (token === undefined) {
      return response.status(401).send({ error: 'unauthorized' })
    } else {
      return response.status(200).send({ content: 'succ' })
    }
  })
}
