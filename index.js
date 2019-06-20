var express = require('express');
var app = express();

const PORT = process.env.PORT || 3000


app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use(express.static('dist/energy'));


app.listen(PORT, function () {
  console.log('Example app listening on port ' + PORT + '!');
});
