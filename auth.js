import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import _ from 'lodash'

import models from './models'

const JWT_SECRET = "test"

export const createTokens = async (user) => {
    const createToken = jwt.sign(
        {
            user: _.pick(user, ['_id', 'username', 'permissions'])
        },
        JWT_SECRET,
        {
            expiresIn: '10m'
        }
    )
    
    const createRefreshToken = jwt.sign(
        {
            user: _.pick(user, '_id')
        },
        JWT_SECRET,
        {
            expiresIn: '7d'
        }
    )
    
    return Promise.all([createToken, createRefreshToken])
    
}

export const checkUserMiddleware = async (req, res, next) => {
    const token = req.headers['x-token']
    
    if (token) {
        try {
            const { user } = await jwt.verify(token, JWT_SECRET)
            req.user = user
        } catch (e) {
            const refreshToken = req.headers['x-refresh-token']
            const newTokens = await refreshTokens(
                token, 
                refreshToken,
                models,
                JWT_SECRET,
            )
            if (newTokens.token && newTokens.refreshToken) {
                res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token')
                res.set('x-token', newTokens.token)
                res.set('x-refresh-token', newTokens.refreshToken)
            }
            req.user = newTokens.user
        }   
    } 
    
    next()
}

export const refreshTokens = async (token, refreshToken, models) => {
    let userId = -1
    try {
        const {_id} = jwt.verify(refreshToken, JWT_SECRET)
        userId = _id
    } catch (e) {
        return {}
    }
    
    const user = await models.User.findOne({ _id: userId })
    const [newToken, newRefreshToken] = await createTokens(user)
    return {
        token: newToken,
        refreshToken: newRefreshToken,
        user,
    }
}

export const tryLogin = async (username, password, models) => {
    const user = await models.User.findOne({ username })
    if (!user) {
        throw new Error('User not found')
    }
    
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
        throw new Error('Invalid password')
    }
    
    const [token, refreshToken] = await createTokens(user)
    
    return token, refreshToken
}
