import { prisma } from '../utils/prisma'

// Response shape ที่ match กับ frontend Order interface
const mapOrder = (order: {
  id: string
  status: string
  total: object         // Decimal
  createdAt: Date
  items: {
    id: string
    quantity: number
    unitPrice: object   // Decimal
    product: { id: string; name: string; imageUrl: string | null }
  }[]
}) => {
  const products = order.items.map((item) => ({
    id:             item.product.id,
    title:          item.product.name,
    price:          Number(item.unitPrice),
    quantity:       item.quantity,
    total:          Number(item.unitPrice) * item.quantity,
    discountedTotal: Number(item.unitPrice) * item.quantity,
    thumbnail:      item.product.imageUrl ?? '',
  }))

  return {
    id:              order.id,
    status:          order.status,
    total:           Number(order.total),
    discountedTotal: Number(order.total),
    totalProducts:   products.length,
    totalQuantity:   products.reduce((s, p) => s + p.quantity, 0),
    createdAt:       order.createdAt,
    products,
  }
}

const orderInclude = {
  items: {
    include: {
      product: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
  },
} as const

// ─── GET /orders/all (admin) ──────────────────────────────────
export const getAllOrders = async (limit = 20, skip = 0) => {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.order.count(),
  ])
  return {
    carts: orders.map(mapOrder),
    total,
    skip,
    limit,
  }
}

// ─── GET /orders  (orders ของ user ที่ login) ─────────────────
export const getOrdersByUser = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  })
  return {
    carts: orders.map(mapOrder),
    total: orders.length,
  }
}

// ─── GET /orders/:id ──────────────────────────────────────────
export const getOrderById = async (id: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },   // ป้องกัน user อื่นดู order คนอื่น
    include: orderInclude,
  })
  if (!order) throw new Error('Order not found')
  return mapOrder(order)
}

// ─── POST /orders ─────────────────────────────────────────────
export interface CreateOrderItem {
  productId: string
  quantity:  number
}

export const createOrder = async (
  userId: string,
  items:  CreateOrderItem[]
) => {
  if (!items.length) throw new Error('Order must have at least one item')

  // ดึง products + ตรวจ stock ในครั้งเดียว
  const products = await prisma.product.findMany({
    where: {
      id:       { in: items.map((i) => i.productId) },
      isActive: true,
    },
    select: { id: true, name: true, price: true, stock: true },
  })

  if (products.length !== items.length) {
    throw new Error('One or more products not found or unavailable')
  }

  // ตรวจ stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}"`)
    }
  }

  // คำนวณ total
  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!
    return sum + Number(product.price) * item.quantity
  }, 0)

  // สร้าง order + ลด stock ใน transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!
            return {
              productId: item.productId,
              quantity:  item.quantity,
              unitPrice: Number(product.price),
            }
          }),
        },
      },
      include: orderInclude,
    })

    // ลด stock ทุก product
    await Promise.all(
      items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
        })
      )
    )

    return newOrder
  })

  return mapOrder(order)
}
