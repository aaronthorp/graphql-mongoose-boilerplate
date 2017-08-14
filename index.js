import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { createServer } from 'http'
import { makeExecutableSchema } from 'graphql-tools'
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import cors from 'cors'

import { checkUserMiddleware, refreshTokens } from './auth'

import typeDefs from './schemas'
import resolvers from './resolvers'

import models from './models'

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

const PORT = 3030

const app = express()

app.use(cors('*'))

app.use(checkUserMiddleware)

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