import { describe, expect, it } from 'vitest'
import {
  adminShopTabs,
  getActiveShopTab,
  getShopTabRoute,
  getVisibleShopTabs,
} from './adminShopNav'

describe('getVisibleShopTabs', () => {
  it('shows all tabs for owner and treasurer', () => {
    expect(getVisibleShopTabs('owner')).toHaveLength(adminShopTabs.length)
    expect(getVisibleShopTabs('treasurer')).toHaveLength(adminShopTabs.length)
    expect(getVisibleShopTabs('owner').map((tab) => tab.id)).toEqual([
      'sales',
      'history',
      'products',
      'skylt',
      'settings',
    ])
  })

  it('hides treasurer-only tabs for editor', () => {
    const tabs = getVisibleShopTabs('editor')
    expect(tabs.map((tab) => tab.id)).toEqual(['sales', 'products', 'skylt'])
    expect(tabs.some((tab) => tab.id === 'history')).toBe(false)
    expect(tabs.some((tab) => tab.id === 'settings')).toBe(false)
  })
})

describe('getActiveShopTab', () => {
  it.each([
    ['/admin/shop123', 'sales'],
    ['/admin/shop123/historik', 'history'],
    ['/admin/shop123/products', 'products'],
    ['/admin/shop123/skylt', 'skylt'],
    ['/admin/shop123/settings', 'settings'],
  ] as const)('pathname %s → %s', (pathname, expected) => {
    expect(getActiveShopTab(pathname)).toBe(expected)
  })
})

describe('getShopTabRoute', () => {
  it.each([
    ['sales', '/admin/$shopId'],
    ['history', '/admin/$shopId/historik'],
    ['products', '/admin/$shopId/products'],
    ['skylt', '/admin/$shopId/skylt'],
    ['settings', '/admin/$shopId/settings'],
  ] as const)('tab %s → route %s', (tabId, route) => {
    expect(getShopTabRoute(tabId)).toBe(route)
  })

  it('falls back to sales route for unknown tab id', () => {
    expect(getShopTabRoute('unknown' as 'sales')).toBe('/admin/$shopId')
  })
})
