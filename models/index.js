import mongoose from 'mongoose'

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost/test')

var Cat = mongoose.model('Cat', { 
    name: String 
})

var User = mongoose.model('Users', { 
    username: String,
    email: String,
    password: String
})

const models = {
    Cat,
    User,
}

export default models