const typeDef = `
    type User {
        _id: String!
        username: String!
        email: String!
        password: String!
    }
`

const queryDef = `
    allUsers: [User!]!
`

const mutationDef = `
    createUser(username: String!, email: String!, password: String!): User!
`

const subscriptionDef = `
    userAdded: User!
`

export default {typeDef, queryDef, mutationDef, subscriptionDef}