import { AbsoluteFill, Sequence } from 'remotion'
import { SceneWrapper } from './components/SceneWrapper'
import { DashboardScene } from './scenes/DashboardScene'
import { MenuScene } from './scenes/MenuScene'
import { QrScene } from './scenes/QrScene'
import { SwishScene } from './scenes/SwishScene'
import { ThemeProvider } from './ThemeContext'
import type { ThemeMode } from './theme'
import { useTheme } from './ThemeContext'

export const FPS = 30
export const DURATION_FRAMES = 450

export type HeroLoopProps = {
  theme: ThemeMode
}

const SCENES = [
  { id: 'qr', from: 0, duration: 60, Component: QrScene },
  { id: 'menu', from: 60, duration: 150, Component: MenuScene },
  { id: 'swish', from: 210, duration: 90, Component: SwishScene },
  { id: 'dashboard', from: 300, duration: 150, Component: DashboardScene },
] as const

function HeroLoopInner() {
  const t = useTheme()
  return (
    <AbsoluteFill style={{ backgroundColor: t.bg }}>
      {SCENES.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.from}
          durationInFrames={scene.duration}
          layout="none"
        >
          <SceneWrapper duration={scene.duration}>
            <scene.Component />
          </SceneWrapper>
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}

export const HeroLoop = ({ theme }: HeroLoopProps) => {
  return (
    <ThemeProvider mode={theme}>
      <HeroLoopInner />
    </ThemeProvider>
  )
}
