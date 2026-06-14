import { createContext, useContext, type ReactNode } from 'react'
import { getTheme, type AppTheme, type ThemeMode } from './theme'

const ThemeContext = createContext<AppTheme>(getTheme('light'))

export function ThemeProvider({
  mode,
  children,
}: {
  mode: ThemeMode
  children: ReactNode
}) {
  return (
    <ThemeContext.Provider value={getTheme(mode)}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext)
}
