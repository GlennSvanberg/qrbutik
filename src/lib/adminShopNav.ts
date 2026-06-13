export const adminShopTabs = [
  {
    id: 'sales',
    label: 'Försäljning',
    to: '/admin/$shopId' as const,
    roles: ['owner', 'treasurer', 'editor'] as const,
  },
  {
    id: 'history',
    label: 'Köphistorik',
    to: '/admin/$shopId/historik' as const,
    roles: ['owner', 'treasurer'] as const,
  },
  {
    id: 'products',
    label: 'Produkter',
    to: '/admin/$shopId/products' as const,
    roles: ['owner', 'treasurer', 'editor'] as const,
  },
  {
    id: 'skylt',
    label: 'Skylt',
    to: '/admin/$shopId/skylt' as const,
    roles: ['owner', 'treasurer', 'editor'] as const,
  },
  {
    id: 'settings',
    label: 'Inställningar',
    to: '/admin/$shopId/settings' as const,
    roles: ['owner', 'treasurer'] as const,
  },
] as const

export type AdminShopTab = (typeof adminShopTabs)[number]['id']
export type OrgRole = 'owner' | 'treasurer' | 'editor'

export function getVisibleShopTabs(role: OrgRole) {
  return adminShopTabs.filter((tab) =>
    (tab.roles as ReadonlyArray<OrgRole>).includes(role),
  )
}

export function getActiveShopTab(pathname: string): AdminShopTab {
  if (pathname.includes('/historik')) {
    return 'history'
  }
  if (pathname.includes('/products')) {
    return 'products'
  }
  if (pathname.includes('/skylt')) {
    return 'skylt'
  }
  if (pathname.includes('/settings')) {
    return 'settings'
  }
  return 'sales'
}

export function getShopTabRoute(tabId: AdminShopTab) {
  const tab = adminShopTabs.find((item) => item.id === tabId)
  if (!tab) {
    return adminShopTabs[0].to
  }
  return tab.to
}
