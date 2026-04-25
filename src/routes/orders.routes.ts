import { Router } from 'express'
import {
  listOrders, listAllOrders, getOrder,
  placeOrder, patchStatus, cancelUserOrder,
  updateUserShipping, getOrderShipping, getOrderStatusDetail,
} from '../controllers/orders.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

router.use(authenticate)

// Admin only
router.get('/all',              requireAdmin, listAllOrders)
router.patch('/:id/status',     requireAdmin, patchStatus)

// User & Admin
router.get('/:id/status',       getOrderStatusDetail)
router.get('/:id/shipping',     getOrderShipping)

// User
router.get('/',                 listOrders)
router.post('/',                placeOrder)
router.get('/:id',              getOrder)
router.patch('/:id/cancel',     cancelUserOrder)
router.patch('/:id/shipping',   updateUserShipping)

export default router