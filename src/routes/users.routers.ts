import express, { Request, Response } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  RefreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { wrapAsync } from '~/utils/handlers'
//tạo router
const usersRouter = express.Router() //khai báo Router
/*
  desc: Resister a new user
  path: /register
  method: POST
  body: {
    name: String,
    email: String,
    password: String
    confirm_password: String
    date_of_birth: string có cấu trúc ISO08601

  }
*/

usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/*
des: login
path: users/login
method: POST
body: {
  email: String,
  password: String
}
*/
usersRouter.post('/login', loginValidator, wrapAsync(loginController))

/*
desc: logout
path: users/logout
method: POST
hearders {
  Authorization: 'Bearer <access_token>'
}
body : {
  refresh_token: String
}

*/

usersRouter.post('/logout', accessTokenValidator, RefreshTokenValidator, wrapAsync(logoutController))
export default usersRouter
