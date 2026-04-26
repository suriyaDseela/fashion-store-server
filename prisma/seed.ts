import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ─── Categories ────────────────────────────────────────────── 
  const cats = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'tops' },
      update: {},
      create: { name: 'Tops', slug: 'tops' }
    }),
    prisma.category.upsert({
      where: { slug: 'bottoms' },
      update: {},
      create: { name: 'Bottoms', slug: 'bottoms' }
    }),
    prisma.category.upsert({
      where: { slug: 'dresses' },
      update: {},
      create: { name: 'Dresses', slug: 'dresses' }
    }),
    prisma.category.upsert({
      where: { slug: 'outerwear' },
      update: {},
      create: { name: 'Outerwear', slug: 'outerwear' }
    }),
    prisma.category.upsert({
      where: { slug: 'shoes' },
      update: {},
      create: { name: 'Shoes', slug: 'shoes' }
    }),
    prisma.category.upsert({
      where: { slug: 'bags' },
      update: {},
      create: { name: 'Bags', slug: 'bags' }
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories' }
    }),
    prisma.category.upsert({
      where: { slug: 'sportswear' },
      update: {},
      create: { name: 'Sportswear', slug: 'sportswear' }
    }),
  ])

  const [tops, bottoms, dresses, outerwear, shoes, bags, accessories, sportswear] = cats

  // ─── Admin ─────────────────────────────────────────────────── 
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

  // ─── Products ──────────────────────────────────────────────── 
  const products = [
    // TOPS (8)
    {
      name: 'Classic White Tee',
      description: 'Essential everyday t-shirt in premium cotton',
      price: 590,
      stock: 100,
      categoryId: tops.id,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
    },
    {
      name: 'Oversized Black Tee',
      description: 'Relaxed fit oversized tee for street style',
      price: 690,
      stock: 80,
      categoryId: tops.id,
      imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'
    },
    {
      name: 'Striped Polo Shirt',
      description: 'Classic polo with nautical stripes',
      price: 890,
      stock: 60,
      categoryId: tops.id,
      imageUrl: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400'
    },
    {
      name: 'Linen Button-Up Shirt',
      description: 'Breathable linen shirt perfect for summer',
      price: 1190,
      stock: 50,
      categoryId: tops.id,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'
    },
    {
      name: 'Graphic Print Tee',
      description: 'Bold graphic print on heavyweight cotton',
      price: 790,
      stock: 70,
      categoryId: tops.id,
      imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400'
    },
    {
      name: 'Ribbed Tank Top',
      description: 'Fitted ribbed tank top in multiple colors',
      price: 490,
      stock: 120,
      categoryId: tops.id,
      imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400'
    },
    {
      name: 'Cropped Hoodie',
      description: 'Soft cropped hoodie for casual layering',
      price: 1290,
      stock: 45,
      categoryId: tops.id,
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400'
    },
    {
      name: 'Long Sleeve Thermal',
      description: 'Warm thermal long sleeve for cooler days',
      price: 890,
      stock: 55,
      categoryId: tops.id,
      imageUrl: 'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=400'
    },

    // BOTTOMS (6)
    {
      name: 'Slim Fit Jeans',
      description: 'Modern slim fit denim in dark wash',
      price: 1290,
      stock: 50,
      categoryId: bottoms.id,
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'
    },
    {
      name: 'Wide Leg Trousers',
      description: 'Elegant wide leg trousers in neutral tones',
      price: 1490,
      stock: 40,
      categoryId: bottoms.id,
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'
    },
    {
      name: 'Cargo Pants',
      description: 'Utility cargo pants with multiple pockets',
      price: 1390,
      stock: 45,
      categoryId: bottoms.id,
      imageUrl: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400'
    },
    {
      name: 'Pleated Midi Skirt',
      description: 'Flowy pleated skirt in satin finish',
      price: 1190,
      stock: 35,
      categoryId: bottoms.id,
      imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5218c5fc71?w=400'
    },
    {
      name: 'Chino Shorts',
      description: 'Classic chino shorts for warm weather',
      price: 890,
      stock: 60,
      categoryId: bottoms.id,
      imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400'
    },
    {
      name: 'High Waist Leggings',
      description: 'Sculpting high waist leggings with pocket',
      price: 990,
      stock: 75,
      categoryId: bottoms.id,
      imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400'
    },

    // DRESSES (4)
    {
      name: 'Floral Wrap Dress',
      description: 'Elegant wrap dress with floral print',
      price: 1590,
      stock: 30,
      categoryId: dresses.id,
      imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400'
    },
    {
      name: 'Mini Slip Dress',
      description: 'Satin mini slip dress for evening wear',
      price: 1390,
      stock: 25,
      categoryId: dresses.id,
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400'
    },
    {
      name: 'Maxi Boho Dress',
      description: 'Bohemian maxi dress with embroidery detail',
      price: 1890,
      stock: 20,
      categoryId: dresses.id,
      imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400'
    },
    {
      name: 'Denim Shirt Dress',
      description: 'Casual denim dress with button-down front',
      price: 1490,
      stock: 28,
      categoryId: dresses.id,
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'
    },

    // OUTERWEAR (4)
    {
      name: 'Classic Trench Coat',
      description: 'Timeless trench coat in camel tone',
      price: 3490,
      stock: 20,
      categoryId: outerwear.id,
      imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400'
    },
    {
      name: 'Puffer Jacket',
      description: 'Lightweight puffer jacket for cold weather',
      price: 2890,
      stock: 25,
      categoryId: outerwear.id,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'
    },
    {
      name: 'Denim Jacket',
      description: 'Vintage-washed denim jacket, a wardrobe staple',
      price: 1890,
      stock: 35,
      categoryId: outerwear.id,
      imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400'
    },
    {
      name: 'Wool Blazer',
      description: 'Tailored wool blend blazer for smart casual looks',
      price: 2490,
      stock: 15,
      categoryId: outerwear.id,
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400'
    },

    // SHOES (4)
    {
      name: 'White Leather Sneakers',
      description: 'Clean minimalist leather sneakers',
      price: 2290,
      stock: 40,
      categoryId: shoes.id,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
    },
    {
      name: 'Chelsea Boots',
      description: 'Classic Chelsea boots in genuine leather',
      price: 3190,
      stock: 20,
      categoryId: shoes.id,
      imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400'
    },
    {
      name: 'Strappy Sandals',
      description: 'Elegant strappy heeled sandals',
      price: 1890,
      stock: 30,
      categoryId: shoes.id,
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400'
    },
    {
      name: 'Canvas Slip-Ons',
      description: 'Casual canvas slip-on shoes for everyday wear',
      price: 1190,
      stock: 55,
      categoryId: shoes.id,
      imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400'
    },

    // BAGS (4)
    {
      name: 'Canvas Tote Bag',
      description: 'Reusable canvas tote for everyday use',
      price: 390,
      stock: 200,
      categoryId: bags.id,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400'
    },
    {
      name: 'Leather Crossbody Bag',
      description: 'Compact leather crossbody with adjustable strap',
      price: 2190,
      stock: 25,
      categoryId: bags.id,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'
    },
    {
      name: 'Mini Backpack',
      description: 'Stylish mini backpack for casual outings',
      price: 1590,
      stock: 30,
      categoryId: bags.id,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
    },
    {
      name: 'Woven Straw Bag',
      description: 'Summer-ready woven straw bag with leather handles',
      price: 990,
      stock: 40,
      categoryId: bags.id,
      imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'
    },

    // ACCESSORIES (4)
    {
      name: 'Silk Scarf',
      description: 'Luxurious silk scarf with artistic print',
      price: 890,
      stock: 60,
      categoryId: accessories.id,
      imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400'
    },
    {
      name: 'Leather Belt',
      description: 'Classic leather belt with silver buckle',
      price: 690,
      stock: 80,
      categoryId: accessories.id,
      imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400'
    },
    {
      name: 'Knit Beanie',
      description: 'Cozy ribbed knit beanie in neutral tones',
      price: 490,
      stock: 100,
      categoryId: accessories.id,
      imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400'
    },
    {
      name: 'Sunglasses',
      description: 'Retro oval sunglasses with UV400 protection',
      price: 1290,
      stock: 45,
      categoryId: accessories.id,
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400'
    },

    // SPORTSWEAR (4)
    {
      name: 'Yoga Pants',
      description: 'High-performance yoga pants with moisture-wicking',
      price: 1190,
      stock: 65,
      categoryId: sportswear.id,
      imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400'
    },
    {
      name: 'Sports Bra',
      description: 'Medium-support sports bra with racerback design',
      price: 790,
      stock: 70,
      categoryId: sportswear.id,
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'
    },
    {
      name: 'Running Shorts',
      description: 'Lightweight running shorts with built-in liner',
      price: 890,
      stock: 60,
      categoryId: sportswear.id,
      imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400'
    },
    {
      name: 'Zip-Up Track Jacket',
      description: 'Classic track jacket with zip-up front and stripes',
      price: 1490,
      stock: 40,
      categoryId: sportswear.id,
      imageUrl: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=400'
    },
  ]

  // Create products
  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    }).catch(() => null)
  }

  console.log(`✅ Seed complete — ${products.length} products, ${cats.length} categories`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
