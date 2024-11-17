import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFormFile, handlerUploadImage, handlerUploadVideo } from '~/utils/file'
import fs from 'fs'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'

class MediasServices {
  async handleUploadImage(req: Request) {
    const files = await handlerUploadImage(req)

    const result = await Promise.all(
      files.map(async (file) => {
        const newFileName = getNameFormFile(file.newFilename) + '.jpg'
        // đường dẫn đến file mơi slaf
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFileName
        await sharp(file.filepath).jpeg().toFile(newPath)
        //set up đường link
        fs.unlinkSync(file.filepath) //xóa hình cũ
        const url: Media = {
          url: `http://localhost:3000/static/image/${newFileName}`, //
          type: MediaType.Image
        }
        return url
      })
    )

    return result
  }
  async handleUploadVideo(req: Request) {
    const files = await handlerUploadVideo(req)

    const result = await Promise.all(
      files.map(async (file) => {
        const url: Media = {
          url: `http://localhost:3000/static/video/${file.newFilename}`, //
          type: MediaType.Video
        }
        return url
      })
    )
    return result
  }
}

const mediasServices = new MediasServices()
export default mediasServices
