//tạo hàm nhận vào content mã hóa thành SHA256
import dotenv from 'dotenv'
dotenv.config()
import { createHash } from 'crypto'

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

//tạo hàm nhận vào password và mã hóa sha256
export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
