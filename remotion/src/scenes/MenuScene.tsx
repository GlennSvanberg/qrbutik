import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Caption } from '../components/Caption'
import { PhoneFrame } from '../components/PhoneFrame'
import { PrimaryButton, SecondaryButton, Surface } from '../ui/primitives'
import { PageBackground } from '../ui/primitives'
import { useTheme } from '../ThemeContext'

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

type ProductRowProps = {
  name: string
  price: number
  quantity: number
  highlight: number
}

function ProductRow({ name, price, quantity, highlight }: ProductRowProps) {
  const frame = useCurrentFrame()
  const t = useTheme()
  const pulse = interpolate(
    frame,
    [highlight, highlight + 6, highlight + 14],
    [1, 1.02, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  const qtyOpacity = interpolate(
    frame,
    [highlight + 8, highlight + 14],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  return (
    <Surface
      soft
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        transform: `scale(${pulse})`,
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: t.fontFamily,
            fontSize: 15,
            fontWeight: 600,
            color: t.text,
          }}
        >
          {name}
        </p>
        <p
          style={{
            margin: '4px 0 0',
            fontFamily: t.fontFamily,
            fontSize: 13,
            fontWeight: 500,
            color: t.textMuted,
          }}
        >
          {price} kr
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {quantity > 0 && (
          <>
            <SecondaryButton
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                color: t.textMuted,
              }}
            >
              <MinusIcon />
            </SecondaryButton>
            <span
              style={{
                width: 16,
                textAlign: 'center',
                fontFamily: t.fontFamily,
                fontSize: 15,
                fontWeight: 700,
                color: t.text,
                opacity: qtyOpacity,
              }}
            >
              {quantity}
            </span>
          </>
        )}
        <PrimaryButton
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
          }}
        >
          <PlusIcon />
        </PrimaryButton>
      </div>
    </Surface>
  )
}

export const MenuScene = () => {
  const frame = useCurrentFrame()
  const t = useTheme()

  const korvQty = frame >= 38 ? 1 : 0
  const kaffeQty = frame >= 76 ? 1 : 0
  const total = korvQty * 25 + kaffeQty * 20

  const barY = interpolate(frame, [100, 118], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const barOpacity = interpolate(frame, [100, 112], [0, 1], {
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
            <div style={{ padding: '12px 18px 0', textAlign: 'center' }}>
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
                QRButik.se
              </p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontFamily: t.fontFamily,
                  fontSize: 26,
                  fontWeight: 700,
                  color: t.text,
                }}
              >
                Demokiosk
              </p>
              <p
                style={{
                  margin: '6px 0 0',
                  fontFamily: t.fontFamily,
                  fontSize: 13,
                  color: t.textMuted,
                }}
              >
                Välj varor nedan och betala med Swish.
              </p>
            </div>

            <div style={{ padding: '18px 16px 100px' }}>
              <p
                style={{
                  margin: '0 0 10px 8px',
                  fontFamily: t.fontFamily,
                  fontSize: 16,
                  fontWeight: 600,
                  color: t.text,
                }}
              >
                Produkter
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ProductRow
                  name="Korv med bröd"
                  price={25}
                  quantity={korvQty}
                  highlight={26}
                />
                <ProductRow
                  name="Kaffe"
                  price={20}
                  quantity={kaffeQty}
                  highlight={64}
                />
              </div>
            </div>

            {total > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderTop: `1px solid ${t.border}`,
                  background: `${t.bgMuted}cc`,
                  backdropFilter: 'blur(12px)',
                  padding: 14,
                  opacity: barOpacity,
                  transform: `translateY(${barY}px)`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    padding: '0 4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: t.fontFamily,
                      fontSize: 14,
                      fontWeight: 500,
                      color: t.textMuted,
                    }}
                  >
                    Totalt att betala:
                  </span>
                  <span
                    style={{
                      fontFamily: t.fontFamily,
                      fontSize: 22,
                      fontWeight: 700,
                      color: t.text,
                    }}
                  >
                    {total} kr
                  </span>
                </div>
                <PrimaryButton
                  fullWidth
                  style={{
                    borderRadius: 14,
                    padding: '14px 16px',
                    fontSize: 16,
                  }}
                >
                  Betala med Swish
                </PrimaryButton>
              </div>
            )}
          </PhoneFrame>
        </div>
        <Caption text="Lägg i varukorg" />
      </PageBackground>
    </AbsoluteFill>
  )
}
