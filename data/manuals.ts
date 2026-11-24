export type ManualDocLang = 'en' | 'ja' | 'zh';
export type ManualKind = 'om' | 'sm' | 'tm' | 'brm' | 'wd' | 'tn';
export type ManualFormat = 'pdf' | 'html';
export type ManualEdition =
  | 'revision'
  | 'supplement'
  | 'spec-before'
  | 'spec-after'
  | 'model-specific';

export const MANUAL_KIND_ORDER: ManualKind[] = ['om', 'sm', 'tm', 'brm', 'wd', 'tn'];
export const MANUAL_DOC_LANGS: ManualDocLang[] = ['en', 'ja', 'zh'];

export interface ManualCatalogItem {
  id: string;
  model: string;
  year: string;
  kind: ManualKind;
  fileName: string;
  pageCount: number;
  revision: string;
  langs: ManualDocLang[];
  formats: ManualFormat[];
  edition: ManualEdition;
  applicable: { en: string; ja: string };
}

export interface PdfPage {
  title: string;
  heading: string;
  sections: { heading?: string; body: string[] }[];
}

export const MANUAL_MODELS = [
  'Corolla Cross',
  'RAV4',
  'Camry',
  'Yaris Cross',
  'Land Cruiser 300',
] as const;

const VEHICLES: { key: string; model: string; year: string; code: string; revision: string }[] = [
  { key: 'cc-2021', model: 'Corolla Cross', year: '2021', code: 'ZVG10', revision: 'A' },
  { key: 'cc-2022', model: 'Corolla Cross', year: '2022', code: 'ZVG10', revision: 'B' },
  { key: 'cc-2023', model: 'Corolla Cross', year: '2023', code: 'ZVG15', revision: 'A' },
  { key: 'rav4-2022', model: 'RAV4', year: '2022', code: 'AXAH54', revision: 'A' },
  { key: 'rav4-2023', model: 'RAV4', year: '2023', code: 'AXAH54', revision: 'B' },
  { key: 'camry-2021', model: 'Camry', year: '2021', code: 'AXVH70', revision: 'C' },
  { key: 'camry-2023', model: 'Camry', year: '2023', code: 'AXVH70', revision: 'A' },
  { key: 'yx-2021', model: 'Yaris Cross', year: '2021', code: 'MXPJ10', revision: 'A' },
  { key: 'yx-2022', model: 'Yaris Cross', year: '2022', code: 'MXPJ10', revision: 'B' },
  { key: 'lc-2022', model: 'Land Cruiser 300', year: '2022', code: 'FJA300', revision: 'A' },
  { key: 'lc-2023', model: 'Land Cruiser 300', year: '2023', code: 'FJA300', revision: 'B' },
];

const KIND_FILES: { kind: ManualKind; prefix: string; pageCount: number }[] = [
  { kind: 'om', prefix: 'OM', pageCount: 5 },
  { kind: 'sm', prefix: 'SM', pageCount: 6 },
  { kind: 'tm', prefix: 'TM', pageCount: 5 },
  { kind: 'brm', prefix: 'BRM', pageCount: 5 },
  { kind: 'wd', prefix: 'WD_DealerOption', pageCount: 5 },
  { kind: 'tn', prefix: 'TN', pageCount: 4 },
];

function slugModel(model: string) {
  return model.replace(/\s+/g, '');
}

const BASE_CATALOG: ManualCatalogItem[] = VEHICLES.flatMap(v =>
  KIND_FILES.map(k => {
    const formats: ManualFormat[] = k.kind === 'sm' || k.kind === 'tn' ? ['pdf', 'html'] : ['pdf'];
    return {
      id: `${v.key}-${k.kind}`,
      model: v.model,
      year: v.year,
      kind: k.kind,
      fileName: `${k.prefix}_${v.code}_${slugModel(v.model)}_${v.year}.pdf`,
      pageCount: k.pageCount,
      revision: v.revision,
      langs: ['en', 'ja', 'zh'] as ManualDocLang[],
      formats,
      edition: (v.revision === 'A' ? 'revision' : 'revision') as ManualEdition,
      applicable: {
        en: `${v.model} ${v.year} MY · all grades · Rev. ${v.revision}`,
        ja: `${v.model} ${v.year} 年式 · 全グレード · 改訂 ${v.revision}`,
      },
    };
  })
);

