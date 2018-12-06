const express = require('express');
const morgan = require('morgan');;

const app = express();
app.use(morgan('combined'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/heartbeat.json')
});

var listener = app.listen(process.env.PORT || 8080, function() {
 console.log('listening on port ' + listener.address().port);
});