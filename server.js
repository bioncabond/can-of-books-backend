'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
//Bring in the Mongo 
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3001;


//Create a collection called booksdatabase
mongoose.connect(process.env.MONGO_CONNECTION_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true }
);



//Bring in modules and setting up the database
let bookModel = require('./Modules/model.js');
let bookSchema = require('./Modules/schema.js');
const DatabaseEntry = mongoose.model('booksdatabase', bookSchema);


//Testing Route set-up 
app.get('/', (request, response) => response.status(200).send('This is the root. It works!'));


app.get('/test', (request, response) => {
  response.send('test request received')
})

app.get('/seed', seed);

app.get('/find', searchDatabase);

app.get('/books', (request, response) => {
  console.log(request.query);
  searchDatabase(request, response)
}
)



//assign connection to a variable
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));

db.once('open', () => console.log('mongo database is connected!'));

app.listen(PORT, () => console.log(`listening on ${PORT}`));


//Find All the entries in the database
DatabaseEntry.find((err, item) => {
  if (err) return console.error(err);
  console.log(item);
})

function seed(req, res) {
  const seedArr = [
    {
      name: 'Bionca', description: 'Baller', status: 'struggling', email: 'bionca@aol.com',
    },
    {
      name: 'Jae', description: 'avid reader', status: 'still here', email: 'wethebestmusic@gmail.net',
    },
    {
      name: 'JP', description: 'flawless', status: 'ghost', email: 'jp@teachers-R-us.com',
    },
  ]
  seedArr.forEach(user => {
    let entry = new DatabaseEntry(user);
    entry.save();
  })
  res.status(200).send('Seeded Database');
}

async function searchDatabase(req, res) {
  console.log(req)
  if (req.query.email) {
    let { email } = req.query;
    let filterQuery = {};
    filterQuery.email = email;
    const item = await DatabaseEntry.find(filterQuery);
    res.status(200).send(item);
  }
  else {
    res.status(200).send([]);
  }
}