const CC_2022_EXTRAS: ManualCatalogItem[] = [
  {
    id: 'cc-2022-sm-supp',
    model: 'Corolla Cross',
    year: '2022',
    kind: 'sm',
    fileName: 'SM_ZVG10_CorollaCross_2022_SUPP.pdf',
    pageCount: 4,
    revision: 'B-S1',
    langs: ['en', 'ja', 'zh'],
    formats: ['pdf', 'html'],
    edition: 'supplement',
    applicable: {
      en: 'Corolla Cross 2022 MY · Hybrid · supplementary service information (connector lock after road test)',
      ja: 'Corolla Cross 2022 年式 · ハイブリッド · 補足サービス情報（ロードテスト後のコネクタロック）',
    },
  },
  {
    id: 'cc-2022-sm-before',
    model: 'Corolla Cross',
    year: '2022',
    kind: 'sm',
    fileName: 'SM_ZVG10_CorollaCross_2022_PRE.pdf',
    pageCount: 5,
    revision: 'A',
    langs: ['en', 'ja'],
    formats: ['pdf'],
    edition: 'spec-before',
    applicable: {
      en: 'Corolla Cross 2022 MY · before mid-year spec change (to Jun 2022 / VIN …43000)',
      ja: 'Corolla Cross 2022 年式 · 年中仕様変更前（2022年6月 / VIN …43000 まで）',
    },
  },
  {
    id: 'cc-2022-sm-after',
    model: 'Corolla Cross',
    year: '2022',
    kind: 'sm',
    fileName: 'SM_ZVG10_CorollaCross_2022_POST.pdf',
    pageCount: 5,
    revision: 'B',
    langs: ['en', 'ja', 'zh'],
    formats: ['pdf', 'html'],
    edition: 'spec-after',
    applicable: {
      en: 'Corolla Cross 2022 MY · after mid-year spec change (from Jul 2022 / VIN …43001)',
      ja: 'Corolla Cross 2022 年式 · 年中仕様変更後（2022年7月 / VIN …43001 から）',
    },
  },
  {
    id: 'cc-2022-sm-z',
    model: 'Corolla Cross',
    year: '2022',
    kind: 'sm',
    fileName: 'SM_ZVG10_CorollaCross_2022_Z.pdf',
    pageCount: 4,
    revision: 'B-Z',
    langs: ['en', 'ja', 'zh'],
    formats: ['pdf', 'html'],
    edition: 'model-specific',
    applicable: {
      en: 'Corolla Cross 2022 MY · Hybrid Z grade only (high-voltage service plug procedure)',
      ja: 'Corolla Cross 2022 年式 · ハイブリッド Z グレードのみ（高電圧サービスプラグ手順）',
    },
  },
];

export const MANUAL_CATALOG: ManualCatalogItem[] = [...BASE_CATALOG, ...CC_2022_EXTRAS];

export function getManual(id: string): ManualCatalogItem | undefined {
  return MANUAL_CATALOG.find(m => m.id === id);
}

export function yearsForModel(model: string): string[] {
  return [...new Set(MANUAL_CATALOG.filter(m => m.model === model).map(m => m.year))];
}

export function manualsFor(model: string, year: string): ManualCatalogItem[] {
  return MANUAL_CATALOG
    .filter(m => m.model === model && m.year === year)
    .sort((a, b) => MANUAL_KIND_ORDER.indexOf(a.kind) - MANUAL_KIND_ORDER.indexOf(b.kind));
}

function ja(lang: ManualDocLang) {
  return lang === 'ja';
}

export function getManualPages(item: ManualCatalogItem, lang: ManualDocLang): PdfPage[] {
  const useLang: ManualDocLang = item.langs.includes(lang) ? lang : (item.langs[0] ?? 'en');
  if (useLang === 'zh') return zhPages(item);
  if (item.kind === 'om') return omPages(item, useLang);
  if (item.kind === 'tm') return tmPages(item, useLang);
  if (item.kind === 'brm') return brmPages(item, useLang);
  if (item.kind === 'wd') return wdPages(item, useLang);
  if (item.kind === 'tn') return tnPages(item, useLang);
  return smPages(item, useLang);
}

