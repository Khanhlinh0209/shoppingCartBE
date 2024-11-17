import fs from 'fs' //module chứa các method xử lý file
import { Request } from 'express'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import formidable, { File } from 'formidable'
export const initFolder = () => {
  //lưu đường dẫn sẽ lưu file

  //truy vết đường link trên xem có đến được thư mục nào không
  //nếu mà tìm không được thì tạo mới thư mục
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true //cho phép tạo lồng thư viện
      })
    }
  })
}

//Tạo hàm handlerUploadImage: Hàm nhận vào req
//ép người dùng phải đi qua tấm lưới lọc formidable
//từ đó lấy được các file trong req, chỉ chọn ra các file là image
//return file đó ra ngoài

export const handlerUploadImage = async (req: Request) => {
  //tạo lưới lọc từ forrmidable
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4, //tối đa một hình
    maxFileSize: 300 * 1024,
    maxTotalFileSize: 300 * 1024 * 4,
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      //name: là file được gửi thông qua form <input name="file">
      //originalFilename: tên gốc của file
      //mimeType: Kiểu định dạng file 'video/mp4 | image/png'
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        form.emit('error' as any, new Error('File Type Invalid') as any)
      }
      return true
    }
  })
  //có lưới thì ép req vào
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        return reject(error)
      }
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image)
    })
  })
}

export const handlerUploadVideo = async (req: Request) => {
  //tạo lưới lọc từ forrmidable
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1, //tối đa một hình
    maxFileSize: 50 * 1024 * 1024,
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      //name: là file được gửi thông qua form <input name="file">
      //originalFilename: tên gốc của file
      //mimeType: Kiểu định dạng file 'video/mp4 | image/png'
      const valid = name === 'video' && Boolean(mimetype?.includes('video'))
      if (!valid) {
        form.emit('error' as any, new Error('File Type Invalid') as any)
      }
      return true
    }
  })
  //có lưới thì ép req vào
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        return reject(error)
      }
      if (!files.video) {
        return reject(new Error('Video is empty'))
      }
      return resolve(files.video)
    })
  })
}
//viết hàm nhận vào fullFileName và chỉ lấy tên và bỏ đuôi
//anh1.png
export const getNameFormFile = (fileName: string) => {
  const nameArr = fileName.split('.')
  nameArr.pop()
  return nameArr.join('-')
}
