import  { PubSub } from 'graphql-subscriptions'
import bcrypt from 'bcrypt'

const pubsub = new PubSub()

const USER_ADDED = 'USER_ADDED'

export default {
    Query: {
        allUsers: async (parent, args, { User }) => {
            const users = await User.find()
            return users.map(x => {
                x._id = x._id.toString()
                return x
            })
        }
    }, 
    Mutation: {
        register: async (parent, args, { User }) => {
            const user = args
            user.password = await bcrypt.hash(user.password, 12)
            const newUser = await new User(user).save()
            newUser._id = newUser._id.toString()
            pubsub.publish(USER_ADDED, {
                userAdded: newUser
            })
            console.log(user, newUser)
            return newUser
        },
        login: async (parent, args, { User }) => {

        }

    },
    Subscription: {
        userAdded: {
            subscribe: () => pubsub.asyncIterator(USER_ADDED)
        }

    }
}