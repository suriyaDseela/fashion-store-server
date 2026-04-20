import { prisma } from '../utils/prisma'

// ─── GET /users (admin only) ──────────────────────────────────
export const getAllUsers = async (limit = 20, skip = 0) => {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id:        true,
        email:     true,
        name:      true,
        role:      true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.user.count(),
  ])

  return {
    users: users.map((u) => ({
      id:          u.id,
      email:       u.email,
      name:        u.name,
      role:        u.role,
      createdAt:   u.createdAt,
      totalOrders: u._count.orders,
    })),
    total,
    skip,
    limit,
  }
}
