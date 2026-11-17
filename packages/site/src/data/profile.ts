// スキルシート（designer_skill-sheet_suzuki / 2026-11-13 作成）の内容

export const PROCESSES = [
  '進行管理',
  '基本設計',
  'ワイヤー',
  'デザイン',
  'プロトタイプ',
  '実装',
  'テスト',
] as const

export type Process = (typeof PROCESSES)[number]

/** design: デザインのみ / code: 実装のみ / both: デザイン〜実装まで一貫 */
export type WorkKind = 'design' | 'code' | 'both'

export interface Work {
  title: string
  company: string
  period: string
  duration: string
  kind: WorkKind
  role: string
  members: number
  processes: Process[]
  tools: string[]
  summary: string
  points: string[]
  url?: string
  /**
   * デザイン・画面の画像（任意）。1枚以上あるときだけボタンが出る。
   * ボタン名は担当範囲で変わる：実装のみ（kind: 'code'）は「画面を見る」、それ以外は「デザインを見る」。
   * 画像は public/works/ に置き、src は '/works/ファイル名' のように書く。
   */
  designImages?: DesignImage[]
}

export interface DesignImage {
  src: string
  /** 画像の内容を短く説明する文（読み上げ用） */
  alt: string
  /** 画像の実寸（読み込み前に場所を確保するため） */
  width: number
  height: number
  /** PC / スマホの切り替えに使う。指定がなければ切り替えは出ない */
  device?: 'pc' | 'sp'
  /** 画面名（1つの案件に複数ページあるとき、どの画面かをビューアに表示する） */
  caption?: string
}

export const profile = {
  name: '鈴木 大河',
  nameEn: 'Taiga Suzuki',
  kana: 'すずき たいが',
  title: 'UI Designer & Front-end Engineer',
  catchcopy: 'ユーザーと検索エンジンの両方にとって、見やすく、使いやすく。',
  company: 'ISM株式会社',
  office: '金沢開発室',
  postalCode: '〒920-0025',
  address: '石川県金沢市駅西本町4丁目3-19',
  email: 't-suzuki@ism-tech.jp',
}

export const strengths = [
  {
    label: 'Design',
    title: 'UI／Webデザイン',
    body: 'Figma・XD・Illustratorで、ワイヤーからデザイン、レスポンシブ対応まで。複数案を作って比較しながら決めていく。',
  },
  {
    label: 'Code',
    title: 'フロントエンド実装',
    body: 'Vue 3・Nuxt・TypeScript・Tailwind CSSでの画面実装。実装しながら使いにくい箇所を見つけ、UI/UXを改善。',
  },
  {
    label: 'Launch & SEO',
    title: '公開・運用まで',
    body: 'W3C準拠のHTML、WordPressオリジナルテーマ化、サーバー・ドメイン・SSL設定、Search Consoleでの改善まで一人で対応。',
  },
]

