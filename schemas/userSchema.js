const typeDef = `
    type User {
        _id: String!
        username: String!
        email: String!
        password: String!
        permissions: [String]
    }

    type AuthPayload {
        token: String!
        refreshToken: String!
    }

`

const queryDef = `
    allUsers: [User!]!
    me: User
`

const mutationDef = `
    register(username: String!, email: String!, password: String!): User!
    login(username: String!, password: String!): AuthPayload!
    refreshTokens(token: String!, refreshToken: String!): AuthPayload!
`

const subscriptionDef = `
    userAdded: User!
`

export default {typeDef, queryDef, mutationDef, subscriptionDef}