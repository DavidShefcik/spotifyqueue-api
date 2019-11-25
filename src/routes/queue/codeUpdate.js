/*
 * Author: David Shefcik
 * Created: 11/24/19
 * Project | File: Spotify Queue API | src/routes/queue/codeUpdate.js
 * Purpose: The route to change the queue's code.
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
  app.post('/queue/code/update', requireToken, (request, response) => {
    let token = request.headers.token
    let id = request.body.id
    if (token === undefined || id === undefined) {
      return response.status(401).send({ error: 'authorized' })
    } else {
      queueModel.findOne({ queueid: id }, (error, queue) => {
        if (error) {
          if (process.env.PRODUCTION === 'false') {
            console.log(error)
          }
          return response.status(400).send({ error: 'database' })
        } else {
          if (queue) {
            userModel.findOne({ token: token }, (error, user) => {
              if (error) {
                if (process.env.PRODUCTION === 'false') {
                  console.log(error)
                }
                return response.status(400).send({ error: 'database' })
              } else {
                if (user) {
                  if (queue['ownerid'] === user['userid']) {
                    let code
                    let codeOpen = false
                    do {
                      code = Math.floor(Math.random() * 900000) + 100000
                      queueModel.find({ code: code }, (error, queues) => {
                        if (error) {
                          if (process.env.PRODUCTION === 'false') {
                            console.log(error)
                          }
                          codeOpen = true
                          return response
                            .status(400)
                            .send({ error: 'database' })
                        } else {
                          if (!queues.length) {
                            codeOpen = true
                          }
                        }
                      })
                    } while (codeOpen)

                    queueModel
                      .findOneAndUpdate(
                        { queueid: queue['queueid'] },
                        { $set: { code: code } },
                        {
                          new: true,
                          upsert: false,
                          useFindAndModify: false
                        }
                      )
                      .then(doc => {
                        return response.status(200).send({ code: doc['code'] })
                      })
                      .catch(error => {
                        if (process.env.PRODUCTION === 'false') {
                          console.log(error)
                        }
                        return response.status(400).send({ error: 'database' })
                      })
                  } else {
                    return response.status(401).send({ error: 'authorized' })
                  }
                } else {
                  return response.status(400).send({ error: 'nouser' })
                }
              }
            })
          } else {
            return response.status(400).send({ error: 'noqueue' })
          }
        }
      })
    }
  })
}
