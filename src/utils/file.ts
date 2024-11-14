import path from 'path'
import fs from 'fs' //module chứa các method xử lý file
export const initFolder = () => {
  //lưu đường dẫn sẽ lưu file
  const uploadsFolderPath = path.resolve('uploads')
  //truy vết đường link trên xem có đến được thư mục nào không
  //nếu mà tìm không được thì tạo mới thư mục
  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath, {
      recursive: true //cho phép tạo lồng thư viện
    })
  }
}
