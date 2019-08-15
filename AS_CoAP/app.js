const Router = require("coap-router");
const app = Router();

app.get("/Token", (req, res) => {



    res.end('Token endpoint')
})

app.get("/Introspection", (req, res) => {
    res.end('Introspection endpoint')
})

module.exports = app;