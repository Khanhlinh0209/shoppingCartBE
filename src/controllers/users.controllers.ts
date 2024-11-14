import { NextFunction, Request, Response } from 'express'
import {
  ChangePasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyEmailReqQuery,
  VerifyForgotPasswordTokenReqBody
} from '~/models/requests/users.request'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/htppStatus'
import dotenv from 'dotenv'
import { USERS_MESSAGES } from '~/constants/message'
import { UserVerifyStatus } from '~/constants/enums'
import { result } from 'lodash'
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

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  //xem thử user_id trong payload của refresh_token có giống không
  const { refresh_token } = req.body
  const { user_id: user_id_at } = req.decode_authorization as TokenPayload
  const { user_id: user_id_rf } = req.decode_refresh_token as TokenPayload
  if (user_id_at !== user_id_rf) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
    })
  }
  // nếu mà trùng rồi thì mình xem thử refresh_token có được quyền dùng dịch vụ không
  await usersServices.checkRefreshToken({
    user_id: user_id_at,
    refresh_token
  })
  //khi nào có mã đó trong database thì mình tiến hành logout (xóa rf khỏi hệ thống)
  await usersServices.logout(refresh_token)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

export const verifyEmailTokenController = async (
  req: Request<ParamsDictionary, any, any, VerifyEmailReqQuery>,
  res: Response,
  next: NextFunction
) => {
  //khi họ ấn vào link, thì họ sẽ gửi email_verify_token lên thông qua
  //req.boby
  const email_verify_token = req.query.email_verify_token as string
  const { user_id } = req.decode_email_verify_token as TokenPayload

  //kiểm tra xem trong database có user nào có sở hữu user_id và email_verify_token
  const user = await usersServices.checkEmailVerifyToken({ user_id, email_verify_token })
  //kiểm tra xem user tìm được bị banned chưa, chưa thì verify
  if (user.verify == UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  } else {
    //chưa verify thì verify
    const result = await usersServices.verifyEmail(user_id)
    //sau khi verify
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
      result //ac và rf
    })
  }
}

export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  //dùng user_id tìm user đó
  const { user_id } = req.decode_authorization as TokenPayload

  //kiểm tra user đó có verify hay bị banned không ?
  const user = await usersServices.findUserById(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify == UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.OK,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFYED
    })
  } else if (user.verify == UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.OK,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  } else {
    //chưa verify thì resendEmailVerify
    await usersServices.resendEmailVerify(user_id)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS
    })
  }
  //nếu không thì mới resendEmailVerify
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body
  const hasUser = await usersServices.checkEmailExist(email)
  if (!hasUser) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  } else {
    await usersServices.forgotPassword(email)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    })
  }
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  //vào được đây có nghãi là forgot_password_token trong body hợp lệ
  const { forgot_password_token } = req.body
  //lấy thêm user_id để tìm xem user có sở hữu forfot_password_token chưa
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  //kiểm tra xem forgot_password_token trong database cơ sở hữu chưa
  await usersServices.checkForgotPasswordToken({ user_id, forgot_password_token })
  //nếu qua hàm trên êm xui là token hợp lệ
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_FORFOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const getMeController = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
  //middleware accessTokenValidator đã chạy rồi, nên ta có thể lấy được user_id
  //từ decode_authorization
  const { user_id } = req.decode_authorization as TokenPayload

  //tìm user thông qua user_id và trả ra user

  // Tìm user và gửi phản hồi
  const user = await usersServices.getMe(user_id)

  const userInfo = await usersServices.getMe(user_id)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    userInfo
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  // vào được đây tức là toksen trong body là hợp lệ
  const { forgot_password_token } = req.body
  // lấy thêm users_id nữa
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  await usersServices.checkForgotPasswordToken({ user_id, forgot_password_token })
  // nếu qua hàm trên êm xui thì có nghĩa là token hợp lệ và mình reset thôi
  await usersServices.resetPassword({ user_id, password: req.body.password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>, //
  res: Response,
  next: NextFunction
) => {
  //người ta fuiwr accessToken lên để chứng minh là họ đã đăng nhâph
  //đồng thời cũng cho mình biết họ là ai thông qua user_id từ payload
  const { user_id } = req.decode_authorization as TokenPayload
  const payload = req.body //những gì người dùng gửi lên
  //ta muốn account phải verify thì mới được cập nhập
  await usersServices.checkEmailVerified(user_id)
  //nếu gọi hàm trên mà ko có gì xảy ra thì có nghĩa là user đã verify r
  //tiến hành cập nhập thông tin ng dùng cung cấp
  const userInfor = await usersServices.updateMe({ user_id, payload })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESS,
    userInfor
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>, //
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { old_password, password } = req.body
  await usersServices.changePassword({
    user_id,
    old_password,
    password
  })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>, //
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_refresh_token as TokenPayload
  const { refresh_token } = req.body
  await usersServices.checkRefreshToken({ user_id, refresh_token })
  //nếu kiểm tra rf còn hiệu lực thì tiến hành rf cho người dùng
  const result = await usersServices.refreshToken({ user_id, refresh_token })
  //trả cho người dùng
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}
