/*
 * Author: David Shefcik
 * Created: 11/26/19
 * Project | File: Spotify Queue API | src/routes/song/song.js
 * Purpose: The route to get the specified song from Spotify.
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

// Route
module.exports = app => {
  app.get('/song/:id', requireToken, (request, response) => {
    let id = request.params.id
    let token = request.headers.token
    if (id === undefined || token === undefined) {
      return response.status(400).send({ error: 'id' })
    } else {
      userModel.findOne({ token: token }, (error, user) => {
        if (error) {
          if (process.env.PRODUCTION === 'false') {
            console.log(error)
          }
          return response.status(400).send({ error: 'database' })
        } else {
          if (user) {
            let accessToken = user['access_token']
            axios
              .get('https://api.spotify.com/v1/tracks/' + id, {
                headers: { Authorization: 'Bearer ' + accessToken }
              })
              .then(res => {
                let artists = []
                res['data']['artists'].forEach(value => {
                  artists.push(value['name'])
                })

                let song = {
                  id: res['data']['id'],
                  artists: artists,
                  image: res['data']['album']['images'][0]['url'],
                  name: res['data']['name']
                }

                return response.status(200).send({ song: song })
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
                        'http://' + process.env.API_URL + '/song/' + id
                      )
                    })
                    .catch(e => {
                      if (process.env.PRODUCTION === 'false') {
                        console.log(e)
                      }
                      return response.status(400).send({ error: 'spotify' })
                    })
                } else {
                  return response.status(400).send({ error: 'spotify' })
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
