import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { TestInfo } from '@playwright/test'

const FINDINGS_PATH = resolve(process.cwd(), 'TEST_FINDINGS.md')

type FindingEntry = {
  testFile: string
  scenario: string
  expected: string
  actual: string
  severity?: 'low' | 'medium' | 'high'
  area?: string
}

function relativeSpecPath(absolutePath: string): string {
  const normalized = absolutePath.replace(/\\/g, '/')
  const marker = '/e2e/'
  const index = normalized.lastIndexOf(marker)
  if (index >= 0) {
    return normalized.slice(index + 1)
  }
  return normalized
}

export function appendTestFinding(entry: FindingEntry): void {
  const spec = relativeSpecPath(entry.testFile)
  const row = `| ${spec} | ${entry.scenario} | ${entry.expected} | ${entry.actual.slice(0, 200).replace(/\|/g, '\\|')} | ${entry.severity ?? 'medium'} | ${entry.area ?? 'e2e'} |`
  const logLine = `- **${new Date().toISOString()}** — \`${spec}\` — ${entry.scenario}`

  try {
    const raw = readFileSync(FINDINGS_PATH, 'utf8')
    const lines = raw.split('\n')
    const tableHeaderIndex = lines.findIndex((line) =>
      line.startsWith('| Test file | Scenario |'),
    )

    if (tableHeaderIndex >= 0) {
      const separatorIndex = tableHeaderIndex + 1
      if (lines[separatorIndex]?.startsWith('|')) {
        lines.splice(separatorIndex + 1, 0, row)
      }

      const logMarker = '## Subagent log'
      const logIndex = lines.findIndex((line) => line === logMarker)
      if (logIndex >= 0) {
        lines.splice(logIndex + 2, 0, logLine)
      }

      writeFileSync(FINDINGS_PATH, lines.join('\n'), 'utf8')
      return
    }
  } catch {
    // fall through to append-only
  }

  appendFileSync(FINDINGS_PATH, `\n${logLine}\n${row}\n`, { encoding: 'utf8' })
}

export function recordFailureFromTestInfo(testInfo: TestInfo): void {
  if (testInfo.status === testInfo.expectedStatus) {
    return
  }

  appendTestFinding({
    testFile: testInfo.file,
    scenario: testInfo.title,
    expected: 'Test passes',
    actual: testInfo.error?.message ?? String(testInfo.status),
  })
}

export function attachFindingsReporter(testApi: {
  afterEach: (
    hook: (
      args: { page: unknown },
      testInfo: TestInfo,
    ) => void | Promise<void>,
  ) => void
}): void {
  testApi.afterEach(({ page: _page }, testInfo: TestInfo) => {
    recordFailureFromTestInfo(testInfo)
  })
}
