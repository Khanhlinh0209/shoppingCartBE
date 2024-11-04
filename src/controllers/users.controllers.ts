import { NextFunction, Request, Response } from 'express'
import { LoginReqBody, RegisterReqBody } from '~/models/requests/users.request'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/htppStatus'
import dotenv from 'dotenv'
import { USERS_MESSAGES } from '~/constants/message'
dotenv.config()

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  // gọi service, tạo user từ email và password, lưu user đó vào users collection của mongo

  //kiểm tra email có trùng ko | tồn tại chưa | email có dùng chưa
  const isDup = await usersServices.checkEmailExist(email)
  if (isDup) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
    })
  }
  const result = await usersServices.register(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  //cần lấy email cà password để tìm xem user nào đang sở hữu
  //nếu ko có thì user nào ngừng cuộc chơi
  //nếu có thì tạo at ref
  const { email, password } = req.body
  const result = await usersServices.login({ email, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result //ac rf
  })
}
