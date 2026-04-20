import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes    from './routes/auth.routes'
import productRoutes from './routes/products.routes'
import orderRoutes   from './routes/orders.routes'
import userRoutes    from './routes/users.routes'
import { errorHandler } from './middlewares/error.middleware'

const app  = express()
const PORT = process.env.PORT ?? 3000

// ─── Middleware ───────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

// ─── Routes ──────────────────────────────────────────────
app.use('/auth',     authRoutes)
app.use('/products', productRoutes)
app.use('/orders',   orderRoutes)
app.use('/users',    userRoutes)

// ─── Health check ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV })
})

// ─── Global error handler (ต้องอยู่ท้ายสุด) ──────────────
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
