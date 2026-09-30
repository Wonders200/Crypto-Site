# Crypto Site

Next.js (App Router) + TypeScript + Tailwind CSS demo crypto platform.

## Setup

    npm install
    cp .env.local.example .env.local   # optional
    npm run dev

Open http://localhost:3000

## Env vars (all optional)

| Feature              | Variable                                | Fallback              |
| -------------------- | --------------------------------------- | --------------------- |
| Real market prices   | NEXT_PUBLIC_COINGECKO_API_KEY           | Simulated updates     |
| Live news            | NEWS_API_KEY                            | Mock articles         |
| Wallet connect       | NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID    | Simulated address     |

## Pages

Home, Dashboard, Market, News, Learn, About, Contact, 404.
