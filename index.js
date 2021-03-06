require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()
const cors = require('cors')
var morgan = require('morgan')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

app.use(
  morgan(function (tokens, req, res) {
    var content = null
    if (String(tokens.method(req, res)) === 'POST') {
      content = JSON.stringify(req.body)
    }
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      content
    ].join(' ')
  })
)

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
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

app.get('/info', (req, res) => {

  Person.countDocuments({}, (err, count, next) => {
    if (err) {
      next(err)
    } else {
      const info = `
      <p>Phonebook has info for ${count} people<p/>
      <p>${Date().toString()}</p>`
      res.send(info)
    }
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(person => {
      if (person) {
        res.status(204).end()
      } else {
        res.status(400).json({ error: 'that person was already deleted' })
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {

  const person = new Person({
    name: req.body.name,
    number: req.body.number
  })

  person.save().then(updated => {
    res.json(updated)
    console.log('person saved!')
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {

  const person_object = {
    name: req.body.name,
    number: req.body.number
  }

  Person.findByIdAndUpdate(
    req.params.id,
    person_object,
    { new: true, runValidators: true, context: 'query' },
  )
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    console.log(error.message)
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'TypeError') {
    console.log(error.message)
    return res.status(400).send({ error: error.message })
  } else if (error.name === 'ValidationError') {
    console.log(error.message)
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})