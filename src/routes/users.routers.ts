import express, { Request, Response } from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  verifyEmailTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
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

/*
decs: verify email
Khi người dùng nhấn cào linl có trong email của họ
thì evt sẽ được fuiwr lên server thông qua req.body
path: users/verify-token/?email_verify_token=string
method: GET
*/
usersRouter.get('/verify-email/', emailVerifyTokenValidator, wrapAsync(verifyEmailTokenController))

/*
  decs: resend email verify token
  người dùng chức năng này khi làm mất, lạc
  phải đăng nhập thì mới cho verify
  hearder {
    Authorization: 'Bearer <access_token>'
  }
  method: POST
*/

usersRouter.post(
  '/resend-verify-email',
  accessTokenValidator, //
  wrapAsync(resendVerifyEmailController)
)

/*
  decs: forgot password
  khi quyên mật khẩu thì sài chức năng này
  path: users/forgot-password
  body: {
    email: String
    }
  method: POST
*/
usersRouter.post(
  '/forgot-password',
  forgotPasswordValidator, //
  wrapAsync(forgotPasswordController)
)
export default usersRouter
