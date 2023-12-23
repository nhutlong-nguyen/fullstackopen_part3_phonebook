require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint'})
}

app.use(express.json()) //should be the very first middleware loaded into Express
app.use(cors())
app.use(express.static('dist'))

//Define a new morgan token for logging request body
morgan.token('body', (req) => {
  //Only log the body for POST requests and ensure it's a type that can be safely converted to JSON
  if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (req, res) => {
    res.send('This is the root page')
})

app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      const date = new Date()
      const responseText = `
        <p>Phonebook has info for ${count} people </p>
        <p>${date}</p>
      `
      res.send(responseText)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons/', (req, res, next) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({ error: 'name missing' })
  } 
  if (!body.number) {
    return res.status(400).json({ error: 'number missing' })
  }

  const person = new Person({
     name: body.name,
     number: body.number
  })

  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        res.json(updatedPerson)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`)
})