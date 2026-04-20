import type { Request, Response } from 'express'
import { getAllUsers } from '../services/users.service'
import { sendSuccess, sendError } from '../utils/response'

// ─── GET /users?limit=&skip= ──────────────────────────────────
export const listUsers = async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const skip  = Number(req.query.skip) || 0

  try {
    const result = await getAllUsers(limit, skip)
    return sendSuccess(res, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users'
    return sendError(res, message, 500)
  }
}
