import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin — HostSemImposto',
}

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AdminLayout session={session}>
        {children}
      </AdminLayout>
    </ThemeProvider>
  )
}
