import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma'

// Response shape ที่ match กับ frontend authSlice
export interface AuthUserResponse {
  id:        string
  username:  string
  email:     string
  firstName: string
  lastName:  string
  image:     string
  role:      string
  token:     string
}

const formatUser = (user: {
  id: string
  name: string
  email: string
  role: string
}, token: string): AuthUserResponse => {
  // แยก name → firstName / lastName (เผื่อชื่อเดียว fallback เป็น empty string)
  const [firstName = user.name, lastName = ''] = user.name.split(' ')
  return {
    id:        user.id,
    username:  user.email.split('@')[0],
    email:     user.email,
    firstName,
    lastName,
    image:     '',
    role:      user.role,
    token,
  }
}

const signToken = (userId: string, role: string) =>
  jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
  )

// ─── Register ────────────────────────────────────────────────
export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already in use')

  const hashed = await bcrypt.hash(password, 10)
  const user   = await prisma.user.create({
    data: { email, password: hashed, name },
  })

  const token = signToken(user.id, user.role)
  return formatUser(user, token)
}

// ─── Login ───────────────────────────────────────────────────
export const loginUser = async (
  emailOrUsername: string,
  password: string
) => {
  // รองรับทั้ง email และ username (email prefix)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrUsername },
        { email: { startsWith: emailOrUsername + '@' } },
      ],
    },
  })
  if (!user) throw new Error('Invalid credentials')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Invalid credentials')

  const token = signToken(user.id, user.role)
  return formatUser(user, token)
}

// ─── Get me ──────────────────────────────────────────────────
export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  if (!user) throw new Error('User not found')
  return user
}