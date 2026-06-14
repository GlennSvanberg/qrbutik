import type { CSSProperties } from 'react'
import { useTheme } from '../ThemeContext'

type CaptionProps = {
  text: string
  style?: CSSProperties
}

export const Caption = ({ text, style }: CaptionProps) => {
  const t = useTheme()
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: t.fontFamily,
          fontSize: 18,
          fontWeight: 600,
          color: t.text,
          backgroundColor: t.bgAccent,
          border: `1px solid ${t.borderAccent}`,
          borderRadius: 999,
          padding: '8px 20px',
          boxShadow: `0 4px 20px ${t.primaryGlow}`,
        }}
      >
        {text}
      </span>
    </div>
  )
}
