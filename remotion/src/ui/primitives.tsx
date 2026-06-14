import type { CSSProperties, ReactNode } from 'react'
import { useTheme } from '../ThemeContext'

export function PageBackground({ children }: { children: ReactNode }) {
  const t = useTheme()
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: t.bg,
        backgroundImage: `radial-gradient(circle at top, ${t.heroGlow}, transparent 60%)`,
      }}
    >
      {children}
    </div>
  )
}

export function Surface({
  children,
  soft = false,
  style,
}: {
  children: ReactNode
  soft?: boolean
  style?: CSSProperties
}) {
  const t = useTheme()
  return (
    <div
      style={{
        border: `1px solid ${t.border}`,
        borderRadius: t.radiusPanel,
        background: t.bgElevated,
        boxShadow: soft
          ? `0 1px 2px ${t.shadowSoft}`
          : `0 1px 3px ${t.shadow}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Chip({
  children,
  active = false,
}: {
  children: ReactNode
  active?: boolean
}) {
  const t = useTheme()
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        border: `1px solid ${active ? 'transparent' : t.border}`,
        background: active ? t.primary : t.bgElevated,
        color: active ? '#ffffff' : t.textMuted,
        padding: '6px 14px',
        fontFamily: t.fontFamily,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  )
}

export function PrimaryButton({
  children,
  style,
  fullWidth,
}: {
  children: ReactNode
  style?: CSSProperties
  fullWidth?: boolean
}) {
  const t = useTheme()
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        border: '1px solid transparent',
        borderRadius: style?.borderRadius ?? t.radiusButton,
        background: t.primary,
        color: '#ffffff',
        fontFamily: t.fontFamily,
        fontWeight: 700,
        boxShadow: `0 1px 2px ${t.shadow}`,
        width: fullWidth ? '100%' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function SecondaryButton({
  children,
  style,
}: {
  children: ReactNode
  style?: CSSProperties
}) {
  const t = useTheme()
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${t.border}`,
        borderRadius: t.radiusButton,
        background: t.bgElevated,
        color: t.textMuted,
        fontFamily: t.fontFamily,
        fontWeight: 600,
        boxShadow: `0 1px 2px ${t.shadowSoft}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function LabelCaps({ children }: { children: ReactNode }) {
  const t = useTheme()
  return (
    <p
      style={{
        margin: 0,
        fontFamily: t.fontFamily,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: t.textSubtle,
      }}
    >
      {children}
    </p>
  )
}

export function KpiCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  const t = useTheme()
  return (
    <Surface style={{ padding: 18 }}>
      <LabelCaps>{label}</LabelCaps>
      <p
        style={{
          margin: '8px 0 0',
          fontFamily: t.fontFamily,
          fontSize: 28,
          fontWeight: 600,
          color: t.text,
        }}
      >
        {value}
      </p>
    </Surface>
  )
}
