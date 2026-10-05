/**
 * Japanese translations for mock data strings.
 * Structure mirrors mockData.ts, keyed for easy merge.
 */

export const JA_JOB001 = {
  customerConcern: '走行中に警告灯が点灯し、現在も点灯したまま',
  symptoms: [
    'チェックエンジンライト点灯',
    '走行性能への明らかな影響なし',
    '高速道路走行中に点灯',
  ],
  vehicle: {
    grade: 'Z（ハイブリッド）',
    color: 'プラチナホワイトパール',
  },
  serviceHistory: {
    'sh-001': {
      description: '12ヶ月定期点検',
      result: '完了 — 問題なし',
    },
    'sh-002': {
      description: 'アイドリング時のエンジン音について顧客申告',
      result: '解決済み — MAFセンサー清掃、DTC消去',
    },
  },
  diagnosis: {
    confirmedCause: '下流O2センサー信号劣化による触媒システム効率低下',
    possibleCauses: {
      'pc-001': {
        description: '触媒コンバーター効率がOEM基準値以下',
        evidence: 'P0420確認、O2センサー波形劣化、25,430km — 既知の故障ウィンドウ内',
      },
      'pc-002': {
        description: '下流O2センサー（バンク1センサー2）の不具合',
        evidence: 'フリーズフレームデータにてセンサー応答が規定値以下',
      },
      'pc-003': {
        description: '触媒上流部の排気漏れ',
        evidence: '顧客からの排気臭報告なし、目視点検は保留',
      },
    },
    diagnosticFlow: [
      'DTC P0420の確認 — バンク1触媒システム効率低下',
      'GTSでフリーズフレームデータとO2センサー波形を確認',
      'TWC上流部の排気漏れを点検',
      '上流と下流のO2センサー切替頻度を比較',
      '触媒コンバーターの温度と転換効率を確認',
    ],
  },
  workPlan: {
    repairDescription: 'O2センサー交換 — バンク1、センサー2（下流）',
    confirmedCause: '下流O2センサー信号劣化による触媒コンバーター効率低下',
    precautions: [
      'HV安全: 作業前に「READY」ランプが消灯していることを確認',
      '排気熱: センサーに触れる前に最低30分冷却',
      'ねじ山保護: 損傷防止のため取外し前に浸透油を塗布',
      '焼付防止剤: ねじ山に塗布、ただしセンサーチップ側の最初の2山には塗布不可',
    ],
    similarCases: [
      'TIE-2022-0188: Corolla Cross（2021–2022）のP0420 — 94%のケースでO2センサー交換で解決',
      'TIE-2021-0315: 触媒効率低下 — 診断手順（GTS使用）',
    ],
    procedure: {
      'step-001': {
        title: '準備・安全確認',
        description: '車両を水平な場所に停車。パーキングブレーキを確認。排気管を冷却（最低30分）。法規に応じてバッテリーのマイナス端子を外す。必要な工具・部品を揃える。',
        warnings: [
          '排気部品は極めて高温になります。最低30分冷却してください。',
          'ハイブリッド車 — HV安全手順に従ってください。オレンジ色のHVケーブルに触れないこと。',
        ],
        specifications: ['排気管接触前の待機時間: 最低30分'],
      },
      'step-002': {
        title: 'O2センサー位置確認（バンク1センサー2）',
        description: '車両をリフトアップ。触媒コンバーター後方の排気管にある下流O2センサー（バンク1センサー2）を確認。コネクターはトランスミッショントンネル付近にある。電気コネクターを外し、ヒートシールドがあれば取り外す。',
        warnings: [
          '正しいセンサー位置を確認 — バンク1センサー2（下流/触媒後）。バンク1センサー1（上流/触媒前）と混同しないこと。',
        ],
      },
      'step-003': {
        title: '旧O2センサーの取り外し',
        description: 'センサーのねじ山に浸透油を塗布。5分待つ。O2センサーソケット（22mm）を使用して反時計回りに緩める。センサーを完全に取り外す。センサーチップの汚染（油・冷却水・カーボン）を点検。センサーバング（取付穴）の損傷を点検。',
        specifications: ['浸透油浸漬時間: 最低5分'],
        warnings: [
          '取り外し前に必ず浸透油を塗布してねじ山の損傷を防いでください。ねじ山が損傷すると排気管の交換が必要になります。',
        ],
      },
      'step-004': {
        title: '新O2センサーの取り付け',
        description: '新しいセンサーのねじ山に焼付防止剤を塗布（センサーチップ側の最初の2山には塗布しないこと）。クロスねじを避けるため手でまず回し込む。O2センサーソケットを使用してトルク規定値まで締め付ける。',
        warnings: [
          '最初の2山には焼付防止剤を塗布しないこと — センサーチップの汚染につながります。',
          'クロスねじを防ぐため、最初は手でねじ込むこと。',
        ],
        specifications: ['締付トルク: 40 N·m', '焼付防止剤: 最初の2山を除くねじ山に塗布'],
      },
      'step-005': {
        title: '再接続・検証',
        description: 'センサーケーブルを排気熱から離して配線。電気コネクターを接続 — クリック音/ロックを確認。ヒートシールドを再取り付け。車両を下ろす。外した場合はバッテリーを再接続。GTSでDTC P0420を消去。エンジンを始動して動作温度まで暖機。レディネスモニターの完了を確認。',
        warnings: [
          'ケーブルを排気管から離して配線し、絶縁体の熱損傷を防ぐこと。',
        ],
        specifications: ['レディネスモニター: ドライブサイクル後にI/Mレディネス完了を確認'],
      },
    },
    requiredParts: {
      '89465-12760': { name: 'エアフューエルレシオセンサーアッセンブリ（バンク1センサー2）' },
      '90119-06197': { name: 'ボルト、排気管サポート' },
    },
    requiredTools: {
      'SST 09224-00010': { name: 'O2センサーソケット 22mm' },
      '09816-00010':     { name: 'トルクレンチ（0〜50 N·m）' },
      'GTS':             { name: 'テックストリーム診断ツール' },
    },
  },
};

