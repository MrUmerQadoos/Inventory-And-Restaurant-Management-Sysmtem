import { PrismaClient } from '@prisma/client'
import 'server-only'

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient
}

export let db: PrismaClient

if (process.env.NEXT_PUBLIC_PATH === 'production') {
  db = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }

  db = global.cachedPrisma
}
