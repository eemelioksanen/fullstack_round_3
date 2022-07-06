const { response } = require('express')
const express = require('express')

const app = express()
app.use(express.json())
const cors = require('cors')

var morgan = require('morgan')

app.use(express.static('build'))

app.use(cors())

app.use(
    morgan(function (tokens, req, res) {
        var content = null
        if (String(tokens.method(req, res)) == 'POST') {
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
]

app.get('/api/persons', (req, res) => {
    res.send(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.get('/info', (req, res) => {
    const info = `
        <p>Phonebook has info for ${persons.length} people<p/>
        <p>${Date().toString()}</p>`

    res.send(info)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const person = req.body

    if (!(person.name && person.number)) {
        return res.status(400).json({
            error: 'content missing'
        })
    }

    if (persons.map(n => n.name).includes(person.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    person.id = Math.floor(Math.random() * 10000000)

    persons = persons.concat(person)

    res.json(person)

})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})