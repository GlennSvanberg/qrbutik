import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Caption } from '../components/Caption'
import { PhoneFrame } from '../components/PhoneFrame'
import { SwishIcon } from '../components/SwishIcon'
import { PrimaryButton, Surface } from '../ui/primitives'
import { PageBackground } from '../ui/primitives'
import { useTheme } from '../ThemeContext'

export const SwishScene = () => {
  const frame = useCurrentFrame()
  const t = useTheme()

  const payOpacity = interpolate(frame, [0, 12], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const thanksOpacity = interpolate(frame, [18, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const checkScale = interpolate(frame, [18, 32], [0.7, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const buttonScale = interpolate(frame, [6, 14, 22], [1, 0.97, 1], {
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
          }}
        >
          <PhoneFrame>
            <div
              style={{
                flex: 1,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  opacity: payOpacity,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 16,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: t.fontFamily,
                      fontSize: 14,
                      fontWeight: 500,
                      color: t.textMuted,
                    }}
                  >
                    Totalt att betala:
                  </p>
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontFamily: t.fontFamily,
                      fontSize: 36,
                      fontWeight: 700,
                      color: t.text,
                    }}
                  >
                    45 kr
                  </p>
                </div>
                <PrimaryButton
                  fullWidth
                  style={{
                    borderRadius: 14,
                    padding: '16px',
                    fontSize: 17,
                    transform: `scale(${buttonScale})`,
                    boxShadow: `0 8px 24px ${t.primaryGlow}`,
                  }}
                >
                  <SwishIcon size={22} />
                  Betala med Swish
                </PrimaryButton>
              </div>

              <div
                style={{
                  position: 'absolute',
                  inset: 24,
                  opacity: thanksOpacity,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 18,
                }}
              >
                <Surface
                  soft
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: t.successBg,
                    transform: `scale(${checkScale})`,
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={t.success}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </Surface>
                <div style={{ textAlign: 'center' }}>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: t.fontFamily,
                      fontSize: 24,
                      fontWeight: 700,
                      color: t.text,
                    }}
                  >
                    Tack för ditt köp!
                  </p>
                  <p
                    style={{
                      margin: '8px 0 0',
                      fontFamily: t.fontFamily,
                      fontSize: 14,
                      color: t.textMuted,
                    }}
                  >
                    Visa skärmen för personalen
                  </p>
                </div>
                <Surface
                  soft
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: t.bgMuted,
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: t.fontFamily,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: t.textSubtle,
                    }}
                  >
                    Referensnummer
                  </p>
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontFamily: t.fontFamily,
                      fontSize: 20,
                      fontWeight: 800,
                      color: t.text,
                    }}
                  >
                    QRB-DEMOKIOSK-A3F2
                  </p>
                </Surface>
              </div>
            </div>
          </PhoneFrame>
        </div>
        <Caption text="Swish med rätt belopp" />
      </PageBackground>
    </AbsoluteFill>
  )
}
