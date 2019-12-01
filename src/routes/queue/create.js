/*
 * Author: David Shefcik
 * Created: 11/23/19
 * Project | File: Spotify Queue API | src/routes/queue/create.js
 * Purpose: The route to create a user's queue.
 */

// Module imports
const path = require('path')
const axios = require('axios');

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
    let accessToken
    let song
    let playing = false;
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
            accessToken = user['access_token']
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

            song = {};

            axios
              .get('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { Authorization: 'Bearer ' + accessToken }
              })
              .then(res => {


                if(res['data']['item'] != undefined) {
                  song = {
                      addedByID: ownerid,
                      uri: res['data']['item']['href'],
                      id: res['data']['item']['id']
                  }
                  playing = res['data']['is_playing']
                }

                queue = {
                  queueid: id,
                  ownerid: ownerid,
                  code: code,
                  memberids: [''],
                  songs: [
                    song
                  ],
                  playing: playing
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
              })
              .catch(error => {
                if (
                  error['response']['data']['error']['message'] ===
                  'The access token expired'
                ) {
                  axios
                    .post(
                      'http://' + process.env.API_URL + '/auth/refresh',
                      null,
                      {
                        headers: { token: token }
                      }
                    )
                    .then(r => {
                      response.redirect(
                        'http://' + process.env.API_URL + '/queue/create'
                      )
                    })
                    .catch(e => {
                      if (process.env.PRODUCTION === 'false') {
                        console.log(e)
                      }
                      return response.status(400).send()
                    })
                } else {
                  return response.status(400).send()
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
