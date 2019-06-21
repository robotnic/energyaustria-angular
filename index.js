var express = require('express');
var request = require('request');
var app = express();

const PORT = process.env.PORT || 3000
const baseUrl = 'https://entsoe.herokuapp.com'



app.all('/api/**', function(req, res) {
  console.log(req.url);
  var options = {
    uri: baseUrl + req.url,
    method: req.method
  }
  console.log(options);
  request(options, function(err, response, body) {
    res.send(body);
  });
})


app.use(express.static('dist/energy'));

app.get('*', (req, res) => {
  res.sendFile('./dist/energy/index.html');
});


app.listen(PORT, function () {
  console.log('Example app listening on port ' + PORT + '!');
});
