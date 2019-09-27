const Router = require("coap-router");
const rs_router = Router();

coap_router.get("/authz-info", async (req, res) => {

})

coap_router.get("/temperature", (req, res) => {
    res.end('39.9c')
})


module.exports = coap_router;