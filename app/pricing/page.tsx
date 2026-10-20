"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminStore, useAuth, useToast } from "@/app/providers";
import { useI18n } from "@/lib/i18n";

export default function PricingPage() {
  const { store, update, log } = useAdminStore();
  const { user } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const { t: tr } = useI18n();

  // Get enabled tiers from database
  const tiers = (store?.pricingTiers ?? []).filter(t => t.enabled);
  
  // Find the current user's tier
  const matchedUser = store.users.find(u => user && u.email.toLowerCase() === user.email.toLowerCase());
  const currentTier = matchedUser?.tier || "Standard";

  const handleSelectTier = (tier: any) => {
    if (!user) {
      router.push("/signup");
      return;
    }
    
    if (!matchedUser) {
      push({ kind: "error", title: "Error", message: "User profile not found." });
      return;
    }

    if (matchedUser.tier === tier.name) {
      push({ kind: "info", title: "Already on this plan" });
      return;
    }

    // 1. Update the user's tier in the database
    update("users", store.users.map(u => u.id === matchedUser.id ? { ...u, tier: tier.name } : u));
    
    // 2. Log it to the audit trail (So you see it in the Admin panel in real-time)
    log("TIER_UPDATE", "Upgraded to " + tier.name, user.email);

    // 3. Show success message
    push({ 
      kind: "success", 
      title: "Upgraded to " + tier.name, 
      message: "Your account tier has been updated instantly." 
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h1 className="text-4xl font-bold">{tr("pricing.title")}</h1>
        <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>{tr("pricing.subtitle")}</p>
      </div>

      {tiers.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>{tr("pricing.noTiers")}</div>
      ) : (
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map(t => {
          const isCurrent = user && currentTier === t.name;
          
          return (
            <div key={t.id} className="panel p-7 relative flex flex-col" style={t.highlight ? { border: "1px solid var(--green)" } : {}}>
              {t.highlight && <span className="pill pill-green absolute -top-3 left-7" style={{ background: "var(--green)", color: "#0a0b0f" }}>{tr("pricing.popular")}</span>}
              
              <h2 className="text-xl font-bold">{t.name}</h2>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t.volume}</p>
              
              <div className="mt-7 grid grid-cols-2 gap-4">
                <div><div className="text-xs uppercase" style={{ color: "var(--muted)" }}>{tr("pricing.maker")}</div><div className="text-2xl font-bold mono mt-1" style={{ color: "var(--green)" }}>{t.maker}</div></div>
                <div><div className="text-xs uppercase" style={{ color: "var(--muted)" }}>{tr("pricing.taker")}</div><div className="text-2xl font-bold mono mt-1">{t.taker}</div></div>
              </div>
              
              <ul className="mt-7 space-y-2.5 text-sm flex-1">
                {t.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2">
                    <span style={{ color: "var(--green)" }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleSelectTier(t)}
                disabled={isCurrent}
                className="block text-center w-full mt-8 py-3 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={
                  isCurrent 
                    ? { background: "var(--panel-2)", color: "var(--muted)", border: "1px solid var(--border)" }
                    : t.highlight 
                      ? { background: "var(--green)", color: "#0a0b0f" } 
                      : { background: "var(--panel-2)", border: "1px solid var(--border-2)", color: "var(--text)" }
                }
              >
                {isCurrent ? "Current Plan" : t.cta}
              </button>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}