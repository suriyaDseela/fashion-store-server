import { Router } from 'express'
import { listUsers } from '../controllers/users.controller'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

// GET /users — admin only (authenticate ก่อน แล้วค่อยตรวจ role)
router.get('/', authenticate, requireAdmin, listUsers)

export default router
