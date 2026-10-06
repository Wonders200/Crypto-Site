export type ContentBlock = {
  heading: string;
  body: string;
};

export type PageContent = {
  title: string;
  subtitle: string;
  blocks: ContentBlock[];
};

export const DEFAULT_PAGES: Record<string, PageContent> = {
  about: {
    title: 'About ApexVault',
    subtitle: 'We are building the most secure and intuitive crypto platform for the next generation of investors.',
    blocks: [
      { heading: 'Our Mission', body: 'To make institutional-grade crypto infrastructure accessible to everyone. We combine bank-grade custody, a high-performance matching engine, and enterprise compliance to give our customers the tools they need to participate confidently in the digital asset economy.' },
      { heading: 'Our Story', body: 'ApexVault was founded in 2019 by three former investment bankers and one MIT cryptographer. Our goal was simple: build a crypto platform we would trust with our own capital. In 2021 we achieved SOC 2 Type II certification, in 2023 we crossed $1B in assets under custody, and in 2026 we launched our institutional-grade custody platform to the public.' },
      { heading: 'Security First', body: '95% of customer assets are held in geographically distributed cold storage with multi-signature controls. Hot wallets are insured up to $250M through our custodian partners. We undergo continuous penetration testing and independent security audits.' },
      { heading: 'Full Transparency', body: 'Every fee, every order, every transaction is visible. No hidden spreads, no dark pools, no surprises. Our fee schedule is public and our order book is real.' },
      { heading: 'Compliance by Design', body: 'SOC 2 Type II certified. ISO 27001 aligned. Fully licensed in every jurisdiction we operate. We take our regulatory obligations seriously so our customers can trade with confidence.' },
      { heading: 'Global Access', body: 'Serving customers in 150+ countries with local payment rails and multilingual support. Our infrastructure is designed for scale and reliability at a global level.' },
    ],
  },
  careers: {
    title: 'Careers at ApexVault',
    subtitle: 'Join our team and help shape the future of finance. We are hiring across engineering, security, compliance, design, and operations.',
    blocks: [
      { heading: 'Why ApexVault?', body: 'Top-of-market compensation with meaningful equity. Remote-first culture that hires based on talent, not ZIP codes. Premium health, dental, and vision coverage. Annual learning budget for courses and conferences. Unlimited PTO. Every employee owns a piece of ApexVault.' },
      { heading: 'Senior Backend Engineer', body: 'Engineering  London, UK (Hybrid)  Full-time. Build the systems that power millions of trades per day. Experience with distributed systems, Go or Rust, and PostgreSQL required.' },
      { heading: 'Blockchain Security Engineer', body: 'Security  Remote (EU)  Full-time. Protect our customers by hardening our infrastructure, reviewing smart contracts, and leading threat modeling exercises.' },
      { heading: 'Compliance Analyst', body: 'Legal & Compliance  New York, US  Full-time. Own KYC/AML workflows, regulatory reporting, and audits across our US operations.' },
      { heading: 'Product Designer', body: 'Design  Remote (Global)  Full-time. Design intuitive trading experiences that scale from retail investors to institutional desks.' },
      { heading: 'Quantitative Researcher', body: 'Trading  London, UK  Full-time. Develop models for market making, risk management, and execution algorithms.' },
      { heading: 'Apply Now', body: 'Do not see your role? Send your resume to careers@apexvault.io anyway. We are always looking for exceptional people.' },
    ],
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'We are here to help, 24/7. Reach out through any of the channels below and we will respond quickly.',
    blocks: [
      { heading: 'Live Chat', body: 'Instant answers, available 24/7. Average wait time under 30 seconds. Click the chat icon in the bottom-right corner of any page to get started.' },
      { heading: 'Email Support', body: 'support@apexvault.io  Response within 2 hours, 24/7.' },
      { heading: 'Phone Support', body: '+44 20 7946 0958  Mon-Fri, 9am-6pm GMT.' },
      { heading: 'London (HQ)', body: '30 St Mary Axe, London EC3A 8BF, United Kingdom' },
      { heading: 'New York', body: '200 Vesey Street, New York, NY 10281, United States' },
      { heading: 'Singapore', body: '1 Raffles Place, Singapore 048616, Singapore' },
      { heading: 'Frequently Asked Questions', body: 'How long does verification take? Most accounts are verified within 15 minutes. Complex cases may take up to 24 hours.

What are your trading fees? Maker fees start at 0.10% and taker fees at 0.15%.

Is my crypto insured? Yes. Digital assets in hot wallets are insured up to $250M through our custodian partners.' },
    ],
  },
  'api-docs': {
    title: 'ApexVault API',
    subtitle: 'A RESTful API with WebSocket streaming for programmatic trading. Build bots, dashboards, and integrations with sub-50ms latency.',
    blocks: [
      { heading: 'Quick Start', body: '1. Generate an API key at Settings  API Keys in your dashboard.
2. Authenticate your requests with: Authorization: Bearer YOUR_API_KEY
3. Make your first request: curl -X GET "https://api.apexvault.io/api/v1/ticker?pair=BTC-USDT" -H "Authorization: Bearer YOUR_API_KEY"' },
      { heading: 'Endpoints', body: 'GET /api/v1/ticker  Ticker data for all supported pairs.
GET /api/v1/orderbook/:pair  Current order book for a given pair.
POST /api/v1/orders  Place a new order (limit or market).
DELETE /api/v1/orders/:id  Cancel an existing order by ID.
GET /api/v1/balances  Account balances for all assets.
GET /api/v1/transactions  Transaction history with pagination.
POST /api/v1/withdrawals  Initiate a withdrawal to an external address.
GET /api/v1/ws  WebSocket stream for real-time market data.' },
      { heading: 'Rate Limits', body: 'Public Endpoints: 1,200 requests / minute
Private Endpoints: 600 requests / minute
Order Placement: 100 orders / second' },
      { heading: 'Need Help?', body: 'Our developer support team is available to help you get up and running. Contact developers@apexvault.io.' },
    ],
  },
  status: {
    title: 'System Status',
    subtitle: 'Real-time and historical uptime for all ApexVault services. Updated every 30 seconds.',
    blocks: [
      { heading: 'All Systems Operational', body: 'Current uptime: 99.98% (last 90 days). No active incidents.' },
      { heading: 'Services', body: 'Spot Trading Engine  Operational (99.99%)
REST API  Operational (99.98%)
WebSocket Stream  Operational (99.97%)
Deposits & Withdrawals  Operational (99.99%)
User Authentication  Operational (100.00%)
Web Platform  Operational (99.99%)
Mobile Apps  Operational (99.98%)
Customer Support  Operational (99.95%)' },
      { heading: 'Recent Incidents', body: 'March 12, 2026  Delayed withdrawal processing (Resolved, 47 minutes). A subset of BTC withdrawals experienced delays due to mempool congestion.
February 28, 2026  Intermittent API errors (Resolved, 12 minutes). Elevated error rates on private REST endpoints.
January 15, 2026  Scheduled maintenance (Completed, 2 hours). Database upgrade to improve order book performance.' },
    ],
  },
  blog: {
    title: 'The ApexVault Blog',
    subtitle: 'Insights from the frontier of crypto. Market analysis, product updates, and educational content from the ApexVault team.',
    blocks: [
      { heading: 'Bitcoin ETF Inflows Signal Institutional Shift', body: 'Market Analysis  Oct 24, 2026  8 min read  by Sarah Chen. Over $2.4B flowed into spot Bitcoin ETFs last week, the highest weekly total since launch. Here is what it means for the broader market.' },
      { heading: 'MiCA Fully Live: What EU Traders Need to Know', body: 'Regulation  Oct 22, 2026  6 min read  by Marcus Reinhardt. The Markets in Crypto-Assets regulation is now fully in effect across the EU. Here are the key changes.' },
      { heading: 'Understanding Layer 2 Rollups', body: 'Technology  Oct 20, 2026  12 min read  by David Okonkwo. A technical deep dive into optimistic vs. zero-knowledge rollups and their impact on Ethereum scalability.' },
      { heading: 'Hardware Wallets 101: A Complete Guide', body: 'Security  Oct 18, 2026  10 min read  by Priya Raman. Everything you need to know about cold storage and choosing the right hardware wallet.' },
      { heading: 'Yield Farming vs. Staking: Which Is Right for You?', body: 'DeFi  Oct 15, 2026  7 min read  by Elena Vasquez. Compare risk, return, and liquidity tradeoffs between the two most popular passive income strategies.' },
      { heading: 'Crypto Tax Guide for 2026', body: 'Education  Oct 10, 2026  15 min read  by Rachel Kim. Reporting requirements, deductions, and strategies for minimizing your tax liability this year.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Last updated: October 1, 2026  Effective: October 15, 2026. Please read these terms carefully before using the ApexVault platform.',
    blocks: [
      { heading: '1. Acceptance of Terms', body: 'By accessing or using the ApexVault platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use our services.' },
      { heading: '2. Eligibility', body: 'You must be at least 18 years of age and legally capable of entering into binding contracts to use ApexVault. By using our services, you represent and warrant that you meet these requirements and that you are not located in a prohibited jurisdiction.' },
      { heading: '3. Account Registration', body: 'You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate. You are responsible for safeguarding your password and for all activities that occur under your account.' },
      { heading: '4. Identity Verification (KYC)', body: 'To comply with anti-money laundering (AML) and counter-terrorist financing (CTF) regulations, we require all customers to complete identity verification. We may request additional documentation at any time and reserve the right to suspend accounts pending verification.' },
      { heading: '5. Trading Services', body: 'ApexVault provides a platform for buying, selling, and holding digital assets. Orders placed on our platform are matched by our proprietary engine. Once an order is filled, it cannot be reversed except in cases of manifest error.' },
      { heading: '6. Fees', body: 'All applicable trading fees, deposit fees, and withdrawal fees are disclosed on our Pricing page. We reserve the right to modify our fee schedule with 30 days notice.' },
      { heading: '7. Custody of Digital Assets', body: 'Digital assets held on the ApexVault platform are custodied through our licensed custodian partners. 95% of customer assets are held in cold storage. We maintain insurance policies covering hot wallet balances up to $250M.' },
      { heading: '8. Prohibited Activities', body: 'You agree not to use ApexVault for any unlawful purpose, including but not limited to money laundering, terrorist financing, market manipulation, or any activity that violates applicable laws.' },
      { heading: '9. Limitation of Liability', body: 'To the maximum extent permitted by law, ApexVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services.' },
      { heading: '10. Termination', body: 'We reserve the right to suspend or terminate your account at any time, with or without cause, and without prior notice. Upon termination, you remain liable for all amounts due.' },
      { heading: '11. Governing Law', body: 'These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.' },
      { heading: '12. Changes to Terms', body: 'We may update these Terms from time to time. Material changes will be communicated via email or through the platform at least 14 days before they take effect.' },
      { heading: 'Questions?', body: 'If you have any questions about these Terms of Service, please contact our legal team at legal@apexvault.io.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Last updated: October 1, 2026  Effective: October 15, 2026. Your privacy matters  this policy explains what data we collect and how we use it.',
    blocks: [
      { heading: '1. Overview', body: 'ApexVault is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read it carefully.' },
      { heading: '2. Information We Collect', body: 'We collect information you provide directly (name, email, date of birth, government-issued ID, proof of address), information collected automatically (IP address, device fingerprint, browser type, usage data), and information from third parties (identity verification providers, credit bureaus, blockchain analytics firms).' },
      { heading: '3. How We Use Your Information', body: 'We use your information to provide our services, verify your identity (KYC/AML compliance), prevent fraud and abuse, comply with legal obligations, communicate with you about your account, improve our platform, and personalize your experience.' },
      { heading: '4. Legal Basis for Processing (GDPR)', body: 'If you are located in the European Economic Area, we process your personal data on the following legal bases: performance of a contract, compliance with legal obligations, our legitimate business interests, and your consent where required.' },
      { heading: '5. Sharing Your Information', body: 'We do not sell your personal information. We may share it with service providers (KYC vendors, cloud hosting, analytics), law enforcement when legally required, and affiliated entities within our corporate group.' },
      { heading: '6. Data Retention', body: 'We retain personal data for as long as necessary to fulfill the purposes outlined in this policy, typically 5 years after account closure, or longer where required by applicable law (e.g., AML record-keeping requirements).' },
      { heading: '7. Data Security', body: 'We implement administrative, technical, and physical safeguards to protect your personal data, including encryption at rest and in transit, access controls, and continuous security monitoring.' },
      { heading: '8. Your Rights', body: 'Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data, restrict or object to processing, and withdraw consent. To exercise these rights, contact privacy@apexvault.io.' },
      { heading: '9. Cookies & Tracking', body: 'We use cookies and similar technologies to operate our platform, remember your preferences, and analyze usage. You can control cookies through your browser settings, though some features may not work without them.' },
      { heading: '10. International Transfers', body: 'Your data may be transferred to and processed in countries outside your own, including the UK, US, and Singapore. We use standard contractual clauses and other legal mechanisms to ensure adequate protection.' },
      { heading: '11. Children', body: 'Our services are not directed to individuals under 18. We do not knowingly collect personal data from children.' },
      { heading: '12. Changes to This Policy', body: 'We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the platform.' },
    ],
  },
  'risk-disclosures': {
    title: 'Risk Disclosures',
    subtitle: 'Last updated: October 1, 2026. Important information about the risks of cryptocurrency trading.',
    blocks: [
      { heading: 'Important Warning', body: 'Trading and investing in cryptocurrency involves substantial risk of loss. Digital assets are not insured by any government agency and are not covered by deposit protection schemes. You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources. You may lose all of your initial investment. Do not invest money that you cannot afford to lose.' },
      { heading: '1. Market Risk', body: 'The value of digital assets can be extremely volatile and may fluctuate significantly in a short period. You may lose some or all of your invested capital. Past performance is not indicative of future results.' },
      { heading: '2. Liquidity Risk', body: 'Certain digital assets may have limited liquidity, meaning you may not be able to buy or sell at the desired price or time. This can result in substantial losses, especially during periods of market stress.' },
      { heading: '3. Cybersecurity Risk', body: 'Digital assets are subject to cybersecurity risks, including hacking, phishing, malware, and other malicious activities. While we employ industry-leading safeguards, no system is completely immune to attack.' },
      { heading: '4. Regulatory Risk', body: 'The regulatory landscape for digital assets is rapidly evolving and varies by jurisdiction. Changes in laws or regulations may adversely affect the value, liquidity, or availability of digital assets.' },
      { heading: '5. Technology Risk', body: 'Blockchain networks may experience congestion, forks, or technical failures that could delay or prevent transactions. Smart contract vulnerabilities may result in loss of funds.' },
      { heading: '6. Currency Risk', body: 'If you transact in a currency other than your home currency, exchange rate fluctuations may affect the value of your holdings when converted back to your base currency.' },
      { heading: '7. Counterparty Risk', body: 'When trading on our platform, you are exposed to counterparty risk. Despite our compliance framework and custody arrangements, in the event of insolvency, recovery of assets may be delayed or limited.' },
      { heading: '8. Concentration Risk', body: 'Concentrating a large portion of your portfolio in a single digital asset increases the potential for significant loss if that asset declines in value.' },
      { heading: '9. Staking & Yield Risk', body: 'Staking and yield products involve locking your assets for a period of time. You may be unable to access your assets during the lock-up period and may face slashing penalties or protocol failures.' },
      { heading: '10. No Investment Advice', body: 'Nothing on our platform constitutes investment, financial, tax, or legal advice. You should consult a qualified professional before making any investment decisions.' },
      { heading: '11. Leverage Risk', body: 'Trading with leverage amplifies both profits and losses. You may lose more than your initial deposit. Only trade with funds you can afford to lose.' },
      { heading: '12. Jurisdictional Restrictions', body: 'Our services may not be available in all jurisdictions. It is your responsibility to ensure that your use of ApexVault complies with all applicable laws in your country of residence.' },
    ],
  },
};
