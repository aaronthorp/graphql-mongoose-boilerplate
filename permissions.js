import _ from 'lodash'

const createResolver = (resolver) => {
    const baseResolver = resolver

    baseResolver.createResolver = (childResolver) => {
        const newResolver = async (parent, args, context) => {
            await resolver(parent, args, context)
            return childResolver(parent, args, context)
        }
        return createResolver(newResolver)
    }

    return baseResolver
}

export const requiresAuth = createResolver(async (parent, args, context) => {
    if (!context.user) {
        throw new Error('Not authenticated')
    }
})

export const requiresAdmin = requiresAuth.createResolver(async (parent, args, {models, user}) => {
    // check admin against database not token
    var u = await models.User.findOne({_id: user._id})
    if (!_.includes(u.permissions, 'admin')) {
        throw new Error('Not administrator')
    }
    //put the current user details back into the resolve chain
    user = _.omit(u, 'password')
})

