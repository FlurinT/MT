const fastify = require('fastify')({ logger: false })
fastify.register(require('fastify-formbody'))

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

const start = async () => {
  try {
    await fastify.listen(80)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()