export const works: Work[] = [
  {
    title: 'アプリサービス紹介LP デザイン／実装',
    company: 'ISM株式会社',
    period: '2026/09〜2026/10',
    duration: '2カ月',
    kind: 'both',
    role: 'メンバー（デザイン・実装）',
    members: 2,
    processes: ['デザイン', '実装', 'テスト'],
    tools: ['Figma', 'Nuxt 4', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'Sass', 'Firebase Hosting'],
    summary:
      '住宅会社向けの点検アプリを紹介するLPを、タブレット・スマホのデザインから実装、公開まで担当。公開後も価格表の追加などの改修を対応。',
    points: [
      'タブレット・スマホでも読みやすいレスポンシブデザイン',
      'ファーストビューの演出やアニメーションで、サービスの印象を伝える表現',
      'お問い合わせフォームの実装と、確認画面の改善',
      '公開後の価格セクション追加など、運用に合わせた改修',
    ],
    url: 'https://inspection.ism-tech.jp/',
    designImages: [
      { src: '/works/inspection-lp_pc.jpg', alt: 'アプリサービス紹介LP デザインカンプ（PC表示・ページ全体）', width: 1440, height: 15438, device: 'pc' },
      { src: '/works/inspection-lp_sp.jpg', alt: 'アプリサービス紹介LP デザインカンプ（スマホ表示・ページ全体）', width: 600, height: 30388, device: 'sp' },
    ],
  },
  {
    title: '福利厚生サービスの会員向けWEBサイト UIデザイン',
    company: 'ISM株式会社',
    period: '2026/03〜2026/07',
    duration: '5カ月',
    kind: 'design',
    role: 'メンバー（UIデザイン）',
    members: 2,
    processes: ['基本設計', 'ワイヤー', 'デザイン', 'プロトタイプ', 'テスト'],
    tools: ['Figma', 'Illustrator', 'Photoshop'],
    summary:
      '福利厚生サービスを導入した企業の従業員が使う会員サイトのUIデザインを担当。サービスの案内や利用促進のため、新しい機能やコンテンツが追加されるたびに画面を設計・デザイン。',
    points: [
      '提携サービス（書籍要約・従業員向け通販など）の紹介ページの構成・デザイン',
      '営業成績ランキングを楽しく見られるUIの改善',
      'メニューの複数案を作成し、探しやすさを比較・改善',
      'eラーニング機能（受講者画面・管理画面）のUIデザイン',
      'トップページのFV・共通フッターのリニューアル（帯を開いてサービスを選べるFVなど）',
      'PC・タブレット・スマホに対応したレスポンシブデザイン',
    ],
    designImages: [
      { src: '/works/fukuri-member_fv-closed_pc.jpg', alt: '福利厚生サービスの会員向けWEBサイト リニューアルしたトップページのファーストビュー（帯を閉じた状態・PC表示）', width: 1440, height: 1024, device: 'pc', caption: 'トップ｜FV（帯を閉じた状態）' },
      { src: '/works/fukuri-member_fv-closed_sp.jpg', alt: '福利厚生サービスの会員向けWEBサイト リニューアルしたトップページのファーストビュー（スマホ表示）', width: 375, height: 812, device: 'sp', caption: 'トップ｜FV' },
      { src: '/works/fukuri-member_fv-open_pc.jpg', alt: '福利厚生サービスの会員向けWEBサイト トップページのファーストビューで、帯を開いてサービス一覧を表示した状態（PC表示）', width: 1440, height: 1024, device: 'pc', caption: 'トップ｜FV（帯を開いた状態）' },
      { src: '/works/fukuri-member_fv-open_sp.jpg', alt: '福利厚生サービスの会員向けWEBサイト トップページでメニューを開き、サービス一覧を表示した状態（スマホ表示）', width: 375, height: 812, device: 'sp', caption: 'トップ｜メニューを開いた状態' },
      { src: '/works/fukuri-member_flier_pc.jpg', alt: '福利厚生サービスの会員向けWEBサイト フライヤー紹介ページのデザインカンプ（PC表示・ページ全体）', width: 1440, height: 10506, device: 'pc', caption: 'フライヤー紹介ページ' },
      { src: '/works/fukuri-member_flier_sp.jpg', alt: '福利厚生サービスの会員向けWEBサイト フライヤー紹介ページのデザインカンプ（スマホ表示・ページ全体）', width: 375, height: 11630, device: 'sp', caption: 'フライヤー紹介ページ' },
      { src: '/works/fukuri-member_sale_pc.jpg', alt: '福利厚生サービスの会員向けWEBサイト 超割セール紹介ページのデザインカンプ（PC表示・ページ全体）', width: 1440, height: 14312, device: 'pc', caption: '超割セール紹介ページ' },
      { src: '/works/fukuri-member_sale_sp.jpg', alt: '福利厚生サービスの会員向けWEBサイト 超割セール紹介ページのデザインカンプ（スマホ表示・ページ全体）', width: 375, height: 16215, device: 'sp', caption: '超割セール紹介ページ' },
      { src: '/works/fukuri-member_ranking_pc.jpg', alt: '福利厚生サービスの会員向けWEBサイト ランキングページのデザインカンプ（PC表示・ページ全体）', width: 1440, height: 4843, device: 'pc', caption: 'ランキングページ' },
      { src: '/works/fukuri-member_ranking_sp.jpg', alt: '福利厚生サービスの会員向けWEBサイト ランキングページのデザインカンプ（スマホ表示・ページ全体）', width: 375, height: 4450, device: 'sp', caption: 'ランキングページ' },
      { src: '/works/fukuri-member_elearning-list_pc.jpg', alt: '福利厚生サービスの会員向けWEBサイト eラーニングの講座一覧ページのデザインカンプ（PC表示）', width: 1440, height: 2479, device: 'pc', caption: 'eラーニング｜講座一覧' },
      { src: '/works/fukuri-member_elearning-list_sp.jpg', alt: '福利厚生サービスの会員向けWEBサイト eラーニングの講座一覧ページのデザインカンプ（スマホ表示）', width: 375, height: 2275, device: 'sp', caption: 'eラーニング｜講座一覧' },
      { src: '/works/fukuri-member_elearning-detail_pc.jpg', alt: '福利厚生サービスの会員向けWEBサイト eラーニングの講座詳細・動画再生ページのデザインカンプ（PC表示）', width: 1440, height: 2915, device: 'pc', caption: 'eラーニング｜講座詳細' },
      { src: '/works/fukuri-member_elearning-detail_sp.jpg', alt: '福利厚生サービスの会員向けWEBサイト eラーニングの講座詳細・動画再生ページのデザインカンプ（スマホ表示）', width: 375, height: 2034, device: 'sp', caption: 'eラーニング｜講座詳細' },
      { src: '/works/fukuri-member_footer_pc.jpg', alt: '福利厚生サービスの会員向けWEBサイト リニューアルした共通フッター（PC表示）', width: 1440, height: 863, device: 'pc', caption: '共通フッター' },
      { src: '/works/fukuri-member_footer_sp.jpg', alt: '福利厚生サービスの会員向けWEBサイト リニューアルした共通フッター（スマホ表示・アコーディオンを開いた状態）', width: 375, height: 1392, device: 'sp', caption: '共通フッター' },
    ],
  },
  {
    title: '福利厚生サービスの営業管理ポータル UIデザイン',
    company: 'ISM株式会社',
    period: '2026/01〜2026/03',
    duration: '3カ月',
    kind: 'design',
    role: 'メンバー（UIデザイン）',
    members: 4,
    processes: ['基本設計', 'ワイヤー', 'デザイン'],
    tools: ['Figma', 'Illustrator', 'Photoshop'],
    summary:
      'サービスを販売する代理店が、提案先の企業や申込状況を管理するポータルサイトのUIデザインを担当。仕様の理解からページ構成、ワイヤー、デザイン、スマホ対応まで担当。',
    points: [
      'ダッシュボードや一覧画面など、業務に必要な情報が一目でわかる画面設計',
      'エリアごとの状況を色で見せる地図表示の提案',
      'ログイン画面・ヘッダーは複数案を作成し、比較して決定',
      'スマホでも使えるレスポンシブ対応と、開発へのデータの受け渡し',
    ],
    designImages: [
      { src: '/works/sales-portal_login_pc.jpg', alt: '福利厚生サービスの営業管理ポータル ログイン画面のデザインカンプ（PC表示）', width: 1440, height: 1024, device: 'pc', caption: 'ログイン' },
      { src: '/works/sales-portal_login_sp.jpg', alt: '福利厚生サービスの営業管理ポータル ログイン画面のデザインカンプ（スマホ表示）', width: 375, height: 812, device: 'sp', caption: 'ログイン' },
      { src: '/works/sales-portal_dashboard_pc.jpg', alt: '福利厚生サービスの営業管理ポータル ダッシュボード画面のデザインカンプ（PC表示）', width: 1440, height: 1338, device: 'pc', caption: 'ダッシュボード' },
      { src: '/works/sales-portal_dashboard_sp.jpg', alt: '福利厚生サービスの営業管理ポータル ダッシュボード画面のデザインカンプ（スマホ表示）', width: 375, height: 1674, device: 'sp', caption: 'ダッシュボード' },
      { src: '/works/sales-portal_information_pc.jpg', alt: '福利厚生サービスの営業管理ポータル インフォメーション画面のデザインカンプ（PC表示）', width: 1440, height: 3184, device: 'pc', caption: 'インフォメーション' },
      { src: '/works/sales-portal_information_sp.jpg', alt: '福利厚生サービスの営業管理ポータル インフォメーション画面のデザインカンプ（スマホ表示）', width: 375, height: 2120, device: 'sp', caption: 'インフォメーション' },
      { src: '/works/sales-portal_proposal-check_pc.jpg', alt: '福利厚生サービスの営業管理ポータル 提案可否確認画面のデザインカンプ（PC表示）', width: 1440, height: 1299, device: 'pc', caption: '提案可否確認' },
      { src: '/works/sales-portal_proposal-check_sp.jpg', alt: '福利厚生サービスの営業管理ポータル 提案可否確認画面のデザインカンプ（スマホ表示）', width: 375, height: 1405, device: 'sp', caption: '提案可否確認' },
      { src: '/works/sales-portal_forms_pc.jpg', alt: '福利厚生サービスの営業管理ポータル 申込フォーム一覧画面のデザインカンプ（PC表示）', width: 1440, height: 1024, device: 'pc', caption: '申込フォーム一覧' },
      { src: '/works/sales-portal_forms_sp.jpg', alt: '福利厚生サービスの営業管理ポータル 申込フォーム一覧画面のデザインカンプ（スマホ表示）', width: 375, height: 846, device: 'sp', caption: '申込フォーム一覧' },
      { src: '/works/sales-portal_companies_pc.jpg', alt: '福利厚生サービスの営業管理ポータル 提案企業一覧画面のデザインカンプ（PC表示）', width: 1440, height: 1491, device: 'pc', caption: '提案企業一覧' },
      { src: '/works/sales-portal_companies_sp.jpg', alt: '福利厚生サービスの営業管理ポータル 提案企業一覧画面のデザインカンプ（スマホ表示）', width: 375, height: 1891, device: 'sp', caption: '提案企業一覧' },
      { src: '/works/sales-portal_documents_pc.jpg', alt: '福利厚生サービスの営業管理ポータル 資料データ画面のデザインカンプ（PC表示）', width: 1440, height: 2050, device: 'pc', caption: '資料データ' },
      { src: '/works/sales-portal_documents_sp.jpg', alt: '福利厚生サービスの営業管理ポータル 資料データ画面のデザインカンプ（スマホ表示）', width: 375, height: 4923, device: 'sp', caption: '資料データ' },
    ],
  },
  {
    title: '住宅設備会社 採用サイト制作',
    company: '有限会社ウルトラワークス',
    period: '2022/09〜2024/11',
    duration: '制作期間 2週間',
    kind: 'code',
    role: 'コーディング・公開',
    members: 3,
    processes: ['進行管理', '実装', 'テスト'],
    tools: ['HTML', 'CSS（Sass）', 'JavaScript', 'jQuery', 'Xserver', 'Search Console', 'Analytics'],
    summary:
      '浜松市の住宅設備会社の採用サイトを、WEB制作会社のメンバーとしてコーディングから公開まで担当。',
    points: [
      '社員インタビューやブログなど、複数ページの採用サイトのコーディング',
      'デザインどおりに表示される、PC・スマホ対応のコーディング',
      '検索エンジンにも伝わりやすい、正しいHTMLの書き方を徹底（W3C準拠）',
      'サーバー設定から公開、検索結果の確認・アクセス解析まで対応',
    ],
    url: 'https://www.shizuoka-ina.co.jp/recruit/',
    designImages: [
      { src: '/works/shizuoka-ina-recruit_pc.jpg', alt: '住宅設備会社 採用サイト制作（PC表示・ページ全体）', width: 1440, height: 8622, device: 'pc' },
      { src: '/works/shizuoka-ina-recruit_sp.jpg', alt: '住宅設備会社 採用サイト制作（スマホ表示・ページ全体）', width: 780, height: 16380, device: 'sp' },
    ],
  },
  {
    title: '乗馬スタジオ 店舗サイト制作',
    company: '有限会社ウルトラワークス',
    period: '2022/09〜2024/11',
    duration: '制作期間 1週間',
    kind: 'code',
    role: 'コーディング・公開',
    members: 3,
    processes: ['進行管理', '実装', 'テスト'],
    tools: ['HTML', 'CSS（Sass）', 'JavaScript', 'jQuery', 'Xserver', 'Search Console', 'Analytics'],
    summary:
      '24時間営業の室内乗馬スタジオの店舗サイトを、WEB制作会社のメンバーとしてコーディングから公開まで担当。',
    points: [
      '写真を大きく使ったデザインを再現する、PC・スマホ対応のコーディング',
      'Instagram・予約サイト・LINEなど、来店につながる導線の実装',
      '検索エンジンにも伝わりやすい、正しいHTMLの書き方を徹底（W3C準拠）',
      'サーバー設定から公開、検索結果の確認・アクセス解析まで対応',
    ],
    url: 'https://hamauma.com/studio/com/to/',
    designImages: [
      { src: '/works/hamauma-studio_pc.jpg', alt: '乗馬スタジオ 店舗サイト制作（PC表示・ページ全体）', width: 1440, height: 6893, device: 'pc' },
      { src: '/works/hamauma-studio_sp.jpg', alt: '乗馬スタジオ 店舗サイト制作（スマホ表示・ページ全体）', width: 780, height: 14200, device: 'sp' },
    ],
  },
  {
    title: '業界団体（協同組合） サイト制作',
    company: '有限会社ウルトラワークス',
    period: '2022/09〜2024/11',
    duration: '制作期間 1週間',
    kind: 'code',
    role: 'コーディング・公開',
    members: 3,
    processes: ['進行管理', '実装', 'テスト'],
    tools: ['HTML', 'CSS（Sass）', 'JavaScript', 'jQuery', 'Xserver', 'Search Console', 'Analytics'],
    summary:
      '静岡県のコンクリート製品メーカーが加盟する協同組合のサイトを、WEB制作会社のメンバーとしてコーディングから公開まで担当。',
    points: [
      'イラストを使った親しみやすいデザインを再現する、PC・スマホ対応のコーディング',
      '各ページへ迷わず進める、カード型の導線',
      '検索エンジンにも伝わりやすい、正しいHTMLの書き方を徹底（W3C準拠）',
      'サーバー設定から公開、検索結果の確認・アクセス解析まで対応',
    ],
    url: 'https://www.shizucon.org/',
    designImages: [
      { src: '/works/shizucon_pc.jpg', alt: '業界団体（協同組合） サイト制作（PC表示・ページ全体）', width: 1440, height: 2990, device: 'pc' },
      { src: '/works/shizucon_sp.jpg', alt: '業界団体（協同組合） サイト制作（スマホ表示・ページ全体）', width: 780, height: 5434, device: 'sp' },
    ],
  },
  {
    title: '建設会社 コーポレートサイト制作',
    company: 'Web design Taiga（個人事業主）',
    period: '2020〜2022',
    duration: '制作期間 2週間',
    kind: 'both',
    role: '個人事業主（ディレクション・デザイン・実装）',
    members: 1,
    processes: ['進行管理', '基本設計', 'ワイヤー', 'デザイン', '実装', 'テスト'],
    tools: ['Adobe XD', 'Illustrator', 'Photoshop', 'HTML', 'CSS（Sass）', 'JavaScript', 'PHP', 'Xserver'],
    summary:
      '浜松市の建設会社のコーポレートサイトを個人で受託。打ち合わせからデザイン、写真撮影、コーディング、公開まで一人で担当。',
    points: [
      '打ち合わせ内容をもとにしたサイト構成の検討とデザイン',
      '一眼レフでの写真撮影と写真加工',
      'PC・スマホ対応のコーディングと、正しいHTMLの書き方の徹底（W3C準拠）',
      'サーバー設定から公開、検索結果の確認・アクセス解析まで対応',
    ],
  },
  {
    title: 'エクステリア・外構会社 コーポレートサイト制作',
    company: 'Web design Taiga（個人事業主）',
    period: '2020〜2022',
    duration: '制作期間 2週間',
    kind: 'both',
    role: '個人事業主（ディレクション・デザイン・実装）',
    members: 1,
    processes: ['進行管理', '基本設計', 'ワイヤー', 'デザイン', '実装', 'テスト'],
    tools: ['Adobe XD', 'Illustrator', 'Photoshop', 'HTML', 'CSS（Sass）', 'JavaScript', 'WordPress', 'Xserver'],
    summary:
      '静岡県のエクステリア・外構会社のコーポレートサイトを個人で受託。打ち合わせからデザイン、コーディング、公開まで一人で担当。',
    points: [
      '施工写真が主役になる、余白を生かした落ち着いたデザイン',
      'テンプレートを使わずオリジナルテーマでWordPress化し、お客様自身が施工事例やお知らせを更新できる仕組みを構築',
      'PC・スマホ対応のコーディングと、正しいHTMLの書き方の徹底（W3C準拠）',
      'サーバー設定から公開、検索結果の確認・アクセス解析まで対応',
    ],
    url: 'https://masakikogyo-exterior.com/',
    designImages: [
      { src: '/works/masakikogyo-exterior_pc.jpg', alt: 'エクステリア・外構会社 コーポレートサイト制作（PC表示・ページ全体）', width: 1440, height: 5485, device: 'pc' },
      { src: '/works/masakikogyo-exterior_sp.jpg', alt: 'エクステリア・外構会社 コーポレートサイト制作（スマホ表示・ページ全体）', width: 780, height: 7284, device: 'sp' },
    ],
  },
  {
    title: '塗装会社 サービス紹介サイト制作',
    company: 'Web design Taiga（個人事業主）',
    period: '2020〜2022',
    duration: '制作期間 2週間',
    kind: 'both',
    role: '個人事業主（ディレクション・デザイン・実装）',
    members: 1,
    processes: ['進行管理', '基本設計', 'ワイヤー', 'デザイン', '実装', 'テスト'],
    tools: ['Adobe XD', 'Illustrator', 'Photoshop', 'HTML', 'CSS（Sass）', 'JavaScript', 'WordPress', 'Xserver'],
    summary:
      '静岡県袋井市の塗装会社のサイトを個人で受託。主力の害虫対策サービスの紹介を中心に、打ち合わせから公開まで一人で担当。',
    points: [
      '「駆除ではなく対策」というサービスの特徴が伝わるページ構成',
      '食品工場・住宅など、用途別に探せる施工事例',
      'テンプレートを使わずオリジナルテーマでWordPress化し、お客様自身が施工事例やお知らせを更新できる仕組みを構築',
      'サーバー設定から公開、検索結果の確認・アクセス解析まで対応',
    ],
    url: 'https://www.otakensou.com/',
    designImages: [
      { src: '/works/otakensou_pc.jpg', alt: '塗装会社 サービス紹介サイト制作（PC表示・ページ全体）', width: 1440, height: 8372, device: 'pc' },
      { src: '/works/otakensou_sp.jpg', alt: '塗装会社 サービス紹介サイト制作（スマホ表示・ページ全体）', width: 780, height: 16772, device: 'sp' },
    ],
  },
  {
    title: '店舗運営会社 コーポレートサイト制作',
    company: 'Web design Taiga（個人事業主）',
    period: '2020〜2022',
    duration: '制作期間 2週間',
    kind: 'both',
    role: '個人事業主（ディレクション・デザイン・実装）',
    members: 1,
    processes: ['進行管理', '基本設計', 'ワイヤー', 'デザイン', '実装', 'テスト'],
    tools: ['Adobe XD', 'Illustrator', 'Photoshop', 'HTML', 'CSS（Sass）', 'JavaScript', 'WordPress', 'Cyberduck'],
    summary:
      'カー用品店・飲食店・ジムなど複数の店舗を運営する企業のコーポレートサイトを個人で受託。打ち合わせから公開まで一人で担当。',
    points: [
      '業態の異なる店舗を、写真付きでわかりやすく整理',
      'テンプレートを使わずオリジナルテーマでWordPress化し、カテゴリで絞り込めるニュースなど更新しやすい仕組みを構築',
      '新卒・中途・アルバイト別の採用ページと、用途別のお問い合わせフォーム',
      'サーバー設定から公開、検索結果の確認・アクセス解析まで対応',
    ],
    url: 'http://www.autobacs.net/',
    designImages: [
      { src: '/works/autobacs-net_pc.jpg', alt: '店舗運営会社 コーポレートサイト制作（PC表示・ページ全体）', width: 1440, height: 4752, device: 'pc' },
      { src: '/works/autobacs-net_sp.jpg', alt: '店舗運営会社 コーポレートサイト制作（スマホ表示・ページ全体）', width: 780, height: 11644, device: 'sp' },
    ],
  },
  {
    title: '住宅会社 採用サイト制作',
    company: 'Web design Taiga（個人事業主）',
    period: '2020〜2022',
    duration: '制作期間 2週間',
    kind: 'both',
    role: '個人事業主（ディレクション・デザイン・実装）',
    members: 1,
    processes: ['進行管理', '基本設計', 'ワイヤー', 'デザイン', '実装', 'テスト'],
    tools: ['Adobe XD', 'Illustrator', 'Photoshop', 'HTML', 'CSS（Sass）', 'JavaScript', 'WordPress', 'Xserver'],
    summary:
      '住宅会社の採用サイトを個人で受託。打ち合わせからデザイン、コーディング、公開まで一人で担当。',
    points: [
      '求職者が知りたい情報にたどり着きやすいページ構成',
      '写真加工・素材制作と、スライダーやアニメーションによる動きのある表現',
      'テンプレートを使わずオリジナルテーマでWordPress化し、更新しやすい仕組みを構築',
      'サーバー設定から公開、検索結果の確認・アクセス解析まで対応',
    ],
    url: 'https://yrkrenovate.com/recruit/',
    designImages: [
      { src: '/works/yrkrenovate-recruit_pc.jpg', alt: '住宅会社 採用サイト制作（PC表示・ページ全体）', width: 1440, height: 6360, device: 'pc' },
      { src: '/works/yrkrenovate-recruit_sp.jpg', alt: '住宅会社 採用サイト制作（スマホ表示・ページ全体）', width: 780, height: 9612, device: 'sp' },
    ],
  },
]

