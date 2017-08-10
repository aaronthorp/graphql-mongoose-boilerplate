const typeDef = `
    type Cat {
        _id: String!
        name: String!
    }
`

const queryDef = `
    allCats: [Cat!]!
`

const mutationDef = `
    createCat(name: String!): Cat!
`

const subscriptionDef = `
    catAdded: Cat!
`

export default {typeDef, queryDef, mutationDef, subscriptionDef}