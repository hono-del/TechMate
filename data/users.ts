// Mock dealer master (DR-004) and user master (DR-005).
// Demo only — no real authentication.

export type Role = 'technician' | 'dealer-admin' | 'cmc';

export interface Dealer {
  id: string;
  name: string;
  nameJa: string;
  region: string;
  regionJa: string;
}

export interface AppUser {
  id: string;
  name: string;
  nameJa: string;
  initials: string;
  role: Role;
  dealerId: string | null;
  title: string;
  titleJa: string;
}

export const DEALERS: Dealer[] = [
  {
    id: 'dl-tokyo',
    name: 'Tokyo Central Toyota',
    nameJa: '東京中央トヨタ',
    region: 'Asia Pacific',
    regionJa: 'アジアパシフィック',
  },
  {
    id: 'dl-osaka',
    name: 'Osaka Bay Toyota',
    nameJa: '大阪ベイトヨタ',
    region: 'Asia Pacific',
    regionJa: 'アジアパシフィック',
  },
  {
    id: 'dl-sg',
    name: 'Singapore Toyota',
    nameJa: 'シンガポールトヨタ',
    region: 'Asia Pacific',
    regionJa: 'アジアパシフィック',
  },
];

export const USERS: AppUser[] = [
  {
    id: 'u-tech',
    name: 'Kenji Yamamoto',
    nameJa: '山本 健司',
    initials: 'KY',
    role: 'technician',
    dealerId: 'dl-tokyo',
    title: 'Senior Technician',
    titleJa: 'シニアテクニシャン',
  },
  {
    id: 'u-admin',
    name: 'Mika Sato',
    nameJa: '佐藤 美香',
    initials: 'MS',
    role: 'dealer-admin',
    dealerId: 'dl-tokyo',
    title: 'Service Manager',
    titleJa: 'サービスマネージャー',
  },
  {
    id: 'u-cmc',
    name: 'A. Chen',
    nameJa: '陳 安',
    initials: 'AC',
    role: 'cmc',
    dealerId: null,
    title: 'CMC Technical Support',
    titleJa: 'CMC テクニカルサポート',
  },
];

export function getDealer(id: string | null): Dealer | null {
  if (!id) return null;
  return DEALERS.find(d => d.id === id) ?? null;
}

export function getUser(id: string): AppUser | undefined {
  return USERS.find(u => u.id === id);
}

export function canAccessPath(role: Role, pathname: string): boolean {
  if (pathname.startsWith('/admin/recommendations')) return role === 'cmc';
  if (pathname.startsWith('/admin/knowledge')) return true;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return role === 'cmc' || role === 'dealer-admin';
  }
  return true;
}

export const ADMIN_NAV: { href: string; minRole: Role }[] = [
  { href: '/admin', minRole: 'dealer-admin' },
  { href: '/admin/knowledge', minRole: 'technician' },
  { href: '/admin/recommendations', minRole: 'cmc' },
];
