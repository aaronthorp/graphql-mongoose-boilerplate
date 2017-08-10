export default `

    type Cat {
        _id: String!
        name: String!
    }

    type Query {
        allCats: [Cat!]!
    }

    type Mutation {
        createCat(name: String!): Cat!
    }

    type Subscription {
        catAdded: Cat!
    }

    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`