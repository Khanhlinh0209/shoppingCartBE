//file này lưu hàm dùng để tạo ra token
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { TokenPayload } from '~/models/requests/users.request'
dotenv.config()

export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) throw reject(error)
      else return resolve(token as string)
    })
  })
}

//làm hàm giúp kiểm 1 troken có đúng với chữ kus hay không
//nếu đúng thì trả payload đàn có trong token đó
export const verifyToken = ({ token, privateKey }: { token: string; privateKey: string }) => {
  //trả về JwtPayload(thông tin người gữi req) nếu token hợp lệ
  return new Promise<TokenPayload>((resolve, reject) => {
    //method này sẽ verify token, nếu token hợp lệ thì nó sẽ trả về payload
    //nếu token không hợp lệ thì nó sẽ throw error
    //privateKeyy dùng để verify token
    //nếu token được tạo ra bằng secret|PublicKey thì ta dùng secret|PublicKey key để verify
    //từ đó biết rằng access_token được tạo bởi chính server
    jwt.verify(token, privateKey, (error, decode) => {
      if (error) throw reject(error)
      else return resolve(decode as TokenPayload)
    })
  })
}
