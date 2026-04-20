import { prisma } from '../utils/prisma'

// Response shape ที่ match กับ frontend Product interface
const mapProduct = (p: {
  id:          string
  name:        string
  description: string | null
  price:       object        // Prisma Decimal → ต้อง Number()
  stock:       number
  imageUrl:    string | null
  isActive:    boolean
  category:    { name: string; slug: string }
}) => ({
  id:                 p.id,
  title:              p.name,
  description:        p.description ?? '',
  price:              Number(p.price),
  discountPercentage: 0,          // ยังไม่มีในระบบ — default 0
  rating:             0,          // ยังไม่มีในระบบ — default 0
  stock:              p.stock,
  brand:              '',         // ยังไม่มีในระบบ — default ''
  category:           p.category.slug,
  thumbnail:          p.imageUrl ?? '',
  images:             p.imageUrl ? [p.imageUrl] : [],
})

const productSelect = {
  id: true, name: true, description: true,
  price: true, stock: true, imageUrl: true, isActive: true,
  category: { select: { name: true, slug: true } },
} as const

// ─── GET /products ────────────────────────────────────────────
export const getProducts = async (
  limit = 20,
  skip  = 0,
  categorySlug?: string
) => {
  const where = {
    isActive: true,
    ...(categorySlug && { category: { slug: categorySlug } }),
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productSelect,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products: items.map(mapProduct),
    total,
    skip,
    limit,
  }
}

// ─── GET /products/:id ────────────────────────────────────────
export const getProductById = async (id: string) => {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    select: productSelect,
  })
  if (!product) throw new Error('Product not found')
  return mapProduct(product)
}

// ─── GET /products/search?q= ──────────────────────────────────
export const searchProducts = async (q: string, limit = 20, skip = 0) => {
  const where = {
    isActive: true,
    OR: [
      { name:        { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } },
    ],
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productSelect,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.product.count({ where }),
  ])

  return { products: items.map(mapProduct), total, skip, limit }
}

// ─── GET /products/category-list ─────────────────────────────
export const getCategories = async () => {
  const cats = await prisma.category.findMany({
    select:  { slug: true },
    orderBy: { name: 'asc' },
  })
  return cats.map((c) => c.slug)
}
