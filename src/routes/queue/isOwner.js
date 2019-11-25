/*
 * Author: David Shefcik
 * Created: 11/16/19
 * Project | File: Spotify Queue API | src/routes/queue/isOwner.js
 * Purpose: The route to check if someone owns a given queue.
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
  app.get('/queue/:id/isowner', requireToken, (request, response) => {
    let id = request.params.id
    let token = request.headers.token
    if (id === undefined || token === undefined) {
      return response.status(400).send({ error: 'unauthorized' })
    } else {
      userModel.findOne({ token: token }, (error, user) => {
        if (error) {
          if (process.env.PRODUCTION === 'false') {
            console.log(error)
          }
          return response.status(400).send({ error: 'database' })
        } else {
          if (user) {
            queueModel.findOne({ queueid: id }, (error, queue) => {
              if (error) {
                if (process.env.PRODUCTION === 'false') {
                  console.log(error)
                }
                return response.status(400).send({ error: 'database' })
              } else {
                if (queue) {
                  if (user['userid'] === queue['ownerid']) {
                    return response.status(200).send({ isOwner: true })
                  } else {
                    return response.status(200).send({ isOwner: false })
                  }
                } else {
                  return response.status(400).send({ error: 'noqueue' })
                }
              }
            })
          } else {
            return response.status(400).send({ error: 'nouser' })
          }
        }
      })
    }
  })
}
