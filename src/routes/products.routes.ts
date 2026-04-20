import { Router } from 'express'
import {
  listProducts,
  listCategories,
  search,
  getProduct,
} from '../controllers/products.controller'

const router = Router()

// GET /products/category-list  — ดึง slug ทุก category (ต้องอยู่ก่อน /:id)
router.get('/category-list', listCategories)

// GET /products/search?q=      — full-text search
router.get('/search', search)

// GET /products/category/:slug — filter ตาม category (ต้องอยู่ก่อน /:id)
router.get('/category/:slug', (req, res) => {
  req.query.category = req.params.slug
  return listProducts(req, res)
})

// GET /products?limit=&skip=   — list ทั้งหมด (with pagination)
router.get('/', listProducts)

// GET /products/:id            — ดู product เดี่ยว (ต้องอยู่หลังสุด)
router.get('/:id', getProduct)

export default router
