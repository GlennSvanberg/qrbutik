import { useTheme } from '../ThemeContext'

const SIZE = 21

export function QrPattern({ pixelSize = 8 }: { pixelSize?: number }) {
  const t = useTheme()
  const cells: boolean[] = []

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const inTopLeft = row < 7 && col < 7
      const inTopRight = row < 7 && col >= SIZE - 7
      const inBottomLeft = row >= SIZE - 7 && col < 7
      const finder =
        inTopLeft || inTopRight || inBottomLeft
          ? row % 7 === 0 ||
            row % 7 === 6 ||
            col % 7 === 0 ||
            col % 7 === 6 ||
            (row >= 2 && row <= 4 && col >= 2 && col <= 4)
          : (row * 7 + col * 3) % 5 < 2
      cells.push(finder)
    }
  }

  const grid = SIZE * pixelSize + (SIZE - 1) * 2

  return (
    <div
      style={{
        width: grid + 24,
        height: grid + 24,
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${t.border}`,
        background: t.bgElevated,
        boxShadow: `0 1px 3px ${t.shadow}`,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, ${pixelSize}px)`,
          gap: 2,
        }}
      >
        {cells.map((filled, index) => (
          <div
            key={index}
            style={{
              width: pixelSize,
              height: pixelSize,
              borderRadius: 1,
              backgroundColor: filled ? t.text : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  )
}
