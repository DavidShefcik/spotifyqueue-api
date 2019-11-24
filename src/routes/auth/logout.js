/*
 * Author: David Shefcik
 * Created: 11/23/19
 * Project | File: Spotify Queue API | src/routes/auth/logout.js
 * Purpose: The route to handle logging out from the client by setting the user's token in the database to an empty string.
 */

// Module imports
const axios = require('axios')
const path = require('path')

// Model imports
const userModel = require(path.join(
  __dirname,
  '../../mongoose/models/userModel'
))

// Route
module.exports = app => {
  app.post('/auth/logout', (request, response) => {
    let token = request.body.token
    if (token === undefined) {
      return response.status(400).send({ error: 'token' })
    } else {
      userModel.findOne({ token: token }, (error, user) => {
        if (error) {
          if (process.env.PRODUCTION === 'false') {
            console.log(error)
          }
          return response.status(400).send({ error: 'database' })
        } else {
          if (user) {
            userModel.updateOne(
              { token: token },
              { $set: { token: null } },
              { new: false },
              (error, doc) => {
                if (error) {
                  if (process.env.PRODUCTION === 'false') {
                    console.log(error)
                  }
                  return response.status(400).send({ error: 'database' })
                } else {
                  return response.status(200).send({ success: true })
                }
              }
            )
          } else {
            return response.status(400).send({ error: 'database' })
          }
        }
      })
    }
  })
}
