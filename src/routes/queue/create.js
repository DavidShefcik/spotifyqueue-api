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
    let id
    let ownerid
    let code
    let codeOpen = false
    let queue
    if (token === undefined) {
      return response.status(401).send({ error: 'unauthorized' })
    } else {
      userModel.findOne({ token: token }, (error, user) => {
        if (error) {
          if (process.env.PRODUCTION === 'false') {
            console.log(error)
          }
          return response.status(400).send({ error: 'database' })
        } else {
          if (user) {
            ownerid = user['userid']
            id = require('crypto')
              .randomBytes(64)
              .toString('hex')

            do {
              code = Math.floor(Math.random() * 900000) + 100000
              queueModel.find({ code: code }, (error, queues) => {
                if (error) {
                  if (process.env.PRODUCTION === 'false') {
                    console.log(error)
                  }
                  codeOpen = true
                  return response.status(400).send({ error: 'database' })
                } else {
                  if (!queues.length) {
                    codeOpen = true
                  }
                }
              })
            } while (codeOpen)

            // TEMP
            queue = {
              queueid: id,
              ownerid: ownerid,
              code: code,
              memberids: [''],
              songs: [
                {
                  addedByID: 'ieo2yn8d22oa95j8rvme37pgk',
                  uri:
                    'https://open.spotify.com/track/6Ray43gNA6LZxareyESwNk?si=C3opfpTRSzKU2HlCrYJznw',
                  id: '6Ray43gNA6LZxareyESwNk'
                }
              ]
            }

            queueModel
              .findOneAndUpdate({ ownerid: ownerid }, queue, {
                new: true,
                upsert: true,
                useFindAndModify: false
              })
              .then(doc => {
                return response.status(200).send({ queueid: queue['queueid'] })
              })
              .catch(error => {
                if (process.env.PRODUCTION === 'false') {
                  console.log(error)
                }
                return response.status(400).send({ error: 'database' })
              })
          } else {
            return response.status(400).send({ error: 'nouser' })
          }
        }
      })
    }
  })
}
