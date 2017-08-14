import _ from 'lodash'
import CatSchema from './catSchema'
import UserSchema from './userSchema'

const allSchemas = [
    CatSchema,
    UserSchema
]

let typeSchema = []
let querySchema = []
let mutationSchema = []
let subscriptionSchema = []

_.map(allSchemas, shard => {
    typeSchema.push(shard.typeDef)
    querySchema.push(shard.queryDef)
    mutationSchema.push(shard.mutationDef)
    subscriptionSchema.push(shard.subscriptionDef)
})

typeSchema = typeSchema.join('\n')
querySchema = querySchema.join('\n')
mutationSchema = mutationSchema.join('\n')
subscriptionSchema = subscriptionSchema.join('\n')

const schema = `

    ${typeSchema}

    type Query {
        ${querySchema}
    }

    type Mutation {
        ${mutationSchema}
    }

    type Subscription {
        ${subscriptionSchema}
    }

    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`

//console.log(schema)
export default schema 