import type { Response } from 'express'
import { z } from 'zod'
import { getOrdersByUser, getAllOrders, getOrderById, createOrder } from '../services/orders.service'
import { sendSuccess, sendError } from '../utils/response'
import type { AuthRequest } from '../types'

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product id'),
        quantity:  z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'Order must contain at least one item'),
})

// ─── GET /orders (user — ของตัวเอง) ──────────────────────────
export const listOrders = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getOrdersByUser(req.user!.userId)
    return sendSuccess(res, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch orders'
    return sendError(res, message, 500)
  }
}

// ─── GET /orders/all (admin — ทุก user) ───────────────────────
export const listAllOrders = async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const skip  = Number(req.query.skip) || 0

  try {
    const result = await getAllOrders(limit, skip)
    return sendSuccess(res, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch orders'
    return sendError(res, message, 500)
  }
}

// ─── GET /orders/:id ──────────────────────────────────────────
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getOrderById(req.params.id, req.user!.userId)
    return sendSuccess(res, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Order not found'
    return sendError(res, message, 404)
  }
}

// ─── POST /orders ─────────────────────────────────────────────
export const placeOrder = async (req: AuthRequest, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 422)
  }

  try {
    const result = await createOrder(req.user!.userId, parsed.data.items)
    return sendSuccess(res, result, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create order'
    return sendError(res, message, 400)
  }
}
