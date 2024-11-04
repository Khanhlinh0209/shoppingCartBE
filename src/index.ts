import express from 'express'
import usersRouter from './routes/users.routers'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const app = express()

const PORT = 3000
app.use(express.json())

app.use('/users', usersRouter)

app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Project này đang chạy trên PORT ${PORT}`)
})

databaseService.connect()
