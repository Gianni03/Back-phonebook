require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Phone = require('./models/phone')

const app = express()
app.use(express.json())
morgan.token('body', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('dist'))


let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.get('/api/persons', (request, response) => {
  Phone.find({}).then(phones => {
    response.json(phones)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Phone.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})
app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  const updatedPerson = {
    name,
    number,
  }

  Phone.findByIdAndUpdate(
    req.params.id,
    updatedPerson,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updated => {
      if (updated) {
        res.json(updated)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})



app.delete('/api/persons/:id', (request, response, next) => {
  Phone.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (body.name === undefined) {
    return res.status(400).json({ error: 'name missing' })
  }

  const phone = new Phone({
    name: body.name,
    number: body.number,
  })

  phone.save().then(savedPhone => {
    res.json(savedPhone)
  })
})

app.get('/info', (req, res) => {
  Phone.countDocuments({}).then(count => {
    const infoDate = new Date()
    res.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${infoDate}</p>
    `)
  })
})
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
