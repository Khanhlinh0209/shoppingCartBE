import express, { Router } from 'express'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { serveImageController, serveVideoController } from '~/controllers/static.controllers'
const staticRouter = Router()

staticRouter.get('/image/:namefile', serveImageController)

// staticRouter.get('/video/:namefile', serveVideoController)
staticRouter.use('/video', express.static(UPLOAD_VIDEO_DIR))

export default staticRouter
