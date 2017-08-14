import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { createServer } from 'http'
import { makeExecutableSchema } from 'graphql-tools'
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import cors from 'cors'

import { refreshTokens } from './auth'

import { JWT_SECRET } from './secret'

import typeDefs from './schemas'
import resolvers from './resolvers'

import models from './models'

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

const PORT = 3030

const app = express()

const addUser = async (req, res, next) => {
    const token = req.headers['x-token']

    if (token) {
        try {
            const { user } = await jwt.verify(token, JWT_SECRET)
            req.user = user
        } catch (e) {
            const refreshToken = req.headers['x-refresh-token']
            const newTokens = await refreshTokens(
                token, 
                refreshToken,
                models,
                JWT_SECRET,
            )
            if (newTokens.token && newTokens.refreshToken) {
                res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token')
                res.set('x-token', newTokens.token)
                res.set('x-refresh-token', newTokens.refreshToken)
            }
            req.user = newTokens.user
        }   
    } 

    next()
}

app.use(cors('*'))

app.use(addUser)

app.use(
    '/graphql',
    bodyParser.json(), 
    graphqlExpress(req => ({
        schema,
        context: {
            user: req.user,
            models,
        }
    }))
)

app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))

const server = createServer(app)

server.listen(PORT, () => {
    new SubscriptionServer({
        execute,
        subscribe,
        schema,
    }, {
        server: server,
        path: '/subscriptions',
    })
})