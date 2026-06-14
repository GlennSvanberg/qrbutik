import './index.css'
import { Composition } from 'remotion'
import { DURATION_FRAMES, FPS, HeroLoop } from './HeroLoop'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroLoopLight"
        component={HeroLoop}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{ theme: 'light' }}
      />
      <Composition
        id="HeroLoopDark"
        component={HeroLoop}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{ theme: 'dark' }}
      />
    </>
  )
}
