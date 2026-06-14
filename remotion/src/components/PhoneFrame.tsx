import type { ReactNode } from 'react'
import { useTheme } from '../ThemeContext'

type PhoneFrameProps = {
  children: ReactNode
}

export const PhoneFrame = ({ children }: PhoneFrameProps) => {
  const t = useTheme()
  return (
    <div
      style={{
        width: 340,
        height: 620,
        borderRadius: 40,
        border: `1px solid ${t.border}`,
        backgroundColor: t.bg,
        overflow: 'hidden',
        boxShadow: `0 24px 64px ${t.shadow}`,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 88,
          height: 5,
          borderRadius: 999,
          backgroundColor: t.border,
        }}
      />
      <div
        style={{
          paddingTop: 24,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  )
}
