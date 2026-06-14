import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Caption } from '../components/Caption'
import { QrPattern } from '../components/QrPattern'
import { LabelCaps, PageBackground, Surface } from '../ui/primitives'
import { useTheme } from '../ThemeContext'

export const QrScene = () => {
  const frame = useCurrentFrame()
  const t = useTheme()

  const scale = interpolate(frame, [0, 20], [0.94, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill>
      <PageBackground>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity,
            transform: `scale(${scale})`,
          }}
        >
          <Surface style={{ width: 420, padding: '36px 40px' }}>
            <div style={{ textAlign: 'center' }}>
              <LabelCaps>qrbutik.se</LabelCaps>
              <p
                style={{
                  margin: '16px 0 0',
                  fontFamily: t.fontFamily,
                  fontSize: 32,
                  fontWeight: 600,
                  color: t.text,
                }}
              >
                Demokiosk
              </p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontFamily: t.fontFamily,
                  fontSize: 15,
                  color: t.textMuted,
                }}
              >
                qrbutik.se/s/demo
              </p>
            </div>

            <div
              style={{
                marginTop: 28,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  borderRadius: 44,
                  border: `1px solid ${t.border}`,
                  background: t.bgMuted,
                  padding: 28,
                }}
              >
                <QrPattern pixelSize={9} />
              </div>
            </div>

            <Surface
              soft
              style={{
                marginTop: 24,
                padding: '16px 20px',
                background: t.bgMuted,
              }}
            >
              {[
                '1. Skanna QR-koden med mobilkamera.',
                '2. Lägg varor i varukorgen.',
                '3. Betala direkt med Swish.',
              ].map((line) => (
                <p
                  key={line}
                  style={{
                    margin: '0 0 6px',
                    fontFamily: t.fontFamily,
                    fontSize: 13,
                    color: t.textMuted,
                    textAlign: 'center',
                  }}
                >
                  {line}
                </p>
              ))}
            </Surface>
          </Surface>
        </div>
        <Caption text="Scanna & beställ" />
      </PageBackground>
    </AbsoluteFill>
  )
}
