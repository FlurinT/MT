var express = require('express')
var router = express.Router()

let clientModel = require('../models/client')

router.post('/register', function(req, res, next) {
    let client_id = req.body.client_id
    let client_secret = req.body.client_secret
    let clientToStore = new clientModel({client_id, client_secret});
    clientToStore.save((err, createdClient) => {
        console.log("client created")
        console.log(createdClient)
        res.status(201)
        res.send(createdClient)
    })
})

router.get('/getAll', (req, res) => {
    clientModel.find({}, (err, storedClients) => {
        res.send(storedClients)
    })
})

module.exports = router;
