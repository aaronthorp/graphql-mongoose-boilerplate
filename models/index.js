import mongoose from 'mongoose'
import customId from 'mongoose-hook-custom-id'

import {Schema} from 'mongoose'
mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost/test', {
    useMongoClient: true,
})

// enforce String _id instead of ObjectID
mongoose.plugin(customId, {mongoose: mongoose})

const CatSchema = new Schema({ 
    name: String 
})

const Cat = mongoose.model('Cat', CatSchema)

const UserSchema = new Schema({ 
    username: String,
    email: String,
    password: String,
    permissions: [String],
})

const User = mongoose.model('Users', UserSchema)


const models = {
    Cat,
    User,
}

export default models