function zhPages(item: ManualCatalogItem): PdfPage[] {
  const editionNote =
    item.edition === 'supplement' ? '补充服务信息' :
    item.edition === 'spec-before' ? '年中规格变更前' :
    item.edition === 'spec-after' ? '年中规格变更后' :
    item.edition === 'model-specific' ? '车型专用追加' :
    `修订 ${item.revision}`;

  return [
    {
      title: '封面',
      heading: item.kind === 'om' ? '用户手册' : item.kind === 'tn' ? '技术通报' : '维修手册',
      sections: [{
        body: [
          `${item.model}  ·  ${item.year} 年款`,
          `适用：${item.applicable.en}`,
          `版本：${editionNote}  /  ${item.fileName}`,
          '演示用中文内容。请勿用于实车维修。',
        ],
      }],
    },
    {
      title: '目录',
      heading: '目录',
      sections: [{
        body: ['1. 适用范围', '2. 安全注意事项', '3. P0420 / 氧传感器要点', '4. 规定值'],
      }],
    },
    {
      title: '适用',
      heading: '1. 适用范围',
      sections: [{
        heading: '适用车辆',
        body: [
          item.applicable.en,
          '作业前请核对 VIN、发动机型号与规格变更范围。',
        ],
      }],
    },
    {
      title: '安全',
      heading: '2. 安全注意事项',
      sections: [{
        body: [
          '混合动力 / 高压车型须先拔下维修插头，并遵守规定等待时间。',
          '排气系统作业时注意隔热板温度。',
        ],
      }],
    },
    {
      title: 'P0420',
      heading: '3. P0420 / 氧传感器要点',
      sections: [{
        heading: '检查要点',
        body: item.edition === 'supplement'
          ? [
              '传感器更换后，路试结束必须复查连接器锁止。',
              '振动可能导致锁止回退，从而再次存储 P0420。',
            ]
          : item.edition === 'model-specific'
            ? [
                'Hybrid Z：高压系统未断电时禁止拆装下游氧传感器。',
                '确认 READY 灯熄灭后再开始排气作业。',
              ]
            : [
                '在判定催化剂故障前，先检查下游氧传感器波形与连接器。',
                '更换后执行路试，确认故障码不再存储。',
              ],
      }],
    },
    {
      title: '规定值',
      heading: '4. 规定值',
      sections: [{
        body: [
          '氧传感器（Bank 1 Sensor 2）：40 N·m',
          '排气法兰：21 N·m',
          `来源：${item.fileName}`,
        ],
      }],
    },
  ];
}

