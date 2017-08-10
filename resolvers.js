import  { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()

const CAT_ADDED = 'CAT_ADDED'

export default {
    Query: {
        allCats: async (parent, args, { Cat }) => {
            const cats = await Cat.find()
            return cats.map(x => {
                x._id = x._id.toString()
                return x
            })
        }
    }, 
    Mutation: {
        createCat: async (parent, args, { Cat }) => {
            const kitty = await new Cat(args).save()
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