export const JA_ALL_JOBS = {
  'job-001': { customerConcern: '走行中に警告灯が点灯し、現在も点灯したまま', symptoms: ['チェックエンジンライト点灯', '走行性能への明らかな影響なし', '高速道路走行中に点灯'] },
  'job-002': { customerConcern: 'エアコンの効きが悪い', symptoms: ['冷房が弱い', 'コンプレッサー音がする'] },
  'job-003': { customerConcern: '6ヶ月定期点検', symptoms: [] },
  'job-004': { customerConcern: '高速走行時に振動あり — ステアリングホイールが震える', symptoms: ['100km/h以上でステアリング振動', '加速時に悪化'] },
};

export const JA_KNOWLEDGE: Record<string, {
  title?: string;
  summary?: string;
  whyRecommended?: string;
  warnings?: string[];
}> = {
  'k-001': {
    title: 'TIE-2022-0188: P0420 — 触媒効率（Corolla Cross 2021–2022）',
    summary: 'Corolla Cross 2021–2022のP0420は、触媒故障前に下流O2センサーの劣化が原因であることがあります。触媒を断定する前にセンサー2を先に交換してください。',
    whyRecommended: '車種・年式・DTC P0420が完全一致',
    warnings: ['触媒を交換する前にO2センサーの状態を確認してください'],
  },
  'k-002': {
    title: 'サービスマニュアル §EC-4: P0420 — 触媒システム効率（バンク1）',
    summary: 'P0420の公式診断手順。DTC説明、OBD-IIモニタリング条件、フリーズフレーム分析、ステップバイステップの診断フローを含む。',
    whyRecommended: '確認済みDTC P0420のOEM公式診断手順',
  },
  'k-003': {
    title: 'Q: 2022 Corolla Crossの触媒交換後にP0420が再発',
    summary: '「触媒を交換したが200km以内にP0420が再発した。」 回答: 触媒交換後のP0420再発は、ほぼ全ての場合において下流O2センサー交換の見落としが原因です。',
    whyRecommended: '全く同じ車種・症状のシナリオ — 再修理を防ぐ',
  },
  'k-004': {
    title: 'サービスマニュアル §EM-47: O2センサー取外し・取付',
    summary: 'O2センサーの取り外しと取り付けのステップバイステップ手順。トルク規定値（40 N·m）、焼付防止剤の適用方法、ハイブリッド排気系への注意事項を含む。',
    whyRecommended: '確定済みO2センサー交換修理に必要な手順',
    warnings: [
      '排気管に触れる前に30分以上冷却してください',
      '最初の2山には焼付防止剤を塗布しないこと',
      'HV: READYインジケーターが消灯していることを確認',
    ],
  },
  'k-005': {
    title: '⚠ ハイブリッド安全: HVシステム — 排気作業注意事項',
    summary: 'ハイブリッド車の排気系作業前: (1) 電源OFF、READYインジケーター消灯を確認。(2) 電源OFF後5分待機。(3) オレンジ色ケーブルに触れないこと。',
    whyRecommended: '車両はハイブリッド — 排気作業にはHV安全プロトコルが必要',
    warnings: [
      '排気作業前に「READY」インジケーターが消灯していることを確認',
      '電源OFF後、HV部品に触れるまで最低5分待機',
      'オレンジ色の高電圧ケーブルを切断・取り外し・改造しないこと',
    ],
  },
  'k-006': {
    title: 'TIE-2021-0315: P0420診断 — GTS波形分析手順',
    summary: 'Techstream（GTS）を使用して触媒効率とO2センサー状態を確認する方法。正常センサーパターンと劣化センサーパターンの波形例付き。',
    whyRecommended: 'DTC P0420確認済み — 根本原因確認にGTS手順が必要',
  },
  'k-007': {
    title: '必要部品: O2センサー 89465-12760（バンク1センサー2）',
    summary: 'バンク1センサー2用エアフューエルレシオセンサーアッセンブリ（下流/触媒後）。部品番号 89465-12760。在庫あり。',
    whyRecommended: '確定済みO2センサー交換に必要な部品',
  },
  'k-008': {
    title: '現場事例: P0420 — Corolla Cross 2022、センサー交換で解決',
    summary: '別の販売店での類似事例。DTC P0420、23,800km。下流O2センサー交換（89465-12760）。解決済み — DTC消去、レディネスモニター完了、30日後フォローアップで再発なし。',
    whyRecommended: '同車種・同DTC・同程度の走行距離 — 解決経路が確認済み',
  },
  'k-009': {
    title: '修理後確認チェックリスト: 排気系関連DTC',
    summary: '排気系関連DTC修理完了後の必須確認手順: DTC消去、レディネスモニター、ロードテスト、機能確認。',
    whyRecommended: 'P0420は排気系関連 — 修理後の確認が必要',
  },
};

