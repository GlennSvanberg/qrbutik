import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { BrowserFrame } from '../components/BrowserFrame'
import { Caption } from '../components/Caption'
import {
  Chip,
  KpiCard,
  LabelCaps,
  PageBackground,
  PrimaryButton,
  SecondaryButton,
  Surface,
} from '../ui/primitives'
import { useTheme } from '../ThemeContext'

export const DashboardScene = () => {
  const frame = useCurrentFrame()
  const t = useTheme()

  const enter = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const kpiEnter = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const exportPulse = interpolate(
    frame,
    [70, 85, 100, 115],
    [1, 1.02, 1, 1.02],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  const exportGlow = interpolate(frame, [70, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const fadeOut = interpolate(frame, [135, 150], [1, 0.88], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <PageBackground>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: enter,
          }}
        >
          <BrowserFrame>
            <div
              style={{
                borderBottom: `1px solid ${t.border}`,
                background: t.navBg,
                padding: '20px 24px',
              }}
            >
              <LabelCaps>QRButik.se</LabelCaps>
              <p
                style={{
                  margin: '8px 0 0',
                  fontFamily: t.fontFamily,
                  fontSize: 24,
                  fontWeight: 600,
                  color: t.text,
                }}
              >
                Centralt dashboard
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontFamily: t.fontFamily,
                  fontSize: 13,
                  color: t.textMuted,
                }}
              >
                Inloggad som kassor@demoforening.se
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 14,
                }}
              >
                <Chip>Demoföreningen IF</Chip>
                <Chip>Provperiod</Chip>
                <Chip>3 kiosker</Chip>
              </div>
            </div>

            <div style={{ padding: '16px 24px 24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Idag', 'Igår', 'Helgen', '7 dagar'].map((label) => (
                  <Chip key={label} active={label === 'Helgen'}>
                    {label}
                  </Chip>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginTop: 16,
                  opacity: kpiEnter,
                }}
              >
                <KpiCard label="Omsättning" value="12 450 kr" />
                <KpiCard label="Antal köp" value="86" />
                <KpiCard label="Snittorder" value="145 kr" />
                <KpiCard label="Senaste köp" value="14:32" />
              </div>

              <Surface style={{ marginTop: 14, padding: 16 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: t.fontFamily,
                    fontSize: 15,
                    fontWeight: 600,
                    color: t.text,
                  }}
                >
                  Exportera till bokföring
                </p>
                <p
                  style={{
                    margin: '6px 0 0',
                    fontFamily: t.fontFamily,
                    fontSize: 13,
                    color: t.textMuted,
                  }}
                >
                  Excel för översikt och SIE4 för Fortnox/Visma.
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 14,
                  }}
                >
                  <PrimaryButton
                    style={{
                      flex: 1,
                      height: 44,
                      fontSize: 14,
                      transform: `scale(${exportPulse})`,
                      boxShadow: `0 0 0 ${exportGlow * 3}px ${t.primaryGlow}`,
                    }}
                  >
                    Ladda ner Excel
                  </PrimaryButton>
                  <SecondaryButton
                    style={{
                      flex: 1,
                      height: 44,
                      fontSize: 14,
                    }}
                  >
                    Ladda ner SIE
                  </SecondaryButton>
                </div>
              </Surface>
            </div>
          </BrowserFrame>
        </div>
        <Caption text="Överblick & export för kassör" />
      </PageBackground>
    </AbsoluteFill>
  )
}
