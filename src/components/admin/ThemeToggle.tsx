'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-[var(--color-text-secondary)]" />
      ) : (
        <Moon size={18} className="text-[var(--color-text-secondary)]" />
      )}
    </Button>
  )
}