function smPages(item: ManualCatalogItem, lang: ManualDocLang): PdfPage[] {
  const isLc = item.model.includes('Land Cruiser');
  const isCc = item.model.includes('Corolla Cross');
  const J = ja(lang);

  return [
    {
      title: J ? '表紙' : 'Cover',
      heading: J ? 'サービスマニュアル' : 'SERVICE MANUAL',
      sections: [
        {
          body: [
            `${item.model}  ·  ${item.year} MY`,
            J ? `発行: TechMate OEM Publication  /  改訂 ${item.revision}` : `Published: TechMate OEM Publication  /  Rev. ${item.revision}`,
            item.fileName,
            J ? '本文はデモ用の架空コンテンツです。実車整備には使用しないでください。' : 'Fictional content for demonstration only. Do not use for actual vehicle repair.',
          ],
        },
      ],
    },
    {
      title: J ? '目次' : 'Contents',
      heading: J ? '目次' : 'TABLE OF CONTENTS',
      sections: [
        {
          body: J
            ? [
                '1.  一般情報 ………………………………………… 3',
                '2.  エンジン制御（EC） ……………………………… 4',
                isLc ? '3.  DTC P0420 診断（両バンク） ………………… 5' : '3.  DTC P0420 診断手順 ……………………………… 5',
                '4.  規定値・トルク …………………………………… 6',
              ]
            : [
                '1.  General Information ………………………… 3',
                '2.  Engine Control (EC) ………………………… 4',
                isLc ? '3.  DTC P0420 Diagnosis (Both Banks) …… 5' : '3.  DTC P0420 Diagnostic Procedure …… 5',
                '4.  Specifications & Torque ………………… 6',
              ],
        },
      ],
    },
    {
      title: J ? '一般情報' : 'General',
      heading: J ? '1. 一般情報' : '1. GENERAL INFORMATION',
      sections: [
        {
          heading: J ? '適用' : 'Applicable vehicles',
          body: J
            ? [`本マニュアルは ${item.model}（${item.year} 年式）に適用します。整備前にVIN・エンジン型式を照合してください。`]
            : [`This manual applies to ${item.model} (${item.year} MY). Confirm VIN and engine type before service.`],
        },
        {
          heading: J ? '安全' : 'Safety',
          body: J
            ? ['ハイブリッド／高電圧系統がある車種では、整備前にサービスプラグを外し、規定の待機時間を守ること。', '排気系統作業時は遮熱板の温度に注意する。']
            : ['For hybrid / high-voltage models, remove the service plug and observe the required wait time.', 'When working on the exhaust system, be aware of heat-shield temperature.'],
        },
      ],
    },
    {
      title: J ? 'エンジン制御' : 'Engine Control',
      heading: J ? '2. エンジン制御（EC）' : '2. ENGINE CONTROL (EC)',
      sections: [
        {
          heading: J ? '概要' : 'Overview',
          body: J
            ? [
                isLc
                  ? 'Land Cruiser 300 のV8はバンク1／バンク2の独立した触媒モニタを持つ。P0420判定前に両バンク下流O2（B1S2／B2S2）の波形を比較する。'
                  : `${item.model} の触媒モニタは下流O2センサー応答に基づく。P0420は効率低下を示すが、配線・コネクタ不具合でも記憶される。`,
              ]
            : [
                isLc
                  ? 'The Land Cruiser 300 V8 has independent catalyst monitors per bank. Compare B1S2 / B2S2 waveforms before condemning a catalyst for P0420.'
                  : `Catalyst monitoring on ${item.model} uses downstream O2 response. P0420 indicates efficiency below threshold but can also be stored from wiring or connector faults.`,
              ],
        },
        {
          heading: J ? '診断の流れ' : 'Diagnostic flow',
          body: J
            ? ['① DTC確認 → ② フリーズフレーム → ③ センサー波形 → ④ ハーネス／コネクタ → ⑤ 触媒判定']
            : ['1) Confirm DTC  →  2) Freeze frame  →  3) Sensor waveform  →  4) Harness / connector  →  5) Catalyst decision'],
        },
      ],
    },
    {
      title: J ? 'P0420 診断' : 'P0420 Diagnosis',
      heading: J ? '3. DTC P0420 — 触媒システム効率' : '3. DTC P0420 — CATALYST SYSTEM EFFICIENCY',
      sections: [
        {
          heading: J ? '点検手順' : 'Inspection',
          body: isLc
            ? (J
                ? [
                    '両バンク下流O2（B1S2／B2S2）の応答を比較する。片バンクのみ異常なら触媒交換の前にハーネス経路を点検する。',
                    '2023年式では右側下流ハーネスが遮熱板と接触する既知事象がある（TIE-2023-214）。',
                    'コネクタロックの戻りと端子酸化を確認し、ロードテスト後に再点検する。',
                  ]
                : [
                    'Compare downstream O2 response on both banks (B1S2 / B2S2). If only one bank is abnormal, inspect harness routing before replacing the catalyst.',
                    '2023 MY has a known issue: RH downstream harness contact with the heat shield (TIE-2023-214).',
                    'Confirm connector lock and terminal oxidation. Recheck after a road test.',
                  ])
            : (J
                ? [
                    isCc
                      ? 'Corolla Cross ではセンサー交換後の再発が多い。コネクタロックと端子状態を必ず確認する。'
                      : '触媒断定の前に下流O2センサーとコネクタを点検する。',
                    '交換後はロードテストを実施し、DTCが再記憶されないことを確認する。',
                    '規定トルクを守り、シール面の損傷がないことを確認する。',
                  ]
                : [
                    isCc
                      ? 'On Corolla Cross, P0420 often returns after sensor replacement. Always inspect connector lock and terminals.'
                      : 'Inspect the downstream O2 sensor and connector before condemning the catalyst.',
                    'After replacement, road-test and confirm the DTC does not return.',
                    'Use specified torque and inspect sealing surfaces.',
                  ]),
        },
      ],
    },
    {
      title: J ? '規定値' : 'Specifications',
      heading: J ? '4. 規定値・トルク' : '4. SPECIFICATIONS & TORQUE',
      sections: [
        {
          body: J
            ? [
                isLc ? 'O2センサー（各バンク下流）: 44 N·m' : 'O2センサー（Bank 1 Sensor 2）: 40 N·m',
                '排気フランジ: 21 N·m',
                '遮熱板ボルト: 10 N·m（過締め注意）',
                `出典: ${item.fileName}  Rev.${item.revision}`,
              ]
            : [
                isLc ? 'O2 sensor (downstream, each bank): 44 N·m' : 'O2 sensor (Bank 1 Sensor 2): 40 N·m',
                'Exhaust flange: 21 N·m',
                'Heat shield bolts: 10 N·m (do not overtighten)',
                `Source: ${item.fileName}  Rev.${item.revision}`,
              ],
        },
      ],
    },
  ];
}

