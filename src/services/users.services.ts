import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { LoginReqBody, RegisterReqBody, UpdateMeReqBody } from '~/models/requests/users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import dotenv from 'dotenv'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/htppStatus'
import { USERS_MESSAGES } from '~/constants/message'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { log } from 'console'
import { update } from 'lodash'
dotenv.config()

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORFOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORFOT_PASSWORD_TOKEN_EXPIRE_IN }
    })
  }

  async checkEmailExist(email: string) {
    //dùng email lên database tìm user sở hữu email đó
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async checkRefreshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    const refreshToken = await databaseService.refresh_tokens.findOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })
    if (!refreshToken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }
    return refreshToken
  }

  async checkEmailVerifyToken({
    user_id,
    email_verify_token
  }: {
    user_id: string //
    email_verify_token: string
  }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      email_verify_token
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    return user
  }

  async checkForgotPasswordToken({
    user_id,
    forgot_password_token
  }: {
    user_id: string
    forgot_password_token: string
  }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      forgot_password_token
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID
      })
    }
    return user
  }

  async checkEmailVerified(user_id: string) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      verify: UserVerifyStatus.Verified
    })
    //nếu ko có thằng nào user là user_id và đang verify thì
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBBIDEN, //403
        message: USERS_MESSAGES.USER_NOT_VERIFIED
      })
    }
    return user
  }

  async findUserById(user_id: string) {
    return await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  }

  async findUserByEmail(email: string) {
    return await databaseService.users.findOne({ email })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    const result = await databaseService.users.insertOne(
      new User({
        _id: user_id,
        username: `user${user_id.toString()}`,
        email_verify_token,
        ...payload,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )

    //tạo access và refresh token
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString())
    ])

    console.log(`
      Nội dung Email xác thực gồm:
      http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
      `)

    //lưu refresh token vào database
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  //login
  async login({ email, password }: LoginReqBody) {
    //dùng email và password để tìm user
    const user = await databaseService.users.findOne({
      email,
      password: hashPassword(password)
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
      })
    }
    //nếu có user thì tạo at và rf
    const user_id = user._id.toString()
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    //lưu refresh token vào database
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  //logout
  async logout(refresh_token: string) {
    await databaseService.refresh_tokens.deleteOne({ token: refresh_token })
  }

  async verifyEmail(user_id: string) {
    //dùng user_id và cập nhập
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
    //tạo at và rf
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    //lưu refresh token vào database
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerify(user_id: string) {
    //ký
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    //lưu
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])
    //gữi
    console.log(`
      Nội dung Email xác thực gồm:
      http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
      `)
  }

  async forgotPassword(email: string) {
    const user = (await databaseService.users.findOne({ email })) as User
    const user_id = user._id as ObjectId
    const forgot_password_token = await this.signForgotPasswordToken(user_id.toString())
    await databaseService.users.updateOne({ _id: user_id }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    //gửi email
    console.log(`
      Bấm vô đây để đổi mật khẩu
      http://localhost:8000/reset-password/?forgot_password_token=${forgot_password_token}
      `)
  }

  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            password: hashPassword(password),
            forgot_password_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  async getMe(user_id: string) {
    const userIfnor = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0, //
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return userIfnor
  }

  async updateMe({
    user_id,
    payload
  }: {
    user_id: string //
    payload: UpdateMeReqBody
    // payload là những gì người dùng muốn update
  }) {
    //trong payload có 2 trường dữ liệu cần phải xử lý
    // date_of_birth
    const _payload = payload.date_of_birth //
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload
    //username
    if (_payload.username) {
      //nếu có thì tìm xem có ai giống không
      const user = await databaseService.users.findOne({ username: _payload.username })
      if (user) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
          message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS
        })
      }
    }
    //nếu username truyền lên mà không có người dùng thì tiến hành cập nhật
    const userInfor = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            ..._payload, // cái mới nè
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return userInfor
  }

  async changePassword({
    user_id,
    old_password,
    password
  }: {
    user_id: string
    old_password: string
    password: string
  }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      password: hashPassword(old_password)
    })
    //nếu tìm không ra thì nghĩa là thẳng client ko phải chủ acc
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    //nếu mà có thì ta tiến hành cập nhập
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password: hashPassword(password),
          updated_at: '$$NOW'
        }
      }
    ])
  }

  async refreshToken({
    user_id, //
    refresh_token
  }: {
    user_id: string
    refresh_token: string
  }) {
    //tạo 2 mã mới
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    //lưu rf mới vào database
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: new_refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    //xóa rf token cũ để ko ai dùng nữa
    await databaseService.refresh_tokens.deleteOne({
      token: refresh_token
    })
    //gữi cặp mã mới cho người dùng
    return {
      access_token,
      refresh_token: new_refresh_token
    }
  }
}

const usersService = new UsersService()
export default usersService
