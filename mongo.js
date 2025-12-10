const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('usage:')
  console.log('  node mongo.js <password>           → list phonebook')
  console.log('  node mongo.js <password> <name> <number>  → add entry')
  process.exit(1)
}
const password = process.argv[2]


const url = `mongodb+srv://giannipasquinelli_db_user:${password}@clusterfso.kfxeyyr.mongodb.net/phonebook?appName=ClusterFSO`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
 number: {
  type: String,
  minLength: 8,
  validate: {
    validator: function(v) {
      return /^\d{2,3}-\d+$/.test(v)
    },
    message: props => `${props.value} is not a valid phone number!`
  },
  required: true
}
})

const Phone = mongoose.model('Phone', phoneSchema)

// const phone = new Phone({
//   name?,
//   number?,
// })

// phone.save().then(result => {
//   console.log(`phone ${number} saved! at ${name}` )
//   mongoose.connection.close()
// })  

if (process.argv.length === 3) {
  Phone.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(p => {
      console.log(`${p.name} ${p.number}`)
    })
    mongoose.connection.close()
  })
}

// 👉 MODO 2: AGREGAR (password + name + number)
if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const entry = new Phone({ name, number })

  entry.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

// Phone.find({}).then(result => {
//   result.forEach(phone => {
//     console.log(phone)
//   })
//   mongoose.connection.close()
// })