export const JA_VERIFICATION_ITEMS: Record<string, { category: string; description: string }> = {
  'v-001': { category: 'DTCステータス', description: 'GTSを使用してDTC P0420を消去' },
  'v-002': { category: 'DTCステータス', description: '消去後に新しいDTCが発生していないことを確認' },
  'v-003': { category: '機能確認', description: 'エンジン始動 — チェックエンジンライトが点灯しないことを確認' },
  'v-004': { category: '機能確認', description: 'O2センサー B1S2のライブデータをモニター — 正常応答を確認' },
  'v-005': { category: 'ロードテスト', description: 'ロードテスト: クローズドループ条件で40km/h以上を最低5分走行' },
  'v-006': { category: 'ロードテスト', description: 'ロードテスト中および後に、チェックエンジンライトが点灯しないことを確認' },
  'v-007': { category: 'I/Mレディネス', description: 'GTS I/MレディネスにてCatalyst MonitorがCOMPLETEと表示されることを確認' },
  'v-008': { category: 'I/Mレディネス', description: 'GTS I/MレディネスにてO2 Sensor MonitorがCOMPLETEと表示されることを確認' },
  'v-009': { category: '目視点検', description: 'センサーコネクターを点検 — 確実な接続と損傷がないことを確認' },
  'v-010': { category: '目視点検', description: 'ケーブル配線を確認 — 排気熱から離れていることを確認' },
  'v-011': { category: 'トルク確認', description: 'センサートルクが40 N·m（§EM-47に基づく）であることを確認' },
  'v-012': { category: 'ドキュメント', description: '実際の修理内容と使用部品をジョブレコードに記録' },
};

