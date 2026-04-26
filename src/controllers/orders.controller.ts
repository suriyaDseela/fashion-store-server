import type { Response } from 'express'
import { z } from 'zod'
import {
  getOrdersByUser, getAllOrders, getOrderById,
  getOrderByIdAdmin, createOrder,
  updateOrderStatus, cancelOrder,
} from '../services/orders.service'
import { sendSuccess, sendError } from '../utils/response'
import type { AuthRequest } from '../types'

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid('Invalid product id'),
      quantity:  z.number().int().min(1),
    })
  ).min(1, 'Order must contain at least one item'),
  shippingAddress: z.string().min(10, 'Please enter a complete shipping address'),
})

const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

// GET /orders — user
export const listOrders = async (req: AuthRequest, res: Response) => {
  try {
    return sendSuccess(res, await getOrdersByUser(req.user!.userId))
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

// GET /orders/all — admin
export const listAllOrders = async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const skip  = Number(req.query.skip) || 0
  try {
    return sendSuccess(res, await getAllOrders(limit, skip))
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

// GET /orders/:id — user (own) or admin
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN'
    const result  = isAdmin
      ? await getOrderByIdAdmin(String(req.params.id))
      : await getOrderById(String(req.params.id), req.user!.userId)
    return sendSuccess(res, result)
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Not found', 404)
  }
}

// POST /orders — user
export const placeOrder = async (req: AuthRequest, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success)
    return sendError(res, parsed.error.errors[0].message, 422)

  try {
    const result = await createOrder(
      req.user!.userId,
      parsed.data.items,
      parsed.data.shippingAddress
    )
    return sendSuccess(res, result, 201)
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

// PATCH /orders/:id/status — admin
export const patchStatus = async (req: AuthRequest, res: Response) => {
  const parsed = updateStatusSchema.safeParse(req.body)
  if (!parsed.success)
    return sendError(res, parsed.error.errors[0].message, 422)

  try {
    const result = await updateOrderStatus(
      String(req.params.id),
      parsed.data.status
    )
    return sendSuccess(res, result)
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

// PATCH /orders/:id/cancel — user (PENDING only)
export const cancelUserOrder = async (req: AuthRequest, res: Response) => {
  try {
    const result = await cancelOrder(
      String(req.params.id),
      req.user!.userId
    )
    return sendSuccess(res, result)
  } catch (err) {
    return sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}