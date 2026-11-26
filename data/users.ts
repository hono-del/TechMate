// Mock dealer master (DR-004) and user master (DR-005).
// Demo only — no real authentication.

export type Role =
  | 'system-admin'
  | 'dealer-admin'
  | 'manufacturer-approver'
  | 'service-advisor'
  | 'technician'
  | 'technician-manager';

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
    id: 'u-cmc',
    name: 'A. Chen',
    nameJa: '陳 安',
    initials: 'AC',
    role: 'system-admin',
    dealerId: null,
    title: 'System Administrator',
    titleJa: 'システム管理者',
  },
  {
    id: 'u-admin',
    name: 'Mika Sato',
    nameJa: '佐藤 美香',
    initials: 'MS',
    role: 'dealer-admin',
    dealerId: 'dl-tokyo',
    title: 'Dealer Administrator',
    titleJa: 'ディーラー管理者',
  },
  {
    id: 'u-mfr',
    name: 'David Park',
    nameJa: '朴 大衛',
    initials: 'DP',
    role: 'manufacturer-approver',
    dealerId: null,
    title: 'Manufacturer Approver',
    titleJa: 'メーカー承認者',
  },
  {
    id: 'u-sa',
    name: 'Haruka Suzuki',
    nameJa: '鈴木 はるか',
    initials: 'HS',
    role: 'service-advisor',
    dealerId: 'dl-tokyo',
    title: 'Service Advisor',
    titleJa: 'サービスアドバイザー',
  },
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
    id: 'u-tm',
    name: 'Ryo Nakamura',
    nameJa: '中村 涼',
    initials: 'RN',
    role: 'technician-manager',
    dealerId: 'dl-tokyo',
    title: 'Technician Manager',
    titleJa: 'テクニシャンマネージャー',
  },
];

export function getDealer(id: string | null): Dealer | null {
  if (!id) return null;
  return DEALERS.find(d => d.id === id) ?? null;
}

export function getUser(id: string): AppUser | undefined {
  return USERS.find(u => u.id === id);
}

export function getTechnicians(): AppUser[] {
  return USERS.filter(u => u.role === 'technician');
}

export function canAssignJobs(role: Role): boolean {
  return role === 'dealer-admin' || role === 'technician-manager' || role === 'system-admin';
}

/** Floor technician cannot open Handover. Technician Leader / SA / Admin can. */
export function canOpenHandover(role: Role): boolean {
  return role !== 'technician' && role !== 'manufacturer-approver';
}

/** SA / Admin complete customer handover. Technician Leader reviews the note only. */
export function canCompleteCustomerHandover(role: Role): boolean {
  return (
    role === 'service-advisor' ||
    role === 'dealer-admin' ||
    role === 'system-admin'
  );
}

export function isSystemAdmin(role: Role): boolean {
  return role === 'system-admin';
}

export function canAccessPath(role: Role, pathname: string): boolean {
  if (role === 'service-advisor') {
    if (pathname.startsWith('/admin')) return false;
    if (pathname.match(/\/job\/[^/]+\/(diagnosis|repair|work-plan|check-verify)/)) return false;
    return true;
  }

  if (role === 'technician') {
    if (pathname.match(/\/job\/[^/]+\/reception/)) return false;
    if (pathname.match(/\/job\/[^/]+\/handover/)) return false;
    if (pathname.startsWith('/admin/knowledge')) return true;
    if (pathname.startsWith('/admin')) return false;
    return true;
  }

  if (role === 'manufacturer-approver') {
    if (pathname.startsWith('/admin/tie-manufacturer')) return true;
    if (pathname.startsWith('/admin/tie-approvals')) return true;
    if (pathname.startsWith('/admin')) return false;
    return true;
  }

  if (pathname.startsWith('/admin/recommendations')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/content')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/governance')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/prompts')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/quality')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/data-ops')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/extract')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/platform')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/review')) {
    return isSystemAdmin(role) || role === 'dealer-admin' || role === 'technician-manager';
  }
  if (pathname.startsWith('/admin/tie-approvals')) {
    return isSystemAdmin(role) || role === 'dealer-admin' || role === 'technician-manager';
  }
  if (pathname.startsWith('/admin/tie-manufacturer')) {
    return isSystemAdmin(role);
  }
  if (pathname.startsWith('/admin/accounts')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/feedback')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/templates')) return isSystemAdmin(role);
  if (pathname.startsWith('/admin/knowledge')) return true;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return isSystemAdmin(role) || role === 'dealer-admin' || role === 'technician-manager';
  }
  return true;
}

export const ADMIN_NAV: { href: string; minRole: Role }[] = [
  { href: '/admin', minRole: 'dealer-admin' },
  { href: '/admin/knowledge', minRole: 'technician' },
  { href: '/admin/content', minRole: 'system-admin' },
  { href: '/admin/review', minRole: 'dealer-admin' },
  { href: '/admin/tie-approvals', minRole: 'dealer-admin' },
  { href: '/admin/tie-manufacturer', minRole: 'system-admin' },
  { href: '/admin/recommendations', minRole: 'system-admin' },
  { href: '/admin/accounts', minRole: 'system-admin' },
  { href: '/admin/feedback', minRole: 'system-admin' },
  { href: '/admin/templates', minRole: 'system-admin' },
  { href: '/admin/governance', minRole: 'system-admin' },
  { href: '/admin/prompts', minRole: 'system-admin' },
  { href: '/admin/quality', minRole: 'system-admin' },
  { href: '/admin/data-ops', minRole: 'system-admin' },
  { href: '/admin/extract', minRole: 'system-admin' },
  { href: '/admin/platform', minRole: 'system-admin' },
];
