import LegalPage from "@/components/LegalPage";

export default function DisclosuresPage() {
  return (
    <LegalPage
      title="Risk Disclosures"
      updated="January 2025"
      sections={[
        ["Market Risk", "Digital asset prices are highly volatile and can move dramatically in short periods. You may lose some or all of your investment. Past performance does not indicate future results."],
        ["Liquidity Risk", "Some digital assets trade in thin markets. You may be unable to buy or sell at a desired price, and slippage may be significant."],
        ["Regulatory Risk", "Digital assets are subject to evolving regulation across jurisdictions. New laws may materially affect your ability to hold, trade, or transfer assets."],
        ["Technology Risk", "Blockchains, smart contracts, and exchanges are subject to bugs, exploits, forks, and network congestion. These events may result in loss of funds."],
        ["Counterparty Risk", "Custody and trading involve reliance on third parties. While we hold 95% of assets in cold storage with insured custodians, no custody solution eliminates all risk."],
        ["Staking Risk", "Staked assets are subject to slashing, unbonding delays, and variable rewards. Yields are not guaranteed."],
        ["No Investment Advice", "Nothing on this platform constitutes investment, legal, or tax advice. We do not recommend any particular asset. Consult a licensed advisor before investing."],
        ["FDIC / SIPC", "Digital assets held on CryptoSite are not FDIC-insured, not SIPC-protected, and not covered by any government deposit insurance scheme."],
      ]}
    />
  );
}