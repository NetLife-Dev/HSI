import type { Metadata } from 'next'
import { Outfit, Lora, Geist_Mono } from 'next/font/google'
import './globals.css'

const fontSans = Outfit({
  variable: '--font-sans',
  subsets: ['latin'],
})

const fontMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

const fontDisplay = Lora({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'HostSemImposto',
  description: 'Reserve diretamente com o anfitrião',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Apply theme before first paint to avoid FOUC on admin routes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.classList.add(t)}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  )
}
