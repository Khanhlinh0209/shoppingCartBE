import express from 'express'
import usersRouter from './routes/users.routers'
import databaseService from './services/database.services'

const app = express()

const PORT = 3000
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/users', usersRouter)

app.listen(PORT, () => {
  console.log(`Project này đang chạy trên PORT ${PORT}`)
})

databaseService.connect()
