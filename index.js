const express = require('express');
const app = express();

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.use(express.json());

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
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  console.log(`id: ${id}`);
  persons = persons.filter(person => person.id !== id);
  console.log(persons);
  res.status(204).end();
})

const generateId = () => {
  const id = Math.floor(Math.random() * 3000000);
  return id;
}

app.post('/api/persons/', (req, res) => {
  const body = req.body;

  if(!body.name) {
    return res.status(400).json({
      error: 'name missing'
    });
  } 
  if (!body.number) {
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

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  };

  persons = persons.concat(person);
  res.json(person);
  console.log(person);
});

const PORT = 3002;
app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`);
});