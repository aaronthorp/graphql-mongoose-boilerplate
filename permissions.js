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

export const requiresAuth = createResolver((parent, args, context) => {
    if (!context.user) {
        throw new Error('Not authenticated')
    }
})

export const requiresAdmin = requiresAuth.createResolver((parent, args, context) => {
    // check admin against database not token
    var user = context.models.User.findOne({_id: context.user._id})
    if (!user.isAdmin) {
        throw new Error('Not administrator')
    }
})

