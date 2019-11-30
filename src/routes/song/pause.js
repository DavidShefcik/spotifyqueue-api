/*
 * Author: David Shefcik
 * Created: 11/29/19
 * Project | File: Spotify Queue API | src/routes/song/pause.js
 * Purpose: The route to pause a song.
 */

// Module imports
const path = require('path')
const axios = require('axios')

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

/*
 * Wait, why did you switch to async and await?!?!?!?!?
 * I switched because I somehow forgot that async and await existed. I switched because I realized it would be faster for me to use it.
 * Overtime I will go back and change all the routes to async and await but for now this will do.
 *
 * Why did you switch to sending empty response bodies when sending an error?
 * I realized I didn't need any content in the error body since I never use it in the frontend.
 *
 * Why did you make these changes seemingly suddenly without going back and changing everything?
 * I was on a long car ride for thanksgiving and I was thinking about changes I should make to the app and I realized both of those changes.
 *
 * Why don't you go back and change them?
 * Everything works fine without the changes. Once I have some time I'll go back and fix it.
 *
 * If I could go back in time I'd start by using async and await and sending empty bodies when I was starting the API.
 */

// Route
module.exports = app => {
  app.post('/song/pause', requireToken, async (request, response) => {
    let queueID = request.body.id
    let token = request.headers.token
    let ownerID
    let accessToken
    if (queueID === undefined || token === undefined) {
      return response.status(401).send()
    } else {
      queueModel.findOne({ queueid: queueID }, (error, queue) => {
        if (error) {
          if (process.env.PRODUCTION === 'false') {
            console.log(error)
          }
          return response.status(401).send()
        } else {
          if (queue) {
            ownerID = queue['ownerid']

            userModel.findOne({ token: token }, async (error, user) => {
              if (error) {
                if (process.env.PRODUCTION === 'false') {
                  console.log(error)
                }
                return response.status(401).send()
              } else {
                if (user) {
                  if (user['userid'] === ownerID) {
                    accessToken = user['access_token']

                    axios
                      .put('https://api.spotify.com/v1/me/player/pause', null, {
                        headers: { Authorization: 'Bearer ' + accessToken }
                      })
                      .then(r => {
                        return response.status(200).send({ event: 'pause' })
                      })
                      .catch(async error => {
                        if (
                          error['response']['data']['error']['message'] ===
                          'The access token expired'
                        ) {
                          await axios
                            .post(
                              'http://' + process.env.API_URL + '/auth/refresh',
                              null,
                              { headers: { token: token } }
                            )
                            .catch(e => {
                              if (process.env.PRODUCTION === 'false') {
                                console.log(e)
                              }
                              console.log('Refresh')
                              return response.status(400).send()
                            })

                          response.redirect(
                            'http://' + process.env.API_URL + '/song/pause'
                          )
                        } else {
                          if (
                            error['response']['data']['error']['reason'] ===
                            'NO_ACTIVE_DEVICE'
                          ) {
                            return response
                              .status(200)
                              .send({ message: 'device' })
                          } else if (
                            error['response']['data']['error']['message'] ===
                            'Player command failed: Restriction violated'
                          ) {
                            // Resume playback
                            axios
                              .put(
                                'https://api.spotify.com/v1/me/player/play',
                                null,
                                {
                                  headers: {
                                    Authorization: 'Bearer ' + accessToken
                                  }
                                }
                              )
                              .then(r => {
                                return response
                                  .status(200)
                                  .send({ event: 'resume' })
                              })
                              .catch(error => {
                                return response.status(400).send()
                              })
                          } else {
                            return response.status(400).send()
                          }
                        }
                      })
                  } else {
                    return response.status(401).send()
                  }
                } else {
                  return response.status(404).send()
                }
              }
            })
          } else {
            return response.status(404).send()
          }
        }
      })
    }
  })
}
