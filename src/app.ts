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

// ─── CORS ─────────────────────────────────────────────────
// รองรับหลาย origins คั่นด้วย comma เช่น
// FRONTEND_URL=http://localhost:5173,https://myapp.vercel.app
const allowedOrigins = (process.env.FRONTEND_URL ?? '*')
  .split(',')
  .map((o) => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

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

// ─── Global error handler ─────────────────────────────────
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app