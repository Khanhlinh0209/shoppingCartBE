import { Router } from 'express'
import { uploadSingeImageController } from '~/controllers/media.controllers'
const mediasRouter = Router()

mediasRouter.post('/upload-image', uploadSingeImageController)

export default mediasRouter
