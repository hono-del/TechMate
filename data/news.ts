export type NewsKind = 'helpdesk' | 'release' | 'bulletin';

export interface NewsItem {
  id: string;
  kind: NewsKind;
  date: string;
  pinned?: boolean;
  titleEn: string;
  titleJa: string;
  bodyEn: string;
  bodyJa: string;
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'n-hd-hours',
    kind: 'helpdesk',
    date: '2026-10-08',
    pinned: true,
    titleEn: 'Help desk service hours — Asia Pacific',
    titleJa: 'ヘルプデスク受付時間（アジアパシフィック）',
    bodyEn:
      'Technical Help Desk is available weekdays 08:00–18:00 JST (Mon–Fri). Closed on public holidays. For urgent P1 cases after hours, use the emergency hotline listed on the dealer portal.',
    bodyJa:
      'テクニカルヘルプデスクの受付は平日 8:00–18:00（JST）です。祝日は休業です。時間外の緊急（P1）案件は、販売店ポータル記載の緊急ホットラインをご利用ください。',
  },
  {
    id: 'n-release-24',
    kind: 'release',
    date: '2026-10-06',
    pinned: true,
    titleEn: 'New program version published — TechMate 2.4',
    titleJa: '新バージョン公開 — TechMate 2.4',
    bodyEn:
      'TechMate 2.4 is now available. This release adds global AI search, PDF manual browsing (OM / SM / TM / BRM / Wiring / Technical Note), and role-based access (Technician / Dealer Admin / CMC). Please refresh your browser after the update.',
    bodyJa:
      'TechMate 2.4 を公開しました。グローバルAI検索、PDFマニュアル閲覧（OM / SM / TM / BRM / 配線図 / テクニカルノート）、ロール別アクセス（テクニシャン / ディーラー管理者 / CMC）を追加しています。更新後はブラウザを再読み込みしてください。',
  },
  {
    id: 'n-sm-rev',
    kind: 'bulletin',
    date: '2026-10-03',
    titleEn: 'Service Manual revision — Corolla Cross 2022 SM Rev.B',
    titleJa: 'サービスマニュアル改訂 — Corolla Cross 2022 SM Rev.B',
    bodyEn:
      'SM_ZVG10_CorollaCross_2022 Rev.B is now in the library. Section EC-4 (P0420) includes the post-repair connector verification step. Use Browse Manuals to open the PDF.',
    bodyJa:
      'SM_ZVG10_CorollaCross_2022 Rev.B をライブラリに登録しました。§EC-4（P0420）に修理後コネクタ確認の手順が追加されています。「マニュアル閲覧」からPDFを開けます。',
  },
  {
    id: 'n-hd-holiday',
    kind: 'helpdesk',
    date: '2026-09-29',
    titleEn: 'Help desk: reduced hours on 2026-10-12',
    titleJa: 'ヘルプデスク：2026年10月12日は短縮営業',
    bodyEn:
      'On Monday 12 October 2026 the Help Desk operates 09:00–13:00 JST only. Tickets submitted after 13:00 will be handled the next business day.',
    bodyJa:
      '2026年10月12日（月）のヘルプデスクは 9:00–13:00（JST）のみの短縮営業です。13:00以降の問い合わせは翌営業日の対応となります。',
  },
  {
    id: 'n-tn-lc',
    kind: 'bulletin',
    date: '2026-09-24',
    titleEn: 'Technical Note published — Land Cruiser 300 P0420 harness routing',
    titleJa: 'テクニカルノート公開 — Land Cruiser 300 P0420 ハーネス経路',
    bodyEn:
      'TN for 2023 Land Cruiser 300 documents RH downstream O2 harness contact with the heat shield. Review before catalyst replacement. Open via Browse Manuals (Technical Note).',
    bodyJa:
      '2023年式 Land Cruiser 300 向けTNを公開しました。右側下流O2ハーネスの遮熱板接触について記載しています。触媒交換前に確認してください。「マニュアル閲覧」のテクニカルノートから開けます。',
  },
];
