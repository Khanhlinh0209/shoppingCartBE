import express from 'express'
import { registerController } from '~/controllers/users.controllers'
import { registerValidator } from '~/middlewares/users.middlewares'
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
// usersRouter.post('/login', loginValidator, wrapAsync(loginController))

export default usersRouter
