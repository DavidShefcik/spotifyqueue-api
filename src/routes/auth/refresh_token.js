/*
 * Author: David Shefcik
 * Created: 11/16/19
 * Project | File: Spotify Queue API | src/routes/auth/refresh_token.js
 * Purpose: The route to get a new Spotify access token when passing it a user's token.
 */

// Module imports
const axios = require('axios')
const path = require('path')
const qs = require('querystring')

// Model imports
const userModel = require(path.join(
  __dirname,
  '../../mongoose/models/userModel'
))

// Route
module.exports = app => {
  app.post('/auth/refresh', (request, response) => {
    let token = request.headers.token
    let accessToken
    let returnUser
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
            let refreshToken = user['refresh_token']
            let data = {
              client_id: process.env.SPOTIFY_CLIENT_ID,
              client_secret: process.env.SPOTIFY_CLIENT_SECRET,
              grant_type: 'refresh_token',
              refresh_token: refreshToken
            }
            let headers = {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
            axios
              .post(
                'https://accounts.spotify.com/api/token',
                qs.stringify(data),
                { headers: headers }
              )
              .then(res => {
                accessToken = res['data']['access_token']
                userModel.updateOne(
                  { token: token },
                  { $set: { access_token: accessToken } },
                  { new: true },
                  (error, doc) => {
                    if (error) {
                      if (process.env.PRODUCTION === 'false') {
                        console.log(error)
                      }
                      return response.status(400).send({ error: 'database' })
                    } else {
                      returnUser = {
                        username: user['username'],
                        token: user['token']
                      }
                      return response.status(200).send({ user: returnUser })
                    }
                  }
                )
              })
              .catch(error => {
                if (process.env.PRODUCTION === 'false') {
                  console.log(error)
                }
                return response.status(400).send({ error: 'token' })
              })
          } else {
            return response.status(400).send({ error: 'token' })
          }
        }
      })
    }
  })
}
