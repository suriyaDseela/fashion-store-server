import { Router } from 'express'
import { listOrders, listAllOrders, getOrder, placeOrder } from '../controllers/orders.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

// ทุก orders endpoint ต้อง login ก่อนเสมอ
router.use(authenticate)

// GET  /orders/all   — admin: ดู orders ของทุก user (ต้องอยู่ก่อน /:id)
router.get('/all',  requireAdmin, listAllOrders)

// GET  /orders       — ดู orders ของ user ที่ login
router.get('/',    listOrders)

// POST /orders       — สร้าง order ใหม่จาก cart
router.post('/',   placeOrder)

// GET  /orders/:id   — ดู order เดี่ยว (เฉพาะของตัวเอง)
router.get('/:id', getOrder)

export default router
