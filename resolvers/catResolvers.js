import  { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()

const CAT_ADDED = 'CAT_ADDED'

export default {
    Query: {
        allCats: async (parent, args, { models }) => {
            const cats = await models.Cat.find()
            return cats.map(x => {
                x._id = x._id.toString()
                return x
            })
        }
    }, 
    Mutation: {
        createCat: async (parent, args, { models }) => {
            const kitty = await new models.Cat(args).save()
            kitty._id = kitty._id.toString()
            pubsub.publish(CAT_ADDED, {
                catAdded: kitty
            })
            return kitty
        }
    },
    Subscription: {
        catAdded: {
            subscribe: () => pubsub.asyncIterator(CAT_ADDED)
        }

    }
}