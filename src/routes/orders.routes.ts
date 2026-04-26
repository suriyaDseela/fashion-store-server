import { Router } from 'express'
import {
  listOrders, listAllOrders, getOrder,
  placeOrder, patchStatus, cancelUserOrder,
} from '../controllers/orders.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

router.use(authenticate)

// Admin only
router.get('/all',              requireAdmin, listAllOrders)
router.patch('/:id/status',     requireAdmin, patchStatus)

// User
router.get('/',                 listOrders)
router.post('/',                placeOrder)
router.get('/:id',              getOrder)
router.patch('/:id/cancel',     cancelUserOrder)

export default router