require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person')

let persons = [
];

app.use(express.json());
app.use(cors());

app.use(express.static('dist'))

//Define a new morgan token for logging request body
morgan.token('body', (req) => {
  //Only log the body for POST requests and ensure it's a type that can be safely converted to JSON
  if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
    return JSON.stringify(req.body);
  }
  return '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/', (req, res) => {
    res.send('This is the root page');
});

app.get('/info', (req, res) => {
  const totalPersons = persons.length;
  const date = new Date();
  const responseText = `
    <p>Phonebook has info for ${totalPersons} people </p>
    <p>${date}</p>
  `;
  res.send(responseText);
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  })
});

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    res.json(person);
  });
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end();
})

const generateId = () => {
  const id = Math.floor(Math.random() * 3000000);
  return id;
}

app.post('/api/persons/', (req, res) => {
  const body = req.body;

  if(body.name === undefined) {
    return res.status(400).json({
      error: 'name missing'
    });
  } 
  if (body.number === undefined) {
    return res.status(400).json({
      error: 'number missing'
    });
  }  
  
  //This has to come after the error handling for the missing name
  //Otherwise, trying to call toLowerCase() on undefined will cause error, and crash the app
  const nameAlreadyExists = persons.some(person => person.name.toLowerCase() === body.name.toLowerCase());

  if (nameAlreadyExists) {
    return res.status(400).json({
      error: 'name must be unique'
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    res.json(savedPerson);
  });

});

const PORT = process.env.PORT;
app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`);
});