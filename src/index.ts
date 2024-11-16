import express from 'express'
import usersRouter from './routes/users.routers'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routers'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routers'

const app = express()

const PORT = 3000
databaseService.connect()
initFolder()
app.use(express.json())

app.use('/users', usersRouter)

app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Project này đang chạy trên PORT ${PORT}`)
})

databaseService.connect()
