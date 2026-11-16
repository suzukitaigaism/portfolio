# portfolio

社内cli によって生成されたプロジェクトです。

## 構成

このプロジェクトは npm workspaces を使用した monorepo 構成です。

```
portfolio/
├── package.json
├── README.md
└── packages/
    └── site/   ← Vite + Vue + TypeScript
```

## セットアップ

```bash
npm install
```

## 開発サーバー起動

```bash
npm run dev -w packages/site
```

## ビルド

```bash
npm run build -w packages/site
```