function omPages(item: ManualCatalogItem, lang: ManualDocLang): PdfPage[] {
  const J = ja(lang);
  return [
    {
      title: J ? '表紙' : 'Cover',
      heading: J ? '取扱説明書' : "OWNER'S MANUAL",
      sections: [
        {
          body: [
            `${item.model}  ·  ${item.year} MY`,
            item.fileName,
            J ? 'デモ用コンテンツです。' : 'Demonstration content only.',
          ],
        },
      ],
    },
    {
      title: J ? '目次' : 'Contents',
      heading: J ? '目次' : 'CONTENTS',
      sections: [
        {
          body: J
            ? ['1. 安全上の注意', '2. 警告灯の見方', '3. メンテナンス', '4. 非常時']
            : ['1. Safety', '2. Warning lights', '3. Maintenance', '4. In case of emergency'],
        },
      ],
    },
    {
      title: J ? '警告灯' : 'Warning lights',
      heading: J ? '2. 警告灯の見方' : '2. WARNING LIGHTS',
      sections: [
        {
          heading: J ? 'チェックエンジンランプ' : 'Check engine light',
          body: J
            ? [
                '点灯したまま走行を続けると触媒等を損傷するおそれがあります。安全な場所に停車し、販売店へ連絡してください。',
                `${item.model} ${item.year}：エンジン回転が不安定な場合は直ちに停車してください。`,
              ]
            : [
                'Continued driving with this light on may damage the catalyst. Stop in a safe place and contact a dealer.',
                `${item.model} ${item.year}: If engine speed is unstable, stop immediately.`,
              ],
        },
      ],
    },
    {
      title: J ? 'メンテナンス' : 'Maintenance',
      heading: J ? '3. メンテナンス' : '3. MAINTENANCE',
      sections: [
        {
          body: J
            ? ['定期点検は販売店の指定間隔で実施してください。', '排気系統の異音・異臭がある場合は点検を依頼してください。']
            : ['Follow the dealer-specified inspection interval.', 'Have the exhaust system inspected if unusual noise or smell occurs.'],
        },
      ],
    },
    {
      title: J ? '非常時' : 'Emergency',
      heading: J ? '4. 非常時の対処' : '4. IN CASE OF EMERGENCY',
      sections: [
        {
          body: J
            ? ['警告灯点灯時はハザードを点灯し、安全な場所へ退避する。', 'ロードサービス連絡先はグローブボックスのカードを参照。']
            : ['Turn on hazard lights and move to a safe location.', 'See the roadside assistance card in the glove box.'],
        },
      ],
    },
  ];
}

function tmPages(item: ManualCatalogItem, lang: ManualDocLang): PdfPage[] {
  const J = ja(lang);
  return [
    {
      title: J ? '表紙' : 'Cover',
      heading: J ? 'トレーニングマニュアル' : 'TRAINING MANUAL',
      sections: [{
        body: [
          `${item.model}  ·  ${item.year} MY`,
          item.fileName,
          J ? 'テクニシャン研修用。デモ用の架空コンテンツです。' : 'For technician training. Fictional demo content.',
        ],
      }],
    },
    {
      title: J ? '目次' : 'Contents',
      heading: J ? '目次' : 'CONTENTS',
      sections: [{
        body: J
          ? ['1. 学習目標', '2. システム概要', '3. 実技チェックポイント', '4. 確認テスト']
          : ['1. Learning objectives', '2. System overview', '3. Hands-on checkpoints', '4. Knowledge check'],
      }],
    },
    {
      title: J ? '学習目標' : 'Objectives',
      heading: J ? '1. 学習目標' : '1. LEARNING OBJECTIVES',
      sections: [{
        body: J
          ? [
              `${item.model}（${item.year}）の基本構造と安全作業を理解する。`,
              '診断〜修理〜検証の流れを、サービスマニュアルと照合しながら実施できる。',
            ]
          : [
              `Understand the basic structure and safe work practices for ${item.model} (${item.year}).`,
              'Perform diagnosis, repair, and verification while cross-checking the Service Manual.',
            ],
      }],
    },
    {
      title: J ? '実技' : 'Hands-on',
      heading: J ? '3. 実技チェックポイント' : '3. HANDS-ON CHECKPOINTS',
      sections: [{
        body: J
          ? ['PPEと高電圧安全を確認してから作業を開始する。', 'O2センサー／コネクタ点検はSMのトルク規定に従う。', '作業後はロードテストとDTC再確認を必ず行う。']
          : ['Confirm PPE and high-voltage safety before starting.', 'Inspect O2 sensors / connectors using SM torque specs.', 'Always road-test and recheck DTCs after the job.'],
      }],
    },
    {
      title: J ? '確認' : 'Check',
      heading: J ? '4. 確認テスト' : '4. KNOWLEDGE CHECK',
      sections: [{
        body: J
          ? ['Q: P0420を触媒故障と断定する前に確認すべき項目は？', 'A: 下流O2波形、コネクタロック、ハーネス経路、修理後検証。']
          : ['Q: What must be checked before condemning a catalyst for P0420?', 'A: Downstream O2 waveform, connector lock, harness routing, and post-repair verification.'],
      }],
    },
  ];
}

