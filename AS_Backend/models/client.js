let mongoose = require('mongoose')

let clientSchema = new mongoose.Schema({
    client_id: {
        type: String,
        unique: true
    },
    client_secret: {
        type: String
    }
})

const Client = mongoose.model('Client', clientSchema)

module.exports = Client
