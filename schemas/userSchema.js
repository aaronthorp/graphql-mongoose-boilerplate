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
    register(username: String!, email: String!, password: String!): User!
    login(username: String!, password: String!): String!
    logout: String
`

const subscriptionDef = `
    userAdded: User!
`

export default {typeDef, queryDef, mutationDef, subscriptionDef}