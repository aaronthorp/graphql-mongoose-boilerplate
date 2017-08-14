import  { PubSub } from 'graphql-subscriptions'
import bcrypt from 'bcrypt'
import _ from 'lodash'
import jwt from 'jsonwebtoken'

import {requiresAuth, reqiresAdmin} from "../permissions"

import { JWT_SECRET } from '../secret'
import { refreshTokens } from '../auth'

const pubsub = new PubSub()

const USER_ADDED = 'USER_ADDED'

export default {
    Query: {
        allUsers: requiresAuth.createResolver(async (parent, args, { models }) => {
            const users = await models.User.find()
            return users.map(x => {
                x._id = x._id.toString()
                x.password = '__SECRET__'
                return x
            })
        }),
        me: async (parent, args, { user, models }) => {
            const x = await models.User.findOne({ _id : user && user._id })
            if (!x) {
                return null
            }
            x._id = x._id.toString()
            x.password = '__SECRET__'
            return x
        },
    }, 
    Mutation: {
        register: async (parent, args, { models }) => {
            const user = args
            user.password = await bcrypt.hash(user.password, 12)
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
            
            const token = await jwt.sign(
                {
                    user: _.pick(user, ['_id', 'username'])
                }, 
                JWT_SECRET, 
                {
                    expiresIn: '10m'
                }
            )
            
            const refreshToken = await jwt.sign(
                {
                    _id: user._id,
                }, 
                JWT_SECRET, 
                {
                    expiresIn: '30d'
                }
            )
            return { token, refreshToken }
        },
        refreshTokens: async (parent, { token, refreshToken }, { models }) => {
            const newTokens = await refreshTokens(token, refreshToken, models, JWT_SECRET)
            return {
                token: newTokens.token,
                refreshToken: newTokens.refreshToken
            }
        } 
    },
    Subscription: {
        userAdded: {
            subscribe: () => pubsub.asyncIterator(USER_ADDED)
        }
        
    }
}

const generateTokens = (user) => {
    
}