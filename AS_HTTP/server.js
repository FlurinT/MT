const fastify = require('fastify')({ logger: true })
fastify.register(require('fastify-formbody'))

const jwt = require('jsonwebtoken')
const cwtClass = require('@netnexus/node-cborwebtoken').Cborwebtoken
let cwt = new cwtClass()



const reg_Clients = { 
  'client0':{
    'client_secret':'secret0'
  }
}

fastify.post('/token', async (req, res) => {
  console.log(req.body)
  // ToDo: put req check and error res in other function, only 201 res here
  // check if application/x-www-form-urlencoded
  if(req.headers['content-type'] !== 'application/x-www-form-urlencoded'){
    // error
    res.code(400).type('application/json; charset=utf-8')
    return{'error':'invalid_req'}
  }
  if(!reg_Clients.hasOwnProperty(req.body['client_id'])){
    res.code(401).type('application/json; charset=utf-8')
    return{'error':'invalid_client'}
  }
  res.code(201).type('application/json; charset=utf-8')
  return {
    "access_token":"2YotnFZFEjr1zCsicMWpAA",
    "token_type":"example",
    "expires_in":3600,
    "example_parameter":"example_value"
  }
})

fastify.post('/tokenjwt', async (req, res) => {
  console.log(req.body)
  // ToDo: put req check and error res in other function, only 201 res here
  // check if application/x-www-form-urlencoded
  if(req.headers['content-type'] !== 'application/x-www-form-urlencoded'){
    // error
    res.code(400).type('application/json; charset=utf-8')
    return{'error':'invalid_req'}
  }
  if(!reg_Clients.hasOwnProperty(req.body['client_id'])){
    res.code(401).type('application/json; charset=utf-8')
    return{'error':'invalid_client'}
  }

  let jwtClaims = {
    issuer:  'example',
    subject:  'example',
    expiresIn:  '12h',
    audience:  'example',
  }
  let jwtHeader = {
    'algorithm': 'HS512'
  }

  let jwtToken = jwt.sign(jwtClaims, 'example', jwtHeader)

  res.code(201).type('application/json; charset=utf-8')
  return {
    "access_token":jwtToken,
    "token_type":"example",
    "expires_in":jwtClaims.expiresIn,
    "example_parameter":"example_value"
  }
})

fastify.post('/tokencbor', async (req, res) => {
  console.log(req.body)
  // ToDo: put req check and error res in other function, only 201 res here
  // check if application/x-www-form-urlencoded
  if(req.headers['content-type'] !== 'application/x-www-form-urlencoded'){
    // error
    res.code(400).type('application/json; charset=utf-8')
    return{'error':'invalid_req'}
  }
  if(!reg_Clients.hasOwnProperty(req.body['client_id'])){
    res.code(401).type('application/json; charset=utf-8')
    return{'error':'invalid_client'}
  }

  const payload = { iss: "coap://as.example.com", sub: "erikw", aud: "coap://light.example.com", exp: 1444064944, nbf: 1443944944, iat: 1443944944, cti: Buffer.from("0b71", "hex") };
  const secret = "my-test-secret";
  let cwtToken
  await cwt.mac(payload, secret).then((token) => {
     cwtToken = token
  });

  const cwtDec = cwt.decode(cwtToken);
  console.log('#########')
  console.log(cwtDec)
  
  res.code(201).type('application/json; charset=utf-8')
  return {
    "access_token":cwtToken,
    "token_type":"example",
    "expires_in":payload.exp,
    "example_parameter":"example_value"
  }
})

const start = async () => {
  try {
    await fastify.listen(3030)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()