function brmPages(item: ManualCatalogItem, lang: ManualDocLang): PdfPage[] {
  const J = ja(lang);
  return [
    {
      title: J ? '表紙' : 'Cover',
      heading: J ? 'ボデー修理書' : 'BODY REPAIR MANUAL',
      sections: [{
        body: [
          `${item.model}  ·  ${item.year} MY`,
          item.fileName,
          J ? '外板・骨格補修用。デモ用の架空コンテンツです。' : 'For outer panel and structural repair. Fictional demo content.',
        ],
      }],
    },
    {
      title: J ? '目次' : 'Contents',
      heading: J ? '目次' : 'CONTENTS',
      sections: [{
        body: J
          ? ['1. ボデー寸法', '2. 外板パネル交換', '3. 溶接・シーリング', '4. 防錆・塗装準備']
          : ['1. Body dimensions', '2. Outer panel replacement', '3. Welding & sealing', '4. Corrosion prevention / paint prep'],
      }],
    },
    {
      title: J ? '寸法' : 'Dimensions',
      heading: J ? '1. ボデー寸法' : '1. BODY DIMENSIONS',
      sections: [{
        body: J
          ? [`${item.model} ${item.year} の測定基準点はフロントサイドメンバー前端を基準とする。`, '計測前に車両を水平なリフトに固定し、指定ゲージを使用する。']
          : [`Measurement datum for ${item.model} ${item.year} is the front side-member leading edge.`, 'Secure the vehicle on a level lift and use the specified gauges.'],
      }],
    },
    {
      title: J ? 'パネル' : 'Panels',
      heading: J ? '2. 外板パネル交換' : '2. OUTER PANEL REPLACEMENT',
      sections: [{
        body: J
          ? ['切断位置は工場溶接ビードから 10 mm 以上離す。', 'アルミパネル車種では専用工具と異種金属接触防止を守る。']
          : ['Keep cut lines at least 10 mm from factory weld beads.', 'On aluminum-panel models, use dedicated tools and prevent dissimilar-metal contact.'],
      }],
    },
    {
      title: J ? '溶接' : 'Welding',
      heading: J ? '3. 溶接・シーリング' : '3. WELDING & SEALING',
      sections: [{
        body: J
          ? ['スポット溶接のピッチは 30–40 mm。シーラーは指定品を使用する。', '電装ハーネス近傍では遮熱板を仮付けしてから溶接する。']
          : ['Spot-weld pitch: 30–40 mm. Use specified sealer.', 'Near wiring harnesses, temporarily fit the heat shield before welding.'],
      }],
    },
  ];
}

