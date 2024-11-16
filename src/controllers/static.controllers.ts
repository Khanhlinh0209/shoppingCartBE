import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/htppStatus'

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { namefile } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, namefile), (error) => {
    if (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Image not found'
      })
    }
  })
}
