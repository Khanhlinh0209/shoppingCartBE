import express from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
//tạo router
const usersRouter = express.Router() //khai báo Router
//Router đăng nhập
// usersRouter.post('/login', loginValidator, loginController)

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

usersRouter.post('/register', registerValidator, registerController)
export default usersRouter
