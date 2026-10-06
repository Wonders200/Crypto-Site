import LegalPage from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="January 2025"
      sections={[
        ["1. Acceptance of Terms", "By accessing or using ApexVault, you agree to be bound by these Terms. If you do not agree, you may not use the platform."],
        ["2. Eligibility", "You must be at least 18 years old and legally capable of entering into binding contracts in your jurisdiction. Services are not available in restricted territories."],
        ["3. Account Registration", "You agree to provide accurate, current, and complete information during registration and to keep it updated. You are responsible for maintaining the confidentiality of your credentials."],
        ["4. Trading and Orders", "All orders placed through the platform are subject to execution, availability, and market conditions. We reserve the right to reject or cancel any order at our sole discretion."],
        ["5. Fees", "Applicable fees are disclosed on the Pricing page. Fees are deducted from your account at the time of trade execution."],
        ["6. Prohibited Conduct", "You may not use the platform for money laundering, terrorist financing, market manipulation, or any other illegal activity."],
        ["7. Limitation of Liability", "To the maximum extent permitted by law, ApexVault shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform."],
        ["8. Modifications", "We may update these Terms from time to time. Continued use constitutes acceptance of the updated Terms."],
      ]}
    />
  );
}