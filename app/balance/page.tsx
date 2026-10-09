"use client";
import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useAuth, useAdminStore, useToast } from "@/app/providers";
import { Panel, Field, Input, Select, Btn } from "@/components/admin/ui";
import NetworkPicker, { lightTheme as T } from "@/components/NetworkPicker";
import AddressQR from "@/components/AddressQR";
import BackButton from "@/components/BackButton";
import TransactionList from "@/components/TransactionList";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { kycStatusFromStore } from "@/lib/kyc";
import { formatCurrency } from "@/lib/format";
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, TrendingUp, Clock,
  CheckCircle2, Copy, Check, AlertTriangle, Hash, UploadCloud,
  X as XIcon, Image as ImageIcon, Send, Info, ShieldCheck, ArrowRight,
  ChevronDown, ChevronRight, Lock,
} from "lucide-react";

/* ---------- constants ---------- */
const MIN_WITHDRAWAL = 2500;

/* ---------- helpers ---------- */
function fileToResizedDataUrl(file: File, maxW = 900, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject("Canvas unavailable"); return; }
        ctx.drawImage(img, 0, 0, w, h);
        try { resolve(canvas.toDataURL("image/jpeg", quality)); }
        catch (e) { reject(e); }
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function makeReference(prefix: string) {
  return prefix + "-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function hashHint(network: string, asset: string) {
  const n = (network || "").toLowerCase();
  const a = (asset || "").toUpperCase();
  if (n.includes("bitcoin") || a === "BTC") return { placeholder: "e.g. 4a5e1e4b... 64 hex characters", pattern: /^[a-fA-F0-9]{64}$/ };
  if (n.includes("trc20") || n.includes("tron")) return { placeholder: "e.g. 7b9f... 64 hex characters", pattern: /^[a-fA-F0-9]{64}$/ };
  if (n.includes("erc20") || n.includes("ethereum")) return { placeholder: "0x... 66 characters (with 0x prefix)", pattern: /^0x[a-fA-F0-9]{64}$/ };
  return { placeholder: "Transaction hash or reference ID", pattern: /^.{6,}$/ };
}

function withdrawalValidator(network: string, asset: string) {
  const n = (network || "").toLowerCase();
  const a = (asset || "").toUpperCase();
  if (n.includes("bitcoin") || a === "BTC") {
    return { placeholder: "Enter Bitcoin address (starts with 1, 3, or bc1)", pattern: /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/, hint: "Bitcoin mainnet (legacy, P2SH, or bech32)", warnWrongChain: "Sending BTC to a non-BTC address will result in permanent loss." };
  }
  if (n.includes("erc20") || n.includes("ethereum")) {
    return { placeholder: "Enter Ethereum address (0x...)", pattern: /^0x[a-fA-F0-9]{40}$/, hint: "Ethereum mainnet ERC20 address", warnWrongChain: "ERC20 withdrawals must go to an Ethereum address." };
  }
  if (n.includes("trc20") || n.includes("tron")) {
    return { placeholder: "Enter Tron address (starts with T)", pattern: /^T[a-zA-HJ-NP-Z0-9]{33}$/, hint: "Tron mainnet TRC20 address", warnWrongChain: "TRC20 withdrawals must go to a Tron address starting with T." };
  }
  return { placeholder: "Enter the destination address", pattern: /^.{6,}$/, hint: "Recipient wallet address", warnWrongChain: "Verify this address is on the correct network before submitting." };
}

