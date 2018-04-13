const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Connecting to database
mongoose.connect('mongodb://localhost/leadgo');
mongoose.Promise = global.Promise;

//Creating an express app
const app = express();

//Middleware

//Pretty prints the JSON response
app.set('json spaces', 2);

//Body parser parses the data in the body of request to JSON format
app.use(bodyParser.json());

//Sends the request to route handlers
app.use(require('./routes/api'));

//Listening to port waiting for a response
app.listen(process.env.port||3000,function(){
    //Shows message upon success
    console.log('Listening to port 3000');
});