// ─── Reception: Suggested Customer Questions ────────────────────────────────
export const JA_CUSTOMER_QUESTIONS = [
  {
    id: 'cq-1', category: '点灯状況',
    question: '警告灯が最初に点灯したのはいつですか？',
    options: ['1週間以内', '1〜2週間前', '1ヶ月以上前', '不明'],
  },
  {
    id: 'cq-2', category: '点灯状況',
    question: '点灯の仕方はどうですか？',
    options: ['継続点灯中', '消えたり点いたり', '一度だけ点いた', '不明'],
  },
  {
    id: 'cq-3', category: '点灯状況',
    question: '点灯したときの走行状況を教えてください',
    options: ['高速道路走行中', '市街地走行中', 'アイドリング中', 'その他 / 不明'],
  },
  {
    id: 'cq-4', category: '走行・症状',
    question: '警告灯点灯後、異音・異臭・振動はありましたか？',
    options: ['あった', 'なかった', '気になる程度', '不明'],
  },
  {
    id: 'cq-5', category: '走行・症状',
    question: '燃費や加速感に変化はありましたか？',
    options: ['悪化した', '変化なし', '少し気になる', '不明'],
  },
  {
    id: 'cq-6', category: '燃料・使用環境',
    question: '最近、燃料のブランドや種類を変えましたか？',
    options: ['変えた', '変えていない', '不明'],
  },
  {
    id: 'cq-7', category: '燃料・使用環境',
    question: '普段の走行パターンはどれに近いですか？',
    options: ['高速中心', '市街地中心', '半々くらい'],
  },
  {
    id: 'cq-8', category: '整備・修理履歴',
    question: '他店での整備・修理を最近受けましたか？',
    options: ['受けた', '受けていない', '不明'],
  },
  {
    id: 'cq-9', category: '整備・修理履歴',
    question: '2年前のMAFセンサー修理後、エンジン音などに変化はありましたか？',
    options: ['あった', 'なかった', '覚えていない'],
  },
];

export const EN_CUSTOMER_QUESTIONS = [
  {
    id: 'cq-1', category: 'Warning Light',
    question: 'When did the warning light first come on?',
    options: ['Within a week', '1–2 weeks ago', 'Over a month ago', 'Unknown'],
  },
  {
    id: 'cq-2', category: 'Warning Light',
    question: 'How has the light been behaving?',
    options: ['On continuously', 'On and off', 'Came on once', 'Unknown'],
  },
  {
    id: 'cq-3', category: 'Warning Light',
    question: 'What were you doing when it first came on?',
    options: ['Highway driving', 'City driving', 'Idling', 'Other / Unknown'],
  },
  {
    id: 'cq-4', category: 'Driving & Symptoms',
    question: 'Any unusual sounds, smells, or vibrations after the light came on?',
    options: ['Yes, noticed', 'No, nothing', 'Slight concern', 'Unknown'],
  },
  {
    id: 'cq-5', category: 'Driving & Symptoms',
    question: 'Any change in fuel economy or acceleration feel?',
    options: ['Got worse', 'No change', 'Slight concern', 'Unknown'],
  },
  {
    id: 'cq-6', category: 'Fuel & Usage',
    question: 'Any recent change in fuel brand or grade?',
    options: ['Yes, changed', 'No change', 'Unknown'],
  },
  {
    id: 'cq-7', category: 'Fuel & Usage',
    question: 'What is your typical driving pattern?',
    options: ['Mostly highway', 'Mostly city', 'About 50/50'],
  },
  {
    id: 'cq-8', category: 'Service History',
    question: 'Any recent service or repairs at another shop?',
    options: ['Yes', 'No', 'Unknown'],
  },
  {
    id: 'cq-9', category: 'Service History',
    question: 'After the MAF sensor repair 2 years ago, any change in engine behaviour?',
    options: ['Yes, noticed change', 'No change', "Don't recall"],
  },
];

export const JA_EXPLANATION_NOTE = {
  customerConcern: '走行中にチェックエンジンランプ（警告灯）が点灯し、現在も点灯したままです。',
  cause: '排気系のセンサー（O2センサー、バンク1センサー2）が誤った値を示したため、エンジン制御システムが触媒コンバーターの効率低下を検知しました。これにより警告灯が点灯しました（DTC P0420）。',
  whatWeDid: '触媒コンバーター後方のO2センサー（バンク1センサー2、部品番号 89465-12760）を交換しました。交換後、記憶された故障コードを消去し、ロードテストを実施して、すべての排気系モニターが完了（合格）したことを確認しました。',
  result: 'チェックエンジンライトは消灯しています。排気系モニターはすべてCOMPLETE（完了）と確認されました。新しい故障コードは検出されていません。ロードテストも問題なく完了しました。',
  whatYouShouldKnow: 'お車は正常に動作しています。触媒コンバーターも点検しましたが、良好な状態でした。交換が必要だったのはセンサーのみです。O2センサーは消耗品であり、特に渋滞の多い走行環境では経年劣化することがあります。',
  nextRecommendation: '現時点での対応は不要です。次回の定期点検は30,000kmまたは12ヶ月のいずれか早い方を目安にご来店ください。次回サービスまでにチェックエンジンライトが再点灯した場合は、点検にお持ちください。',
};