export default function BalancePage() {
  const { user } = useAuth();
  const { store, update, log, mergeUpdate } = useAdminStore();
  const { push } = useToast();

  const depositMethods = useMemo(
    () => [...(store.depositAddresses ?? [])].filter(a => a.enabled).sort((a, b) => a.order - b.order),
    [store.depositAddresses]
  );

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [amount, setAmount] = useState("1000");
  const [methodId, setMethodId] = useState<string>(depositMethods[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");

  const [txHash, setTxHash] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofName, setProofName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [wAmount, setWAmount] = useState("2500");
  const [wMethodId, setWMethodId] = useState<string>(depositMethods[0]?.id ?? "");
  const [wAddress, setWAddress] = useState("");
  const [wMemo, setWMemo] = useState("");
  const [wLabel, setWLabel] = useState("");
  const [wConfirm, setWConfirm] = useState(false);

  const selectedMethod = depositMethods.find(m => m.id === methodId) ?? depositMethods[0];
  const hint = hashHint(selectedMethod?.network ?? "", selectedMethod?.asset ?? "");
  const wMethod = depositMethods.find(m => m.id === wMethodId) ?? depositMethods[0];
  const wValidator = withdrawalValidator(wMethod?.network ?? "", wMethod?.asset ?? "");

  const priceOf = (asset: string): number => {
    const coin = store.coins.find(c => c.symbol.toUpperCase() === asset.toUpperCase());
    if (coin) return coin.price;
    if (["USDT", "USDC", "PYUSD", "DAI", "USD"].includes(asset.toUpperCase())) return 1;
    return 0;
  };
  const wAsset = wMethod?.asset ?? "USD";
  const wPrice = priceOf(wAsset);
  const wAmountNum = parseFloat(wAmount) || 0;
  const wCryptoAmount = wPrice > 0 ? wAmountNum / wPrice : 0;

  const demoEmail = store.demoUser?.email ?? "demo@apexvault.io";
  const matchedUser = store.users.find(u => user && u.email.toLowerCase() === user.email.toLowerCase())
    ?? store.users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase())
    ?? store.users[0];

  const balance = store.balances.find(b => b.userId === matchedUser?.id) ?? { userId: matchedUser?.id ?? "", usd: 0, locked: 0, updatedAt: 0 };
  const transactions = store.transactions
    .filter(t => t.userId === matchedUser?.id || (t.userId === "demo-user" && matchedUser))
    .sort((a, b) => b.createdAt - a.createdAt);

  const deposits = transactions.filter(t => t.type === "deposit" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const withdrawals = transactions.filter(t => t.type === "withdrawal").reduce((s, t) => s + Math.abs(t.amount), 0);
  const rewards = transactions.filter(t => t.type === "reward").reduce((s, t) => s + t.amount, 0);
  const pending = transactions.filter(t => t.status === "pending").length;

  const kycStatus = kycStatusFromStore(store, matchedUser);
  const kycOk = kycStatus === "verified";

  const proofOk = !!proofUrl;
  const amountOk = (parseFloat(amount) || 0) > 0;
  const depositReady = proofOk && amountOk && !uploading && !!selectedMethod;

  const wAddressOk = !!wAddress.trim() && wValidator.pattern.test(wAddress.trim());
  const wAmountOk = wAmountNum >= MIN_WITHDRAWAL && wAmountNum <= (balance?.usd ?? 0);
  const wReady = kycOk && wAddressOk && wAmountOk && wConfirm && !!wMethod;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="panel p-10">
          <Wallet size={32} style={{ color: "var(--muted)", margin: "0 auto" }} />
          <h1 className="text-xl font-bold mt-4">Sign in to view your balance</h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>Track deposits, withdrawals, and rewards.</p>
          <Link href="/login" className="btn btn-primary inline-block mt-6">Sign in</Link>
        </div>
      </div>
    );
  }

  const copyAddress = async (addr?: string) => {
    const target = addr ?? selectedMethod?.address;
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleFile = async (file: File) => {
    setFormError("");
    if (!file.type.startsWith("image/")) { setFormError("Only image files are accepted (PNG, JPG)."); return; }
    if (file.size > 6 * 1024 * 1024) { setFormError("Image must be under 6 MB."); return; }
    setUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setProofUrl(dataUrl);
      setProofName(file.name);
    } catch { setFormError("Could not process the image."); }
    finally { setUploading(false); }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearProof = () => {
    setProofUrl(null);
    setProofName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitDeposit = () => {
    setFormError("");
    if (!depositReady) { setFormError("Please upload a payment screenshot to continue."); return; }
    const amt = parseFloat(amount) || 0;
    if (!matchedUser) { setFormError("Please sign in again."); return; }
    if (!selectedMethod) { setFormError("Please choose a network first."); return; }
    if (!amt || amt <= 0) { setFormError("Please enter an amount."); return; }

    // Auto-create balance record if the user doesn't have one yet
    if (!(store.balances ?? []).some(b => b.userId === matchedUser.id)) {
      update("balances", [
        { userId: matchedUser.id, usd: 0, locked: 0, updatedAt: Date.now() },
        ...(store.balances ?? []),
      ]);
    }

    const reference = makeReference("DEP");
    const methodLabel = selectedMethod.asset + " " + selectedMethod.network;

    mergeUpdate("transactions", [{ 
      id: "t_" + Math.random().toString(36).slice(2, 10),
      userId: matchedUser.id,
      type: "deposit",
      amount: amt,
      currency: "USD",
      status: "pending",
      description: methodLabel + " deposit - " + reference,
      createdAt: Date.now(),
      txHash: txHash.trim(),
      proofUrl: proofUrl ?? undefined,
      proofName: proofName || undefined,
      reference,
      network: selectedMethod.network,
      asset: selectedMethod.asset,
     }], "id");

    log("DEPOSIT", "$" + amt.toLocaleString() + " - " + reference, matchedUser.email + " - " + methodLabel);
    push({ kind: "success", title: "Deposit submitted", message: "Reference " + reference + ". Funds will appear once confirmed." });

    setAmount("1000");
    setTxHash("");
    clearProof();
    setShowDeposit(false);
  };

  const submitWithdrawal = () => {
    setFormError("");
    if (!matchedUser || !balance) return;
    if (!kycOk) { setFormError("KYC verification is required before withdrawing."); return; }
    if (!wMethod) { setFormError("Select a network for the withdrawal."); return; }
    if (wAmountNum <= 0) { setFormError("Enter a positive amount."); return; }
    if (wAmountNum < MIN_WITHDRAWAL) { setFormError("Minimum withdrawal is " + formatCurrency(MIN_WITHDRAWAL) + "."); return; }
    if (wAmountNum > balance.usd) { setFormError("Insufficient balance."); return; }
    if (!wAddress.trim()) { setFormError("Enter the destination address."); return; }
    if (!wValidator.pattern.test(wAddress.trim())) { setFormError("Invalid address for " + wMethod.network + "."); return; }
    if (!wConfirm) { setFormError("Please confirm the destination address."); return; }

    const reference = makeReference("WTH");
    const methodLabel = wMethod.asset + " " + wMethod.network;
    const shortAddr = wAddress.slice(0, 8) + "..." + wAddress.slice(-6);

    mergeUpdate("balances", store.balances.map(b => b.userId === matchedUser.id
      ? { ...b, usd: b.usd - wAmountNum, updatedAt: Date.now() }
      : b));

    mergeUpdate("transactions", [{ 
      id: "t_" + Math.random().toString(36).slice(2, 10),
      userId: matchedUser.id,
      type: "withdrawal",
      amount: -wAmountNum,
      currency: "USD",
      status: "pending",
      description: methodLabel + " withdrawal to " + shortAddr + " - " + reference,
      createdAt: Date.now(),
      reference,
      network: wMethod.network,
      asset: wMethod.asset,
      proofName: wLabel || undefined,
     }], "id");

    log("WITHDRAWAL", "$" + wAmountNum.toLocaleString() + " - " + reference, matchedUser.email + " - " + methodLabel);
    push({ kind: "success", title: "Withdrawal submitted", message: "Reference " + reference + ". Processing  you'll be notified once complete." });

    setWAmount("5000");
    setWAddress("");
    setWMemo("");
    setWLabel("");
    setWConfirm(false);
    setShowWithdraw(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="-ml-2 -mb-3">
        <BackButton fallback="/dashboard" label="Back to dashboard" />
      </div>

      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Money</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Add funds, move them around, and cash out whenever you like.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowDeposit(true); setShowWithdraw(false); setFormError(""); }} className="btn btn-ghost">
            <ArrowDownToLine size={14} /> Deposit
          </button>
          <button onClick={() => { setShowWithdraw(true); setShowDeposit(false); setFormError(""); }} className="btn btn-primary">
            <ArrowUpFromLine size={14} /> Withdraw
          </button>
        </div>
      </div>

      {!kycOk && (
        <div className="rounded-2xl p-5 flex items-center gap-4 flex-wrap"
          style={{
            background: kycStatus === "pending" ? "rgba(227,179,65,0.10)" : "rgba(124,143,245,0.10)",
            border: "1px solid " + (kycStatus === "pending" ? "rgba(227,179,65,0.4)" : "rgba(124,143,245,0.4)"),
          }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: kycStatus === "pending" ? "#e3b341" : "#7c8ff5", color: "#0a0b0f" }}>
            {kycStatus === "pending" ? <Clock size={18} /> : <ShieldCheck size={18} />}
          </div>
          <div className="flex-1 min-w-[220px]">
            <div className="font-semibold text-sm">
              {kycStatus === "pending" ? "Verification in review" : "Verify your identity"}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {kycStatus === "pending"
                ? "We're reviewing your documents. Withdrawals unlock once approved."
                : "Required before you can withdraw funds."}
            </div>
          </div>
          <Link href="/kyc" className="text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 shrink-0"
            style={{ background: kycStatus === "pending" ? "#e3b341" : "#7c8ff5", color: "#0a0b0f" }}>
            {kycStatus === "pending" ? "View status" : "Verify now"} <ArrowRight size={11} />
          </Link>
        </div>
      )}

      <div className="panel p-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} style={{ color: "var(--muted)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Available to spend</span>
          </div>
          <div className="text-5xl font-bold mono" suppressHydrationWarning>{formatCurrency(balance?.usd ?? 0)}</div>
          {balance?.locked ? (
            <div className="mt-2 text-sm" style={{ color: "var(--amber)" }}>
              <Clock size={12} className="inline mr-1" /> {formatCurrency(balance.locked)} on hold
            </div>
          ) : (
            <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
              Nothing on hold {balance ? <> Updated <LiveTimeAgo ts={balance.updatedAt} /></> : null}
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<ArrowDownToLine size={16} />} label="Total added" value={formatCurrency(deposits)} tone="green" />
        <Stat icon={<ArrowUpFromLine size={16} />} label="Total withdrawn" value={formatCurrency(withdrawals)} />
        <Stat icon={<TrendingUp size={16} />} label="Rewards earned" value={formatCurrency(rewards)} tone="green" />
        <Stat icon={<Clock size={16} />} label="Pending" value={String(pending)} tone={pending > 0 ? "amber" : "default"} />
      </div>

      {showDeposit && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={(e) => { if (e.target === e.currentTarget) { setShowDeposit(false); setFormError(""); } }}>
          <div className="min-h-full flex items-start justify-center p-4 md:p-8">
        <div className="rounded-3xl w-full max-w-3xl" style={{ background: T.pageBg, border: "1px solid " + T.border, padding: "32px 32px 28px" }}>
          <NetworkPicker networks={depositMethods} selectedId={methodId} onSelect={(id) => { setMethodId(id); setTxHash(""); setFormError(""); }} />

          {selectedMethod && (
            <>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-[12px] mb-1.5 uppercase tracking-wider" style={{ color: T.textSecondary }}>How much are you sending? (USD estimate)</div>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2.5 text-[14px] mono outline-none"
                    style={{ background: T.cardBg, border: "1px solid " + T.border, color: T.textPrimary }} />
                </label>
                <div className="flex items-end">
                  <div className="text-[12px] leading-relaxed" style={{ color: T.textSecondary }}>
                    Network: <strong style={{ color: T.textPrimary }}>{selectedMethod.network}</strong><br />
                    Asset: <strong style={{ color: T.textPrimary }}>{selectedMethod.asset}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px]" style={{ color: T.textSecondary }}>
                    Send <strong style={{ color: T.textPrimary }}>{selectedMethod.asset}</strong> to this address
                  </span>
                </div>
                <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5"
                  style={{ background: T.cardBg, border: "1px solid " + T.border }}>
                  <AddressQR value={selectedMethod.address} size={148} label="Point your wallet camera here" />
                  <div className="flex-1 min-w-0 w-full">
                    <div className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>Or copy the address manually</div>
                    <div className="flex items-stretch gap-2">
                      <code className="mono flex-1 rounded-xl px-3.5 py-3 text-[12.5px] break-all"
                        style={{ background: T.surface, border: "1px solid " + T.border, color: T.textPrimary }}>
                        {selectedMethod.address}
                      </code>
                      <button type="button" onClick={() => copyAddress()}
                        className="rounded-xl px-4 text-[13px] font-semibold flex items-center gap-1.5 shrink-0"
                        style={{
                          background: copied ? "#E8F5EE" : "#2449A8",
                          color: copied ? "#1B7A4D" : "#FFFFFF",
                          border: "1px solid " + (copied ? "#1B7A4D" : "#2449A8"),
                          minWidth: 96,
                        }}>
                        {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                      </button>
                    </div>
                    {selectedMethod.memo && (
                      <div className="mt-3 text-[13px]" style={{ color: T.textSecondary }}>
                        Memo / Tag: <span className="mono font-semibold" style={{ color: T.textPrimary }}>{selectedMethod.memo}</span>
                      </div>
                    )}
                    {selectedMethod.notes && (
                      <div className="mt-3 rounded-xl p-3 text-[12.5px] leading-relaxed flex items-start gap-2"
                        style={{ background: "#FFF7ED", border: "1px solid #FED7AA", color: "#9A3412" }}>
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" /><span>{selectedMethod.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6" style={{ borderTop: "1px solid " + T.border }}>
                <div className="mb-3">
                  <div className="text-[13px] font-semibold" style={{ color: T.textPrimary }}>Almost done  just tell us how you paid</div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: T.textSecondary }}>This helps us credit your account faster. Payment screenshot is required. Transaction hash is optional but speeds up verification.</div>
                </div>

                <label className="block mb-4">
                  <div className="text-[12px] mb-1.5 flex items-center gap-1.5" style={{ color: T.textSecondary }}>
                    <Hash size={12} /> Transaction hash
                  </div>
                  <input type="text" value={txHash}
                    onChange={e => { setTxHash(e.target.value); setFormError(""); }}
                    placeholder={hint.placeholder}
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] mono outline-none"
                    style={{
                      background: T.cardBg,
                      border: "1px solid " + (txHash && !hint.pattern.test(txHash.trim()) ? "#FCA5A5" : T.border),
                      color: T.textPrimary,
                    }} />
                  {txHash && !hint.pattern.test(txHash.trim()) && (
                    <div className="text-[11.5px] mt-1.5" style={{ color: "#B91C1C" }}>
                      Doesn't match the expected format for {selectedMethod.network}.
                    </div>
                  )}
                </label>

                <div className="text-[12px] mb-1.5 flex items-center gap-1.5" style={{ color: T.textSecondary }}>
                  <ImageIcon size={12} /> Payment screenshot <span style={{ color: "#B91C1C" }}>*</span>
                </div>

                {!proofUrl ? (
                  <div onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl py-8 text-center cursor-pointer transition-all"
                    style={{
                      background: dragOver ? "#EEF4FF" : T.cardBg,
                      border: "1.5px dashed " + (dragOver ? "#2449A8" : T.border),
                    }}>
                    <UploadCloud size={26} style={{ color: dragOver ? "#2449A8" : T.textSecondary, margin: "0 auto 8px" }} />
                    <div className="text-[13px] font-semibold" style={{ color: T.textPrimary }}>
                      {uploading ? "Processing image..." : "Click to upload or drag & drop"}
                    </div>
                    <div className="text-[12px] mt-1" style={{ color: T.textSecondary }}>PNG or JPG  up to 6 MB</div>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden" style={{ background: T.cardBg, border: "1px solid " + T.border }}>
                    <div className="flex items-center gap-3 px-3 py-2.5 border-b" style={{ borderColor: T.border }}>
                      <CheckCircle2 size={14} style={{ color: "#1B7A4D" }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-medium truncate" style={{ color: T.textPrimary }}>{proofName || "screenshot.jpg"}</div>
                        <div className="text-[11px]" style={{ color: T.textSecondary }}>Ready to attach</div>
                      </div>
                      <button type="button" onClick={clearProof} className="p-1.5 rounded-lg hover:bg-black/5">
                        <XIcon size={13} style={{ color: T.textSecondary }} />
                      </button>
                    </div>
                    <div className="p-3">
                      <img src={proofUrl} alt="proof" className="rounded-lg w-full h-auto max-h-[240px] object-contain" style={{ background: "#F1F5F9" }} />
                    </div>
                  </div>
                )}
              </div>

              {formError && (
                <div className="mt-4 rounded-xl p-3 text-[12.5px] flex items-start gap-2"
                  style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B" }}>
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" /><span>{formError}</span>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button type="button" onClick={submitDeposit} disabled={!depositReady}
                  className="flex-1 rounded-xl py-3.5 text-[14px] font-semibold transition-all disabled:cursor-not-allowed"
                  style={{
                    background: depositReady ? "#2449A8" : "#94A3B8",
                    color: "#FFFFFF",
                    opacity: depositReady ? 1 : 0.85,
                  }}>
                  {depositReady ? "I've sent " + selectedMethod.asset + "  submit for review" : "Upload screenshot to submit"}
                </button>
                <button type="button" onClick={() => { setShowDeposit(false); setFormError(""); }}
                  className="rounded-xl px-5 text-[14px] font-semibold"
                  style={{ background: "transparent", color: T.textSecondary, border: "1px solid " + T.border }}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={(e) => { if (e.target === e.currentTarget) { setShowWithdraw(false); setFormError(""); } }}>
          <div className="min-h-full flex items-start justify-center p-4 md:p-8">
        <div className="rounded-3xl w-full max-w-3xl" style={{ background: T.pageBg, border: "1px solid " + T.border, padding: "32px 32px 28px" }}>
          {!kycOk ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: kycStatus === "pending" ? "#e3b341" : "#7c8ff5", color: "#0a0b0f" }}>
                {kycStatus === "pending" ? <Clock size={24} /> : <ShieldCheck size={24} />}
              </div>
              <div>
                <div className="text-lg font-semibold" style={{ color: T.textPrimary }}>
                  {kycStatus === "pending" ? "Verification in review" : "Verify your identity to withdraw"}
                </div>
                <div className="text-sm mt-2 max-w-md mx-auto" style={{ color: T.textSecondary }}>
                  {kycStatus === "pending"
                    ? "We're reviewing your documents. Withdrawals unlock automatically once approved."
                    : "Withdrawals require identity verification. This is required by regulation."}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Link href="/kyc"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black inline-flex items-center gap-2"
                  style={{ background: kycStatus === "pending" ? "#e3b341" : "#7c8ff5" }}>
                  {kycStatus === "pending" ? "View status" : "Verify now"} <ArrowRight size={14} />
                </Link>
                <button type="button" onClick={() => setShowWithdraw(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "transparent", color: T.textSecondary, border: "1px solid " + T.border }}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
                <div>
                  <h2 className="text-[22px] leading-tight font-semibold" style={{ color: T.textPrimary }}>Withdraw funds</h2>
                  <p className="text-[13.5px] mt-1.5" style={{ color: T.textSecondary }}>Pick a network, then tell us where to send your money.</p>
                </div>
                <div className="rounded-xl px-3 py-2" style={{ background: T.cardBg, border: "1px solid " + T.border }}>
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: T.textSecondary }}>Available</div>
                  <div className="text-[15px] font-semibold mono" style={{ color: T.textPrimary }}>{formatCurrency(balance?.usd ?? 0)}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-[12px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: T.textSecondary }}>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold" style={{ background: "#2449A8", color: "#FFFFFF" }}>1</span>
                    Choose network
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {depositMethods.map(m => {
                    const active = wMethodId === m.id;
                    return (
                      <button key={m.id} type="button"
                        onClick={() => { setWMethodId(m.id); setWAddress(""); setFormError(""); }}
                        className="rounded-xl px-3.5 py-3 text-left transition-all"
                        style={{
                          background: active ? "#F2F6FF" : T.cardBg,
                          border: "1px solid " + (active ? "#2449A8" : T.border),
                        }}>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-[13.5px]" style={{ color: T.textPrimary }}>{m.asset}</div>
                          {active && <Check size={13} color="#2449A8" />}
                        </div>
                        <div className="text-[11.5px] mt-0.5" style={{ color: T.textSecondary }}>{m.network}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-[12px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: T.textSecondary }}>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold" style={{ background: "#2449A8", color: "#FFFFFF" }}>2</span>
                    Where should we send it?
                  </span>
                </div>
                {wMethod && (
                  <>
                    <label className="block mb-4">
                      <div className="text-[12px] mb-1.5 flex items-center justify-between" style={{ color: T.textSecondary }}>
                        <span>Your {wMethod.asset} wallet address</span>
                        <span className="text-[11px]">Network: <strong style={{ color: T.textPrimary }}>{wMethod.network}</strong></span>
                      </div>
                      <input type="text" value={wAddress}
                        onChange={e => { setWAddress(e.target.value); setFormError(""); }}
                        placeholder={wValidator.placeholder}
                        className="w-full rounded-xl px-3.5 py-3 text-[13px] mono outline-none"
                        style={{
                          background: T.cardBg,
                          border: "1px solid " + (wAddress && !wValidator.pattern.test(wAddress.trim()) ? "#FCA5A5" : T.border),
                          color: T.textPrimary,
                        }} />
                      <div className="text-[11.5px] mt-1.5" style={{ color: wAddress && !wValidator.pattern.test(wAddress.trim()) ? "#B91C1C" : T.textSecondary }}>
                        {wValidator.hint}
                      </div>
                    </label>

                    {wAddressOk && (
                      <div className="rounded-2xl p-5 mb-4 flex flex-col sm:flex-row items-center gap-5"
                        style={{ background: T.cardBg, border: "1px solid " + T.border }}>
                        <AddressQR value={wAddress.trim()} size={140} label="Scan to verify address" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                            Verify this is your address
                          </div>
                          <div className="text-[12.5px] leading-relaxed" style={{ color: T.textSecondary }}>
                            Scan the QR with a wallet app or compare with your own wallet. Double-check every character  crypto transfers can't be reversed.
                          </div>
                          <div className="mono text-[12px] mt-3 break-all p-3 rounded-lg"
                            style={{ background: T.surface, border: "1px solid " + T.border, color: T.textPrimary }}>
                            {wAddress}
                          </div>
                        </div>
                      </div>
                    )}

                    <label className="block mb-4">
                      <div className="text-[12px] mb-1.5" style={{ color: T.textSecondary }}>Memo / Tag (only if your wallet asks for one)</div>
                      <input type="text" value={wMemo} onChange={e => setWMemo(e.target.value)}
                        placeholder="Leave blank if unsure"
                        className="w-full rounded-xl px-3.5 py-2.5 text-[13px] mono outline-none"
                        style={{ background: T.cardBg, border: "1px solid " + T.border, color: T.textPrimary }} />
                    </label>
                    <label className="block">
                      <div className="text-[12px] mb-1.5" style={{ color: T.textSecondary }}>Nickname (optional)</div>
                      <input type="text" value={wLabel} onChange={e => setWLabel(e.target.value)}
                        placeholder="e.g. My Ledger BTC wallet"
                        className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none"
                        style={{ background: T.cardBg, border: "1px solid " + T.border, color: T.textPrimary }} />
                    </label>
                  </>
                )}
              </div>

              <div className="mb-6">
                <div className="text-[12px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: T.textSecondary }}>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold" style={{ background: "#2449A8", color: "#FFFFFF" }}>3</span>
                    How much?
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block">
                      <div className="text-[12px] mb-1.5 flex items-center justify-between" style={{ color: T.textSecondary }}>
                        <span>USD amount</span>
                        
                      </div>
                      <input type="number" value={wAmount} onChange={e => { setWAmount(e.target.value); setFormError(""); }}
                        className="w-full rounded-xl px-3.5 py-3 text-[14px] mono outline-none"
                        style={{ background: T.cardBg, border: "1px solid " + T.border, color: T.textPrimary }} />
                    </label>
                    <div className="flex gap-1.5 mt-2">
                      {[25, 50, 75, 100].map(p => (
                        <button key={p} type="button"
                          onClick={() => setWAmount(((balance?.usd ?? 0) * p / 100).toFixed(2))}
                          className="flex-1 rounded-lg py-1.5 text-[11.5px] font-semibold"
                          style={{ background: T.cardBg, border: "1px solid " + T.border, color: T.textSecondary }}>
                          {p}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: T.cardBg, border: "1px solid " + T.border }}>
                    <div className="text-[11px] uppercase tracking-wider" style={{ color: T.textSecondary }}>You'll receive about</div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <div className="text-[22px] font-bold mono" style={{ color: T.textPrimary }}>
                        {wCryptoAmount > 0 ? wCryptoAmount.toFixed(wPrice > 100 ? 6 : 4) : ""}
                      </div>
                      <div className="text-[13px] font-semibold" style={{ color: T.textSecondary }}>{wAsset}</div>
                    </div>
                    <div className="text-[11.5px] mt-2" style={{ color: T.textSecondary }}>
                      Rate: 1 {wAsset}  {wPrice > 0 ? formatCurrency(wPrice) : ""}
                    </div>
                  </div>
                </div>

                {wAmountNum > 0 && wAmountNum < MIN_WITHDRAWAL && (
                  <div className="mt-3 rounded-xl p-3 text-[12.5px] flex items-start gap-2"
                    style={{ background: "rgba(227,179,65,0.10)", border: "1px solid rgba(227,179,65,0.4)", color: "#92400E" }}>
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Minimum withdrawal is <strong>{formatCurrency(MIN_WITHDRAWAL)}</strong>.
                      You entered <strong>{formatCurrency(wAmountNum)}</strong>.
                    </span>
                  </div>
                )}
              </div>

              {wAddressOk && (
                <label className="flex items-start gap-3 mb-5 cursor-pointer select-none rounded-xl p-3.5"
                  style={{
                    background: wConfirm ? "#F2F6FF" : T.cardBg,
                    border: "1px solid " + (wConfirm ? "#2449A8" : T.border),
                  }}>
                  <input type="checkbox" checked={wConfirm}
                    onChange={e => { setWConfirm(e.target.checked); setFormError(""); }}
                    className="mt-0.5 w-4 h-4 accent-[#2449A8]" />
                  <span className="text-[12.5px]" style={{ color: T.textPrimary }}>
                    Yes, I've checked  the address <span className="mono font-semibold">{wAddress.slice(0, 10)}...{wAddress.slice(-8)}</span> is on <strong>{wMethod.network}</strong> and it's mine.
                  </span>
                </label>
              )}

              {formError && (
                <div className="mb-4 rounded-xl p-3 text-[12.5px] flex items-start gap-2"
                  style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B" }}>
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" /><span>{formError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={submitWithdrawal} disabled={!wReady}
                  className="flex-1 rounded-xl py-3.5 text-[14px] font-semibold transition-all disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  style={{
                    background: wReady ? "#2449A8" : "#94A3B8",
                    color: "#FFFFFF",
                    opacity: wReady ? 1 : 0.85,
                  }}>
                  <Send size={14} /> {wReady ? "Send withdrawal request" : wAmountNum > 0 && wAmountNum < MIN_WITHDRAWAL ? "Minimum " + formatCurrency(MIN_WITHDRAWAL) : "Complete the form to continue"}
                </button>
                <button type="button" onClick={() => { setShowWithdraw(false); setFormError(""); }}
                  className="rounded-xl px-5 text-[14px] font-semibold"
                  style={{ background: "transparent", color: T.textSecondary, border: "1px solid " + T.border }}>
                  Cancel
                </button>
              </div>

              <div className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed" style={{ color: T.textSecondary }}>
                <Info size={12} className="shrink-0 mt-0.5" />
                <span>Requests are processed within 1 business day. Network fees come out of the amount shown.</span>
              </div>
            </>
          )}
        </div>
      
          </div>
        </div>
      )}

      {depositMethods.length > 0 && !showDeposit && !showWithdraw && (
        <div className="panel overflow-hidden">
          <button onClick={() => setShowAllAddresses(v => !v)}
            className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                <Lock size={16} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm">Deposit addresses</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {depositMethods.length} networks available  Tap to {showAllAddresses ? "hide" : "view"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] uppercase tracking-wider font-semibold hidden sm:inline" style={{ color: "var(--muted-2)" }}>
                {showAllAddresses ? "Hide" : "Show"}
              </span>
              {showAllAddresses ? <ChevronDown size={18} style={{ color: "var(--muted)" }} /> : <ChevronRight size={18} style={{ color: "var(--muted)" }} />}
            </div>
          </button>

          {showAllAddresses && (
            <div className="border-t p-5" style={{ borderColor: "var(--border)" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {depositMethods.map(m => (
                  <div key={m.id} className="rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start"
                    style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                    <div className="rounded-xl bg-white p-2 shrink-0 mx-auto sm:mx-0" style={{ border: "1px solid var(--border-2)" }}>
                      <AddressQR value={m.address} size={88} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="font-semibold text-sm truncate">{m.label}</div>
                        <div className="flex gap-1.5 shrink-0">
                          <span className="pill pill-gray">{m.asset}</span>
                          <span className="pill pill-blue">{m.network}</span>
                        </div>
                      </div>
                      <code className="mono text-[11px] block break-all" style={{ color: "var(--muted)" }}>{m.address}</code>
                      <button onClick={() => copyAddress(m.address)}
                        className="mt-3 text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                        style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                        <Copy size={11} /> Copy address
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TransactionList transactions={transactions} />
    </div>
  );
}

function Stat({ icon, label, value, tone = "default" }: { icon: React.ReactNode; label: string; value: string; tone?: "default" | "green" | "amber" }) {
  const color = tone === "green" ? "var(--green)" : tone === "amber" ? "var(--amber)" : "var(--text)";
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
        {icon} {label}
      </div>
      <div className="text-2xl font-bold mono mt-2" style={{ color }}>{value}</div>
    </div>
  );
}