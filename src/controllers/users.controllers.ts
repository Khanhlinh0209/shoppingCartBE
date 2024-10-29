import { Request, Response } from 'express'
import { RegisterReqBody } from '~/models/requests/users.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email === 'linh123@gmail.com' && password === '123') {
    res.json({
      data: {
        fname: 'Linh',
        lname: 'Khanh'
      }
    })
  } else {
    res.status(400).json({
      error: 'Invalid email or password'
    })
  }
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const { email } = req.body
  // gọi service, tạo user từ email và password, lưu user đó vào users collection của mongo
  try {
    //kiểm tra email có trùng ko | tồn tại chưa | email có dùng chưa
    const isDup = await usersServices.checkEmailExist(email)
    if (isDup) {
      const customError = new Error('Email has been used')
      Object.defineProperty(customError, 'message', {
        enumerable: true
      })
      throw customError
    }
    const result = await usersServices.register(req.body)
    res.status(201).json({
      message: 'Register successfully',
      data: result
    })
  } catch (error) {
    res.status(422).json({
      message: 'Register failed',
      error
    })
  }
}
