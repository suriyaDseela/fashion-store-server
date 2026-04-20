import type { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthRequest, JwtPayload } from '../types'
import { sendError } from '../utils/response'

// ตรวจ JWT — ต้อง login ก่อนถึงผ่านได้
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 'Unauthorized', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload
    req.user = payload
    next()
  } catch {
    return sendError(res, 'Invalid or expired token', 401)
  }
}

// ตรวจ role — ใช้ต่อจาก authenticate เสมอ
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
    return sendError(res, 'Forbidden', 403)
  }
  next()
}
