/*
 * Author: David Shefcik
 * Created: 11/23/19
 * Project | File: Spotify Queue API | src/middleware/requireToken.js
 * Purpose: The middleware to check if the client is logged in. If they are not logged in, send an error, otherwise continue to the route.
 */

// Module imports
const path = require('path')

// Model imports
const userModel = require(path.join(__dirname, '../mongoose/models/userModel'))

// Middleware
const requireToken = (req, res, next) => {
  let token = req.headers.token
  if (token === undefined) {
    return res.status(401).send({ error: 'unauthorized' })
  } else {
    userModel.findOne({ token: token }, (error, user) => {
      if (error) {
        if (process.env.PRODUCTION === 'false') {
          console.log(error)
        }
        return response.status(400).send({ error: 'database' })
      } else {
        if (user) {
          next()
        } else {
          return res.status(401).send({ error: 'unauthorized' })
        }
      }
    })
  }
}

module.exports = requireToken
