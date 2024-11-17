import express, { Request, Response } from 'express'
import {
  changePasswordController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyEmailTokenController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleare } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/users.request'
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
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*
decs: verify email
Khi người dùng nhấn vào linl có trong email của họ
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

/* decs:verify forgot password token
kiểm tra forgot password tokencó còn hiệu lực ko
path: users/verify-forgot-password
method: POST
body: {
  forgot_password_token: string}
*/

usersRouter.post(
  '/verify-forgot-password', //
  forgotPasswordTokenValidator, //kiểm tra forgot_password_token
  wrapAsync(verifyForgotPasswordTokenController) //xử lý logic verify forgot_password_token
)

/*
decs: reset password
path: users/reset-password
method: POST
body: {
  password: string
  confirm_password: string
  forgot_password_token: string
}
*/
usersRouter.post(
  '/reset-password', //
  forgotPasswordTokenValidator,
  resetPasswordValidator, //kiểm tra password, confirm_password, forgot_password_token
  wrapAsync(resetPasswordController) //xử lý logic reset password
)

/*
  decs: get profile của user
  path:'/me'
  method: POST
  header: {
    Authorization: 'Bearer <access_token>'
  }
  body {}

*/
usersRouter.post('/me', accessTokenValidator, wrapAsync(getMeController))

/*
des: update profile của user
path: '/me'
method: patch
Header: {Authorization: Bearer <access_token>}
body: {
  name?: string
  date_of_birth?: Date
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional}
*/

usersRouter.patch(
  '/me', //
  //cần một hàm sàn lọc req.body
  filterMiddleare<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  accessTokenValidator,
  updateMeValidator,
  wrapAsync(updateMeController)
)

/*
decs: change password
đổi mật khẩu
path: users/change-password
method: put
headers: {
  Authorization: 'Bearer <access_token>'
}
body: {
  old_password: string
  password: string
  confirm_password: string
}
*/

usersRouter.put(
  '/change-password', //
  accessTokenValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

/*
decs: refresh token
chức năng này dùng khi ac hết hạn, cần lấy ac mới (quà tặng kèm rf mới)
path: users/refresh-token
method: POST
body: {
  refresh_token: string
}
*/
usersRouter.post(
  '/refresh-token', //
  refreshTokenValidator,
  wrapAsync(refreshTokenController)
)
export default usersRouter
