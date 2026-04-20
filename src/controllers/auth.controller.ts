import type { Request, Response } from 'express'
import { z } from 'zod'
import { registerUser, loginUser, getMe } from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/response'
import type { AuthRequest } from '../types'

// ─── Zod schemas ─────────────────────────────────────────────
const registerSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name:     z.string().min(1, 'Name is required'),
})

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

// ─── POST /auth/register ─────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 422)
  }

  try {
    const { email, password, name } = parsed.data
    const result = await registerUser(email, password, name)
    return sendSuccess(res, result, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Register failed'
    return sendError(res, message)
  }
}

// ─── POST /auth/login ────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 422)
  }

  try {
    const { username, password } = parsed.data
    const result = await loginUser(username, password)
    return sendSuccess(res, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    return sendError(res, message, 401)
  }
}

// ─── GET /auth/me  (protected) ───────────────────────────────
export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await getMe(req.user!.userId)
    return sendSuccess(res, user)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Not found'
    return sendError(res, message, 404)
  }
}