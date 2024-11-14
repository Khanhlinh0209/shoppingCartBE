import { Request, Response, NextFunction } from 'express'
import formidable from 'formidable'
import path from 'path'
import HTTP_STATUS from '~/constants/htppStatus'
export const uploadSingeImageController = async (
  req: Request, //
  res: Response,
  next: NextFunction
) => {
  //console.log(__dirname) //đường dẫn đến forder chứa file này
  //console.log(path.resolve('uploads')) //đường dẫn mà mình mong muốn lưu file vào

  //set up tấm lưới chặn
  const form = formidable({
    maxFields: 1, //tối đa một file
    maxFileSize: 3 * 1024, //300kb
    keepExtensions: true, // giữa lại đuôi file đó
    uploadDir: path.resolve('uploads')
  })
  //ép req đi qua đi cái lưới
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    } else {
      res.status(HTTP_STATUS.OK).json({
        message: 'Upload image successfully'
      })
    }
  })
}