export const skillGroups = [
  {
    label: 'Design',
    items: ['Figma', 'Adobe XD', 'Illustrator', 'Photoshop', 'Premiere Pro', 'After Effects'],
  },
  {
    label: 'Front-end',
    items: ['HTML', 'CSS（Sass）', 'Tailwind CSS', 'JavaScript', 'TypeScript', 'jQuery', 'Vue.js', 'Nuxt'],
  },
  {
    label: 'Back-end',
    items: ['PHP', 'WordPress', 'Java', 'Spring Boot', 'PostgreSQL'],
  },
  {
    label: 'Server・SEO',
    items: ['Firebase Hosting', 'Xserver', 'Google Search Console', 'Google Analytics', 'FileZilla', 'Cyberduck'],
  },
]

export const career = [
  {
    period: '2011〜2020',
    name: 'レストラン・ホテル・バー',
    body: '調理、ホールサービス、バーテンダーを約9年経験。スタッフ同士で店舗の課題を話し合う場をつくり、新しい取り組みを店舗全体に広げた。',
  },
  {
    period: '2021/02〜2022/08',
    name: 'Web design Taiga（個人事業主）',
    body: '中小企業のコーポレートサイト・採用サイトを、打ち合わせから公開まで一人で受託制作。',
  },
  {
    period: '2022/09〜2024/11',
    name: '有限会社ウルトラワークス',
    body: 'WEB制作会社のメンバーとして、コーディングから公開・SEO対策まで担当。',
  },
  {
    period: '2025/07〜現在',
    name: 'ISM株式会社',
    body: 'SaaS管理画面・会員サイトなどのUIデザインと、Vue・Nuxtでのフロントエンド実装を担当。',
  },
]

