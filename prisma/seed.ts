import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'tops' },
      update: {},
      create: { name: 'Tops', slug: 'tops' },
    }),
    prisma.category.upsert({
      where: { slug: 'bottoms' },
      update: {},
      create: { name: 'Bottoms', slug: 'bottoms' },
    }),
    prisma.category.upsert({
      where: { slug: 'dresses' },
      update: {},
      create: { name: 'Dresses', slug: 'dresses' },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories' },
    }),
  ])

  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@fashionstore.com' },
    update: {},
    create: {
      email: 'admin@fashionstore.com',
      password: await bcrypt.hash('admin1234', 10),
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  // Sample products
  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Classic White Tee',   price: 590,  stock: 100, categoryId: categories[0].id,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
      { name: 'Slim Fit Jeans',      price: 1290, stock: 50,  categoryId: categories[1].id,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
      { name: 'Floral Wrap Dress',   price: 1590, stock: 30,  categoryId: categories[2].id,
        imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400' },
      { name: 'Canvas Tote Bag',     price: 390,  stock: 200, categoryId: categories[3].id,
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400' },
    ],
  })

  console.log('Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
