import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'

type SceneWrapperProps = {
  children: ReactNode
  duration: number
  fade?: number
}

export const SceneWrapper = ({
  children,
  duration,
  fade = 12,
}: SceneWrapperProps) => {
  const frame = useCurrentFrame()

  const fadeIn = interpolate(frame, [0, fade], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const fadeOut = interpolate(frame, [duration - fade, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opacity = Math.min(fadeIn, fadeOut)

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}
