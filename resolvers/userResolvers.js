import  { PubSub } from 'graphql-subscriptions'
import bcrypt from 'bcrypt'
import _ from 'lodash'

import {requiresAuth, requiresAdmin} from "../permissions"
import {createTokens, refreshTokens, SECRET } from '../auth'

const pubsub = new PubSub()

const USER_ADDED = 'USER_ADDED'

export default {
    Query: {
        allUsers: requiresAdmin.createResolver(async (parent, { page, pageSize = 10 }, { models }) => {
            const filter = {
                limit: pageSize,
                skip: (page - 1) * pageSize
            }
            const users = await models.User.find().limit(filter.limit).skip(filter.skip)
            return users.map(x => {
                x.password = '__SECRET__'
                return x
            })
        }),
        me: async (parent, args, { user, models }) => {
            const x = await models.User.findOne({ _id : user && user._id })
            if (!x) {
                return null
            }
            x.password = '__SECRET__'
            return x
        },
    }, 
    Mutation: {
        register: async (parent, args, { models }) => {
            const user = args
            
            user.password = await bcrypt.hash(user.password, 12)
            user.permissions = ['user']

            const newUser = await new models.User(user).save()
            newUser._id = newUser._id.toString()
            pubsub.publish(USER_ADDED, {
                userAdded: newUser
            })
            return newUser
        },
        login: async (parent, {username, password}, { models }) => {
            const user = await models.User.findOne({ username })
            if (!user) {
                throw new Error('No User found')
            } 
            const valid = await bcrypt.compare(password, user.password)
            if (!valid) {
                throw new Error('Invalid Password')
            }
            
            const [token, refreshToken] = await createTokens(user)
            
            return {
                token, 
                refreshToken,
            }
        },
        refreshTokens: requiresAuth.createResolver(async (parent, { token, refreshToken }, { models, user }) => {   
            const newTokens = await refreshTokens(token, refreshToken, models, JWT_SECRET)
            return {
                token: newTokens.token,
                refreshToken: newTokens.refreshToken
            }
        })
    },
    Subscription: {
        userAdded: {
            subscribe: () => pubsub.asyncIterator(USER_ADDED)
        }
        
    }
}