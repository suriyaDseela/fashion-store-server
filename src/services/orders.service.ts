import { prisma } from '../utils/prisma'

// Response shape ที่ match กับ frontend Order interface
const mapOrder = (order: {
  id: string
  status: string
  total: object
  shippingAddress: string
  createdAt: Date
  user?: { name: string; email: string }
  items: {
    id: string
    quantity: number
    unitPrice: object
    product: { id: string; name: string; imageUrl: string | null }
  }[]
}) => {
  const products = order.items.map((item) => ({
    id:              item.product.id,
    title:           item.product.name,
    price:           Number(item.unitPrice),
    quantity:        item.quantity,
    total:           Number(item.unitPrice) * item.quantity,
    discountedTotal: Number(item.unitPrice) * item.quantity,
    thumbnail:       item.product.imageUrl ?? '',
  }))

  return {
    id:              order.id,
    status:          order.status,
    total:           Number(order.total),
    discountedTotal: Number(order.total),
    totalProducts:   products.length,
    totalQuantity:   products.reduce((s, p) => s + p.quantity, 0),
    shippingAddress: order.shippingAddress,
    buyerName:       order.user?.name ?? '',
    buyerEmail:      order.user?.email ?? '',
    createdAt:       order.createdAt,
    products,
  }
}

const orderInclude = {
  items: {
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
    },
  },
  user: { select: { name: true, email: true } },
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
  return { carts: orders.map(mapOrder), total, skip, limit }
}

// ─── GET /orders (user) ───────────────────────────────────────
export const getOrdersByUser = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  })
  return { carts: orders.map(mapOrder), total: orders.length }
}

// ─── GET /orders/:id ──────────────────────────────────────────
export const getOrderById = async (id: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: orderInclude,
  })
  if (!order) throw new Error('Order not found')
  return mapOrder(order)
}

// ─── GET /orders/:id (admin — ดูได้ทุก order) ────────────────
export const getOrderByIdAdmin = async (id: string) => {
  const order = await prisma.order.findFirst({
    where: { id },
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
  userId:          string,
  items:           CreateOrderItem[],
  shippingAddress: string
) => {
  if (!items.length) throw new Error('Order must have at least one item')
  if (!shippingAddress.trim()) throw new Error('Shipping address is required')

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
    select: { id: true, name: true, price: true, stock: true },
  })

  if (products.length !== items.length)
    throw new Error('One or more products not found or unavailable')

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!
    if (product.stock < item.quantity)
      throw new Error(`Insufficient stock for "${product.name}"`)
  }

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!
    return sum + Number(product.price) * item.quantity
  }, 0)

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        shippingAddress,
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

// ─── PATCH /orders/:id/status (admin) ────────────────────────
const STATUS_FLOW: Record<string, string[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED',   'CANCELLED'],
  SHIPPED:   ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export const updateOrderStatus = async (
  id:        string,
  newStatus: string
) => {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new Error('Order not found')

  const allowed = STATUS_FLOW[order.status] ?? []
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Cannot change status from ${order.status} to ${newStatus}`
    )
  }

  const updated = await prisma.order.update({
    where: { id },
    data:  { status: newStatus as any },
    include: orderInclude,
  })

  return mapOrder(updated)
}

// ─── PATCH /orders/:id/cancel (user — PENDING เท่านั้น) ───────
export const cancelOrder = async (id: string, userId: string) => {
  const order = await prisma.order.findFirst({ where: { id, userId } })
  if (!order) throw new Error('Order not found')
  if (order.status !== 'PENDING')
    throw new Error('Only pending orders can be cancelled')

  // คืน stock
  const items = await prisma.orderItem.findMany({ where: { orderId: id } })

  const updated = await prisma.$transaction(async (tx) => {
    await Promise.all(
      items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data:  { stock: { increment: item.quantity } },
        })
      )
    )
    return tx.order.update({
      where: { id },
      data:  { status: 'CANCELLED' },
      include: orderInclude,
    })
  })

  return mapOrder(updated)
}

// ─── PATCH /orders/:id/shipping (user) ────────────────────────
export const updateShippingAddress = async (
  id:              string,
  userId:          string,
  shippingAddress: string
) => {
  if (!shippingAddress.trim() || shippingAddress.length < 10) {
    throw new Error('Please enter a complete shipping address')
  }

  const order = await prisma.order.findFirst({ where: { id, userId } })
  if (!order) throw new Error('Order not found')
  
  // Only allow update if order is still PENDING
  if (order.status !== 'PENDING') {
    throw new Error('Cannot update shipping address for confirmed orders')
  }

  const updated = await prisma.order.update({
    where: { id },
    data:  { shippingAddress },
    include: orderInclude,
  })

  return mapOrder(updated)
}

// ─── GET /orders/:id/status (user or admin) ────────────────────
export const getOrderStatus = async (
  id:     string,
  userId: string | null = null
) => {
  let order
  if (userId) {
    order = await prisma.order.findFirst({ where: { id, userId } })
  } else {
    order = await prisma.order.findUnique({ where: { id } })
  }

  if (!order) throw new Error('Order not found')

  return {
    id:     order.id,
    status: order.status,
    updatedAt: order.updatedAt,
  }
}

// ─── GET /orders/:id/shipping (user or admin) ──────────────────
export const getShippingAddress = async (
  id:     string,
  userId: string | null = null
) => {
  let order
  if (userId) {
    order = await prisma.order.findFirst({ 
      where: { id, userId },
      select: { id: true, shippingAddress: true }
    })
  } else {
    order = await prisma.order.findUnique({ 
      where: { id },
      select: { id: true, shippingAddress: true }
    })
  }

  if (!order) throw new Error('Order not found')

  return {
    id: order.id,
    shippingAddress: order.shippingAddress,
  }
}