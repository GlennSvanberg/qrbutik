import type { ReactNode } from 'react'
import { useTheme } from '../ThemeContext'

export function BrowserFrame({ children }: { children: ReactNode }) {
  const t = useTheme()
  return (
    <div
      style={{
        width: 900,
        borderRadius: 14,
        border: `1px solid ${t.border}`,
        background: t.bgMuted,
        boxShadow: `0 24px 64px ${t.shadow}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: `1px solid ${t.border}`,
          background: t.bgElevated,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
            <div
              key={color}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            marginLeft: 8,
            padding: '6px 14px',
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.bgMuted,
            fontFamily: t.fontFamily,
            fontSize: 12,
            color: t.textMuted,
            textAlign: 'center',
          }}
        >
          qrbutik.se/admin
        </div>
      </div>
      <div style={{ maxHeight: 520, overflow: 'hidden' }}>{children}</div>
    </div>
  )
}
