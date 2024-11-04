import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/htppStatus'
import { Request, Response, NextFunction } from 'express'

export const defaultErrorHandler = (error: any, req: any, res: any, next: any) => {
  res.status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(error, ['status']))
}