function wdPages(item: ManualCatalogItem, lang: ManualDocLang): PdfPage[] {
  const J = ja(lang);
  return [
    {
      title: J ? '表紙' : 'Cover',
      heading: J ? 'ディーラーオプション装備配線図' : 'DEALER OPTION EQUIPMENT WIRING DIAGRAM',
      sections: [{
        body: [
          `${item.model}  ·  ${item.year} MY`,
          item.fileName,
          J ? 'ディーラー装着オプションの回路図。デモ用の架空コンテンツです。' : 'Circuit diagrams for dealer-installed options. Fictional demo content.',
        ],
      }],
    },
    {
      title: J ? '目次' : 'Contents',
      heading: J ? '目次' : 'CONTENTS',
      sections: [{
        body: J
          ? ['1. 凡例・コネクタ番号', '2. ドライブレコーダー', '3. ナビ／ETC', '4. 電源取り出し位置']
          : ['1. Legend & connector IDs', '2. Dash camera', '3. Navigation / ETC', '4. Power tap locations'],
      }],
    },
    {
      title: J ? '凡例' : 'Legend',
      heading: J ? '1. 凡例・コネクタ番号' : '1. LEGEND & CONNECTOR IDs',
      sections: [{
        body: J
          ? ['実線 = 常時電源、破線 = IG電源、一点鎖線 = ACC。', `${item.model} の室内ヒューズボックスはグローブボックス奥。`]
          : ['Solid = constant B+, dashed = IG, dash-dot = ACC.', `Cabin fuse block on ${item.model} is behind the glove box.`],
      }],
    },
    {
      title: J ? 'ドラレコ' : 'Dash cam',
      heading: J ? '2. ドライブレコーダー回路' : '2. DASH CAMERA CIRCUIT',
      sections: [{
        body: J
          ? ['B+ : ヒューズ BOX 端子 BATT (10A) → 赤線', 'GND : カウルサイドアース → 黒線', 'ACC : シガーソケット裏 → 黄線']
          : ['B+: Fuse box BATT (10A) → red', 'GND: cowl-side ground → black', 'ACC: rear of cigar socket → yellow'],
      }],
    },
    {
      title: J ? '電源' : 'Power tap',
      heading: J ? '4. 電源取り出し位置' : '4. POWER TAP LOCATIONS',
      sections: [{
        body: J
          ? ['室内: ヒューズボックス ACC 空き端子。エンジンルームからの追加取り出しは禁止。', 'オプションハーネスは純正クリップ位置のみを使用する。']
          : ['Cabin: spare ACC cavity in the fuse box. Do not tap from the engine bay.', 'Route option harnesses only at factory clip points.'],
      }],
    },
  ];
}

function tnPages(item: ManualCatalogItem, lang: ManualDocLang): PdfPage[] {
  const J = ja(lang);
  const isLc = item.model.includes('Land Cruiser');
  return [
    {
      title: J ? '表紙' : 'Cover',
      heading: J ? 'テクニカルノート' : 'TECHNICAL NOTE',
      sections: [{
        body: [
          `${item.model}  ·  ${item.year} MY`,
          item.fileName,
          J ? '現場向け技術連絡。デモ用の架空コンテンツです。' : 'Field technical bulletin. Fictional demo content.',
        ],
      }],
    },
    {
      title: J ? '対象' : 'Applicability',
      heading: J ? '対象車両' : 'APPLICABLE VEHICLES',
      sections: [{
        body: J
          ? [`車種: ${item.model}`, `年式: ${item.year} MY`, '対象: 全VIN（デモ）']
          : [`Model: ${item.model}`, `Year: ${item.year} MY`, 'VIN: All (demo)'],
      }],
    },
    {
      title: J ? '内容' : 'Condition',
      heading: J ? '現象' : 'CONDITION',
      sections: [{
        body: isLc
          ? (J
              ? ['右側下流O2ハーネスが遮熱板と接触し、P0420が誤判定される場合がある。', '触媒交換の前にハーネス経路とクリップ固定を確認すること。']
              : ['RH downstream O2 harness may contact the heat shield and falsely store P0420.', 'Inspect harness routing and clips before replacing the catalyst.'])
          : (J
              ? ['O2センサー交換後にP0420が再発する事例が報告されている。', 'コネクタロックと端子酸化、修理後ロードテストを必須とする。']
              : ['P0420 has been reported to return after O2 sensor replacement.', 'Connector lock, terminal oxidation, and a post-repair road test are mandatory.']),
      }],
    },
    {
      title: J ? '対策' : 'Action',
      heading: J ? '推奨処置' : 'RECOMMENDED ACTION',
      sections: [{
        body: J
          ? ['1. 該当ハーネスを目視点検し、擦れ・溶損がないか確認する。', '2. 経路を修正し、指定クリップで再固定する。', '3. ロードテスト後にDTCが再記憶されないことを確認する。']
          : ['1. Visually inspect the harness for abrasion or heat damage.', '2. Reroute and secure with specified clips.', '3. Confirm the DTC does not return after a road test.'],
      }],
    },
  ];
}
