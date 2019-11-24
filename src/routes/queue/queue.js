/*
 * Author: David Shefcik
 * Created: 11/24/19
 * Project | File: Spotify Queue API | src/routes/queue/queue.js
 * Purpose: The route to get a queue by ID.
 */

// Module imports
const path = require('path')

// Middleware imports
const requireToken = require(path.join(
  __dirname,
  '../../middleware/requireToken'
))

// Model imports
const queueModel = require(path.join(
  __dirname,
  '../../mongoose/models/queueModel'
))

// Route
module.exports = app => {
  app.get('/queue/:id', requireToken, (request, response) => {
    let id = request.params.id
    if (id === undefined) {
      return response.status(400).send({ error: 'unauthorized' })
    } else {
      queueModel.findOne({ queueid: id }, (error, queue) => {
        if (error) {
          if (process.env.PRODUCTION === 'false') {
            console.log(error)
          }
          return response.status(400).send({ error: 'database' })
        } else {
          if (queue) {
            let newQueue = {
              queueid: queue['queueid'],
              ownerid: queue['ownerid'],
              code: queue['code'],
              members: queue['memberids'],
              songs: queue['songs']
            }
            return response.status(200).send({ queue: newQueue })
          } else {
            return response.status(400).send({ error: 'noqueue' })
          }
        }
      })
    }
  })
}