export const about = [
  'ユーザーと検索エンジンの両方にとって見やすく、使いやすいWebサイト・画面づくりを心がけています。',
  '個人事業主・WEB制作会社では、中小企業のコーポレートサイトや採用サイトを、打ち合わせからデザイン、コーディング、写真撮影、公開まで一人で担当してきました。オリジナルで制作したサイトを、テンプレートを使わずオリジナルテーマでWordPress化し、お客様自身が施工事例やお知らせを更新できる仕組みまで提供できます。',
  '現在は、業務システムやSaaSの管理画面、会員向けサイトなどのUIデザインとフロントエンド実装を担当しています。Figmaでの画面設計から、Vue・Nuxtでの実装、実装しながらの使いやすさの改善まで、デザインと実装の両方に関われることが強みです。',
  'また、Web制作の前は約9年間（2011〜2020年）、レストラン・ホテル・バーで調理、ホールサービス、バーテンダーを経験してきました。お客様一人ひとりに合わせた対応を心がけ、スタッフ同士で店舗の課題を話し合う場を設けて新しい取り組みを店舗全体に広げてきました。この経験から、クライアントや制作メンバーとのコミュニケーションには自信があります。',
  'さらに、これまでのデザイン・実装の経験を活かし、新しいサービスの展開に向けた企画・考案にも取り組んでいます。利用者の課題を起点に、サービスの内容や画面を考え、形にするところまで一貫して関わっていきたいと考えています。そのためにバックエンド、セキュリティ、英語の学習にも取り組み、新しい知識やスキルを積極的に身に付けながら、貢献していきます。',
]
