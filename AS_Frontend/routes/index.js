var express = require('express');
var router = express.Router();
var request = require('request')

/* GET home page. */
router.get('/', function(req, res, next) {
  let url = 'http://localhost:4000/clients/getAll'
  request.get({
    url: url,
    json: true
  }, (err, response, data) => {
    if(err){
      console.log(err)
    } else {
      console.log(data)
      res.render('index', {clients: data});
    }
  }
  )  
})

module.exports = router;
