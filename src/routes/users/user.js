/*
 * Author: David Shefcik
 * Created: 11/23/19
 * Project | File: Spotify Queue API | src/routes/users/user.js
 * Purpose: The route to get the specified user.
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

// Route
module.exports = app => {
  app.get('/users/:id', requireToken, (request, response) => {
    let id = request.params.id
    if (id === undefined) {
      return response.status(400).send({ error: 'id' })
    } else {
      userModel.findOne({ userid: id }, (error, user) => {
        if (error) {
          if (process.env.PRODUCTION === 'false') {
            console.log(error)
          }
          return response.status(400).send({ error: 'database' })
        } else {
          if (user) {
            let newUser = {
              id: user['userid'],
              username: user['username']
            }
            return response.status(200).send({ user: newUser })
          } else {
            return response.status(400).send({ error: 'nouser' })
          }
        }
      })
    }
  })
}
