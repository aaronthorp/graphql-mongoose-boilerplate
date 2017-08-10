import express from 'express'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { createServer } from 'http'
import { makeExecutableSchema } from 'graphql-tools'
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import mongoose from 'mongoose'

import typeDefs from './schema'
import resolvers from './resolvers'

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

mongoose.connect('mongodb://localhost/test');

var Cat = mongoose.model('Cat', { name: String });

const PORT = 3030

const app = express()

app.use('/graphql', bodyParser.json(), graphqlExpress({
    schema,
    context: {
        Cat
    }
}))

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