import type { Request } from 'express'

// User payload ที่ decode จาก JWT
export interface JwtPayload {
  userId: string
  role: 'USER' | 'ADMIN'
}

// Extend Express Request ให้มี user หลังผ่าน auth middleware
export interface AuthRequest extends Request {
  user?: JwtPayload
}
