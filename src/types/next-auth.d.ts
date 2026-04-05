import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'owner' | 'staff'
    } & DefaultSession['user']
  }

  interface User {
    role: 'owner' | 'staff'
  }
}

// Augment @auth/core AdapterUser to include the role field added to the users table.
// This resolves the type incompatibility between @auth/drizzle-adapter and next-auth
// when both reference different internal copies of @auth/core.
declare module '@auth/core/adapters' {
  interface AdapterUser {
    role: 'owner' | 'staff'
  }
}
