import { Router } from 'express'
import { register, login, me } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// POST /auth/register  — สมัครสมาชิก
router.post('/register', register)

// POST /auth/login     — เข้าสู่ระบบ → ได้ JWT กลับ
router.post('/login', login)

// GET  /auth/me        — ดูข้อมูลตัวเอง (ต้อง login ก่อน)
router.get('/me', authenticate, me)

export default router