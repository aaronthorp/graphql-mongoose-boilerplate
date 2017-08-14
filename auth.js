import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import _ from 'lodash'

const createTokens = async (user, secret) => {
    const createToken = jwt.sign(
        {
            user: _.pick(user, ['_id', 'username'])
        },
        secret,
        {
            expiresIn: '10m'
        }
    )
    
    const createRefreshToken = jwt.sign(
        {
            user: _.pick(user, '_id')
        },
        secret,
        {
            expiresIn: '7d'
        }
    )

    return Promise.all([createToken, createRefreshToken])

}

export const refreshTokens = async (token, refreshToken, models, SECRET) => {
    let userId = -1
    try {
        const {_id} = jwt.verify(refreshToken, SECRET)
        userId = _id
    } catch (e) {
        return {}
    }

    const user = await models.User.findOne({ _id: userId })
    const [newToken, newRefreshToken] = await createTokens(user, SECRET)
    return {
        token: newToken,
        refreshToken: newRefreshToken,
        user,
    }
}

export const tryLogin = async (username, password, models, SECRET) => {
    const user = await models.User.findOne({ username })
    if (!user) {
        throw new Error('User not found')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
        throw new Error('Invalid password')
    }

    const [token, refreshToken] = await createTokens(user, SECRET)

    return token, refreshToken
}