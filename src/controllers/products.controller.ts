import type { Request, Response } from 'express'
import {
  getProducts,
  getProductById,
  searchProducts,
  getCategories,
} from '../services/products.service'
import { sendSuccess, sendError } from '../utils/response'

// ─── GET /products?limit=&skip=&category= ────────────────────
export const listProducts = async (req: Request, res: Response) => {
  const limit    = Math.min(Number(req.query.limit)  || 20, 100)
  const skip     = Number(req.query.skip)  || 0
  const category = req.query.category as string | undefined

  try {
    const result = await getProducts(limit, skip, category)
    return sendSuccess(res, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch products'
    return sendError(res, message, 500)
  }
}

// ─── GET /products/category-list ─────────────────────────────
// ต้องอยู่ก่อน /:id เพราะ Express match จากบนลงล่าง
export const listCategories = async (_req: Request, res: Response) => {
  try {
    const result = await getCategories()
    return sendSuccess(res, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch categories'
    return sendError(res, message, 500)
  }
}

// ─── GET /products/search?q= ──────────────────────────────────
export const search = async (req: Request, res: Response) => {
  const q     = (req.query.q as string)?.trim()
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const skip  = Number(req.query.skip) || 0

  if (!q) return sendError(res, 'Query param "q" is required', 422)

  try {
    const result = await searchProducts(q, limit, skip)
    return sendSuccess(res, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed'
    return sendError(res, message, 500)
  }
}

// ─── GET /products/:id ────────────────────────────────────────
export const getProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string

  try {
    const result = await getProductById(id)
    return sendSuccess(res, result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Product not found'
    return sendError(res, message, 404)
  }
}
