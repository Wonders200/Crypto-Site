"use client";
import { useState, useEffect } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { SiteSettings, AdminCredentials, DemoUser, DEFAULT_STORE, DEFAULT_DEMO_USER } from "@/lib/adminStore";
import { DEFAULT_BONUS_CONFIG } from "@/lib/bonuses";
import { PageHeader, Btn, Panel, Field, Input, Textarea, Toggle, Select } from "@/components/admin/ui";
import { Lock } from "lucide-react";

export default function AdminSettingsPage() {
  const { store, update, log, replace, resetStore } = useAdminStore();
  const { push } = useToast();

  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const onDemo = window.location.port === "3002" || !!localStorage.getItem("cs.demoMode");
      setIsDemo(onDemo);
    }
  }, []);

  const [settings, setSettings] = useState<SiteSettings>(store.settings);
  const [creds, setCreds] = useState<AdminCredentials>(store.credentials);
  const [pw2, setPw2] = useState(store.credentials.password);
  const [demoUser, setDemoUser] = useState<DemoUser>(store.demoUser ?? DEFAULT_DEMO_USER);

  const setS = (k: string, v: any) => setSettings(prev => ({ ...prev, [k]: v }));

  const guardDemo = () => {
    if (isDemo) {
      push({ kind: "info", title: "Read-only demo", message: "Buy the site to unlock full editing." });
      return true;
    }
    return false;
  };

  const saveSettings = () => {
    if (guardDemo()) return;
    update("settings", settings);
    log("UPDATE", "Site settings", settings.siteName);
    push({ kind: "success", title: "Settings saved" });
  };

  const saveCreds = () => {
    if (guardDemo()) return;
    if (!creds.email.includes("@") || creds.password.length < 6) {
      push({ kind: "error", title: "Invalid credentials", message: "Min 6 char password, valid email." });
      return;
    }
    if (creds.password !== pw2) {
      push({ kind: "error", title: "Passwords don't match" });
      return;
    }
    // Server-only. The store is the single source of truth. loginAdmin reads
    // store.credentials directly, so this change takes effect on every device
    // the moment the store syncs (which happens within a couple of seconds).
    update("credentials", {
      email: creds.email.trim().toLowerCase(),
      password: creds.password,
    });
    log("UPDATE", "Admin credentials", creds.email.trim().toLowerCase());
    push({
      kind: "success",
      title: "Credentials updated",
      message: "Saved to server. Active on all devices within seconds.",
    });
  };

  const saveDemo = () => {
    if (guardDemo()) return;
    if (!demoUser.email.includes("@") || demoUser.password.length < 4) {
      push({ kind: "error", title: "Invalid demo credentials" });
      return;
    }
    update("demoUser", demoUser);
    log("UPDATE", "Demo credentials", demoUser.email);
    push({ kind: "success", title: "Demo credentials updated" });
  };

  const exportStore = () => {
    if (guardDemo()) return;
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apexvault-store-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push({ kind: "success", title: "Store exported" });
  };

  const importStore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (guardDemo()) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const s = JSON.parse(String(r.result));
        replace(s);
        log("IMPORT", "Store", file.name);
        push({ kind: "success", title: "Store imported" });
      } catch {
        push({ kind: "error", title: "Invalid JSON file" });
      }
    };
    r.readAsText(file);
  };

  const hardReset = () => {
    if (guardDemo()) return;
    if (!confirm("Reset ALL data to defaults? This cannot be undone.")) return;
    resetStore();
    log("RESET", "Store", "Restored defaults");
    push({ kind: "success", title: "Store reset" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Site Settings" subtitle="Controls every public-facing string and toggle" />

      {isDemo && (
        <div style={{
          background: "rgba(99,102,241,0.10)",
          border: "1px solid rgba(99,102,241,0.4)",
          borderRadius: "0.75rem",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          color: "#818cf8",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}>
          <Lock size={16} />
          Read-only demo. Admin credentials and store backup are hidden for security. Buy the site to unlock full editing.
        </div>
      )}

      <Panel title="Branding & Hero">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Site name"><Input value={settings.siteName} onChange={v => setS("siteName", v)} /></Field>
          <Field label="Tagline"><Input value={settings.tagline} onChange={v => setS("tagline", v)} /></Field>
          <Field label="Hero title (line 1)"><Input value={settings.heroTitle} onChange={v => setS("heroTitle", v)} /></Field>
          <Field label="Hero subtitle"><Textarea value={settings.heroSubtitle} onChange={v => setS("heroSubtitle", v)} /></Field>
          <Field label="Hero CTA text"><Input value={settings.heroCtaText} onChange={v => setS("heroCtaText", v)} /></Field>
          <Field label="Hero CTA link"><Input value={settings.heroCtaLink} onChange={v => setS("heroCtaLink", v)} /></Field>
        </div>
      </Panel>

      <Panel title="Announcement Bar">
        <div className="space-y-4">
          <Field label="Announcement text"><Input value={settings.announcement} onChange={v => setS("announcement", v)} /></Field>
          <Toggle checked={settings.showAnnouncement} onChange={v => setS("showAnnouncement", v)} label="Show announcement bar" />
        </div>
      </Panel>

      <Panel title="Platform Mode">
        <Toggle checked={settings.maintenanceMode} onChange={v => setS("maintenanceMode", v)} label="Maintenance mode (public site shows a banner)" />
        <div className="mt-4">
          <Btn onClick={saveSettings}>{isDemo ? "Save Settings (demo disabled)" : "Save Settings"}</Btn>
        </div>
      </Panel>

      {!isDemo && (
        <>
          <Panel title="Admin Credentials">
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Email"><Input value={creds.email} onChange={v => setCreds({ ...creds, email: v })} /></Field>
              <Field label="New password"><Input value={creds.password} onChange={v => setCreds({ ...creds, password: v })} /></Field>
              <Field label="Confirm password"><Input value={pw2} onChange={setPw2} /></Field>
            </div>
            <div className="mt-4"><Btn onClick={saveCreds}>Update Credentials</Btn></div>
          </Panel>

          <Panel title="Public Demo Account">
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              Shown on the login and signup pages as a one-click try-it account.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              <Field label="Display name"><Input value={demoUser.name} onChange={v => setDemoUser({ ...demoUser, name: v })} /></Field>
              <Field label="Email"><Input value={demoUser.email} onChange={v => setDemoUser({ ...demoUser, email: v })} /></Field>
              <Field label="Password"><Input value={demoUser.password} onChange={v => setDemoUser({ ...demoUser, password: v })} /></Field>
              <Field label="Tier">
                <Select value={demoUser.tier} onChange={v => setDemoUser({ ...demoUser, tier: v as DemoUser["tier"] })}
                  options={[
                    { value: "Standard", label: "Standard" },
                    { value: "Pro", label: "Pro" },
                    { value: "Institutional", label: "Institutional" },
                  ]} />
              </Field>
            </div>
            <div className="mt-4"><Btn onClick={saveDemo}>Update Demo Credentials</Btn></div>
          </Panel>      <Panel title="Bonuses & Rewards">
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Configure deposit bonuses and referral rewards. Set deposit bonus % to 0 to disable.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Deposit bonus (%)">
            <Input value={String((settings as any).bonuses?.depositBonusPercent ?? DEFAULT_BONUS_CONFIG.depositBonusPercent)} onChange={v => setS("bonuses", { ...((settings as any).bonuses ?? DEFAULT_BONUS_CONFIG), depositBonusPercent: parseFloat(v) || 0 })} type="number" />
          </Field>
          <Field label="Min deposit for bonus ($)">
            <Input value={String((settings as any).bonuses?.depositBonusMinUsd ?? DEFAULT_BONUS_CONFIG.depositBonusMinUsd)} onChange={v => setS("bonuses", { ...((settings as any).bonuses ?? DEFAULT_BONUS_CONFIG), depositBonusMinUsd: parseFloat(v) || 0 })} type="number" />
          </Field>
          <Field label="Max bonus ($)">
            <Input value={String((settings as any).bonuses?.depositBonusMaxUsd ?? DEFAULT_BONUS_CONFIG.depositBonusMaxUsd)} onChange={v => setS("bonuses", { ...((settings as any).bonuses ?? DEFAULT_BONUS_CONFIG), depositBonusMaxUsd: parseFloat(v) || 0 })} type="number" />
          </Field>
          <Field label="Referral bonus type">
            <Select value={(settings as any).bonuses?.referralBonusType ?? DEFAULT_BONUS_CONFIG.referralBonusType} onChange={v => setS("bonuses", { ...((settings as any).bonuses ?? DEFAULT_BONUS_CONFIG), referralBonusType: v })} options={[{ value: "fixed", label: "Fixed $" }, { value: "percent", label: "Percent of first deposit" }]} />
          </Field>
          <Field label="Referral bonus ($ fixed)">
            <Input value={String((settings as any).bonuses?.referralBonusUsd ?? DEFAULT_BONUS_CONFIG.referralBonusUsd)} onChange={v => setS("bonuses", { ...((settings as any).bonuses ?? DEFAULT_BONUS_CONFIG), referralBonusUsd: parseFloat(v) || 0 })} type="number" />
          </Field>
          <Field label="Referral bonus (%)">
            <Input value={String((settings as any).bonuses?.referralBonusPercent ?? DEFAULT_BONUS_CONFIG.referralBonusPercent)} onChange={v => setS("bonuses", { ...((settings as any).bonuses ?? DEFAULT_BONUS_CONFIG), referralBonusPercent: parseFloat(v) || 0 })} type="number" />
          </Field>
        </div>
        <div className="mt-4"><Btn onClick={saveSettings}>Save Bonus Settings</Btn></div>
      </Panel>


          <Panel title="Store Backup">
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              Export your entire store (all coins, users, orders, settings) as JSON, or import a prior backup.
            </p>
            <div className="flex flex-wrap gap-2">
              <Btn kind="ghost" onClick={exportStore}> Export JSON</Btn>
              <label className="inline-block">
                <input type="file" accept="application/json" onChange={importStore} className="hidden" />
                <span className="inline-block px-4 py-2.5 rounded-lg font-semibold text-sm cursor-pointer"
                  style={{ background: "var(--panel-2)", border: "1px solid var(--border-2)" }}>
                   Import JSON
                </span>
              </label>
              <Btn kind="danger" onClick={hardReset}>Reset to Defaults</Btn>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
