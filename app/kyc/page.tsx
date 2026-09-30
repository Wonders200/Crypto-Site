"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useAdminStore, useToast } from "@/app/providers";
import { AdminKycSubmission, uid, KycStatus } from "@/lib/adminStore";
import { getKycStatus } from "@/lib/kyc";
import BackButton from "@/components/BackButton";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { broadcast } from "@/lib/realtime";
import {
  ShieldCheck, ArrowRight, ArrowLeft, Check, UploadCloud, X as XIcon,
  UserCircle2, FileText, Camera, ClipboardCheck, Clock, XCircle,
  AlertTriangle, CheckCircle2, Lock,
} from "lucide-react";

function fileToResizedDataUrl(file: File, maxW = 900, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
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

const COUNTRIES = ["United States","United Kingdom","Canada","Australia","Germany","France","Netherlands","Spain","Italy","Switzerland","Singapore","Japan","South Korea","Nigeria","South Africa","Kenya","Ghana","UAE","India","Brazil","Mexico","Argentina","Other"];
const ID_TYPES = [
  { value: "passport" as const, label: "Passport" },
  { value: "drivers_license" as const, label: "Driver's license" },
  { value: "national_id" as const, label: "National ID" },
];

export default function KycPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { store, update, log } = useAdminStore();
  const { push } = useToast();

  const demoEmail = store.demoUser?.email ?? "demo@cryptosite.io";
  const matchedUser = store.users.find(u => user && u.email.toLowerCase() === user.email.toLowerCase())
    ?? store.users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase())
    ?? store.users[0];

  const existing = useMemo(() => {
    const subs = (store.kycSubmissions ?? []).filter(s => s.userId === matchedUser?.id);
    return subs.sort((a, b) => b.submittedAt - a.submittedAt)[0];
  }, [store.kycSubmissions, matchedUser?.id]);

  // Final, authoritative status
  const status: KycStatus = getKycStatus(matchedUser, existing);
  const isVerified = status === "verified";
  const isPending = status === "pending";
  const isRejected = status === "rejected";

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [forceForm, setForceForm] = useState(false);

  const [fullName, setFullName] = useState(matchedUser?.name ?? "");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [idType, setIdType] = useState<"passport" | "drivers_license" | "national_id">("passport");
  const [idNumber, setIdNumber] = useState("");
  const [idFrontUrl, setIdFrontUrl] = useState<string | undefined>();
  const [idBackUrl, setIdBackUrl] = useState<string | undefined>();
  const [selfieUrl, setSelfieUrl] = useState<string | undefined>();

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  /* ============================================================
     HARD LOCK: verified users can NEVER see the form
     Pending users see only the status card
     Rejected users see status + resubmit button
     Only unverified (or explicit forceForm after reject)  form
     ============================================================ */
  const showStatusCard = !forceForm && (isVerified || isPending || isRejected);

  if (showStatusCard) {
    const config = isVerified ? {
      icon: CheckCircle2,
      color: "var(--green)",
      title: "You're verified",
      msg: "Your identity has been confirmed. You have full access to deposits, withdrawals, trading, and earn products. Nothing more to do.",
    } : isPending ? {
      icon: Clock,
      color: "var(--amber)",
      title: "Verification in review",
      msg: "We're reviewing your documents. This usually takes 1 business day.",
    } : {
      icon: XCircle,
      color: "var(--red)",
      title: "Verification rejected",
      msg: existing?.rejectionReason ?? "Please review and resubmit your documents.",
    };

    const Icon = config.icon;

    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-4 -ml-2">
          <BackButton fallback="/dashboard" label="Back to dashboard" />
        </div>

        <div className="panel p-8 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: config.color, color: "#0a0b0f" }}>
            <Icon size={26} />
          </div>

          <h1 className="text-2xl font-bold mt-5">{config.title}</h1>
          <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: "var(--muted)" }}>
            {config.msg}
          </p>

          {existing && (
            <div className="mt-6 rounded-xl p-4 text-left text-xs space-y-2"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Submitted</span>
                <span><LiveTimeAgo ts={existing.submittedAt} /></span>
              </div>
              {existing.reviewedAt && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Reviewed</span>
                  <span><LiveTimeAgo ts={existing.reviewedAt} /></span>
                </div>
              )}

              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Document</span>
                <span>{ID_TYPES.find(t => t.value === existing.idType)?.label ?? existing.idType}</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            {isRejected && (
              <button
                onClick={() => {
                  setForceForm(true);
                  setStep(1);
                  setError("");
                  push({ kind: "info", title: "You can now resubmit" });
                }}
                className="btn btn-primary">
                Resubmit documents <ArrowRight size={14} />
              </button>
            )}
            <Link href="/dashboard" className="btn btn-ghost">Back to dashboard</Link>
          </div>

          {isVerified && (
            <p className="text-xs mt-6" style={{ color: "var(--muted-2)" }}>
              Need to update your information? Contact support.
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ============================================================
     KYC FORM (unverified users only, or after clicking Resubmit)
     ============================================================ */
  const steps = [
    { n: 1, label: "Personal", icon: UserCircle2 },
    { n: 2, label: "ID", icon: FileText },
    { n: 3, label: "Selfie", icon: Camera },
    { n: 4, label: "Review", icon: ClipboardCheck },
  ];

  const step1Valid = !!(fullName.trim() && dob && country && address.trim() && city.trim() && phone.trim());
  const step2Valid = !!(idNumber.trim() && idFrontUrl);
  const step3Valid = !!selfieUrl;
  const canAdvance = step === 1 ? step1Valid : step === 2 ? step2Valid : step === 3 ? step3Valid : true;

  const handleFile = async (file: File, setter: (v: string) => void) => {
    if (!file.type.startsWith("image/")) { setError("Only image files accepted."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("Image must be under 8 MB."); return; }
    setUploading(true);
    setError("");
    try {
      const url = await fileToResizedDataUrl(file);
      setter(url);
    } catch {
      setError("Could not process image.");
    } finally {
      setUploading(false);
    }
  };

  const next = () => {
    setError("");
    if (!canAdvance) { setError("Please fill all required fields."); return; }
    setStep(s => Math.min(4, s + 1));
  };

  const back = () => { setError(""); setStep(s => Math.max(1, s - 1)); };

  const submit = async () => {
    if (!matchedUser) { setError("No user found."); return; }
    if (!step1Valid || !step2Valid || !step3Valid) {
      setError("Please complete all steps before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    await new Promise(r => setTimeout(r, 700));

    const submission: AdminKycSubmission = {
      id: uid("kyc"),
      userId: matchedUser.id,
      fullName,
      dateOfBirth: dob,
      country,
      address,
      city,
      postalCode,
      phone,
      idType,
      idNumber,
      idFrontUrl,
      idBackUrl,
      selfieUrl,
      status: "pending",
      submittedAt: Date.now(),
    };

    // Save BOTH the submission and the user record  belt and suspenders
    update("kycSubmissions", [submission, ...(store.kycSubmissions ?? [])]);
    update("users", store.users.map(u => u.id === matchedUser.id
      ? { ...u, kycStatus: "pending" as KycStatus, kycVerified: false }
      : u));

    broadcast("CUSTOMER_ACTION", `${fullName} submitted KYC documents  needs review`, { actor: matchedUser.email, payload: { type: "kyc" } });
    log("KYC_SUBMIT", "KYC: " + matchedUser.email, fullName);
    push({ kind: "success", title: "Documents submitted", message: "We'll confirm within 1 business day." });

    setSubmitting(false);
    setForceForm(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-4 -ml-2">
        <BackButton fallback="/dashboard" label="Back to dashboard" />
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
          style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
          <ShieldCheck size={12} style={{ color: "var(--accent)" }} />
          <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>Identity verification</span>
        </div>
        <h1 className="text-3xl font-bold">Verify your identity</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Complete these 4 short steps. This unlocks deposits, withdrawals, trading, and earn products.
        </p>
      </div>

      <div className="panel p-5 mb-6">
        <div className="flex items-center justify-between gap-2">
          {steps.map((s, i) => {
            const done = step > s.n;
            const active = step === s.n;
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: done ? "var(--green)" : active ? "var(--accent)" : "var(--panel-2)",
                      color: done || active ? "#0a0b0f" : "var(--muted)",
                      border: "1px solid " + (done ? "var(--green)" : active ? "var(--accent)" : "var(--border)"),
                    }}>
                    {done ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                  </div>
                  <div className="hidden sm:block text-xs font-semibold whitespace-nowrap"
                    style={{ color: active ? "var(--text)" : "var(--muted)" }}>{s.label}</div>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px min-w-[8px]" style={{ background: done ? "var(--green)" : "var(--border)" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {step === 1 && (
        <div className="panel p-6 space-y-4">
          <h2 className="text-lg font-semibold">Your details</h2>
          <label className="block">
            <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>Full legal name *</div>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="As shown on your ID" className="input" />
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>Date of birth *</div>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="input" />
            </label>
            <label className="block">
              <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>Country *</div>
              <select value={country} onChange={e => setCountry(e.target.value)} className="input">
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>Residential address *</div>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" className="input" />
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>City *</div>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="input" />
            </label>
            <label className="block">
              <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>Postal code</div>
              <input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Optional" className="input" />
            </label>
          </div>
          <label className="block">
            <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>Phone number *</div>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 123 4567" className="input" />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="panel p-6 space-y-4">
          <h2 className="text-lg font-semibold">Upload your ID</h2>
          <div>
            <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>Document type *</div>
            <div className="grid grid-cols-3 gap-2">
              {ID_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setIdType(t.value)}
                  className="py-2.5 px-3 rounded-lg text-xs font-semibold transition"
                  style={{
                    background: idType === t.value ? "var(--accent-dim)" : "var(--panel-2)",
                    border: "1px solid " + (idType === t.value ? "var(--accent)" : "var(--border)"),
                    color: idType === t.value ? "var(--accent)" : "var(--muted)",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>Document number *</div>
            <input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="e.g. 1234567890" className="input mono" />
          </label>
          <DocUpload label="Front of document *" value={idFrontUrl} onChange={setIdFrontUrl} inputRef={frontRef} onFile={handleFile} uploading={uploading} />
          <DocUpload label="Back of document (not required for passports)" value={idBackUrl} onChange={setIdBackUrl} inputRef={backRef} onFile={handleFile} uploading={uploading} />
        </div>
      )}

      {step === 3 && (
        <div className="panel p-6 space-y-4">
          <h2 className="text-lg font-semibold">Take a selfie</h2>
          <div className="rounded-xl p-4 text-xs leading-relaxed"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
            <strong style={{ color: "var(--text)" }}>Tips:</strong> Face the camera, good lighting, remove hats/sunglasses, hold your ID next to your face.
          </div>
          <DocUpload label="Selfie holding your ID *" value={selfieUrl} onChange={setSelfieUrl} inputRef={selfieRef} onFile={handleFile} uploading={uploading} />
        </div>
      )}

      {step === 4 && (
        <div className="panel p-6 space-y-4">
          <h2 className="text-lg font-semibold">Review and submit</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Confirm everything is correct.</p>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {[
              ["Full name", fullName],
              ["Date of birth", dob],
              ["Country", country],
              ["Address", address + ", " + city + (postalCode ? ", " + postalCode : "")],
              ["Phone", phone],
              ["Document type", ID_TYPES.find(t => t.value === idType)?.label ?? idType],
              ["Document number", idNumber],
            ].map(([k, v], i) => (
              <div key={k} className="flex justify-between px-4 py-2.5 text-sm gap-4"
                style={{ background: i % 2 === 0 ? "transparent" : "var(--panel-2)", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                <span style={{ color: "var(--muted)" }}>{k}</span>
                <span className="mono font-medium text-right truncate">{v || ""}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "ID front", url: idFrontUrl },
              { label: "ID back", url: idBackUrl },
              { label: "Selfie", url: selfieUrl },
            ].map(d => (
              <div key={d.label}>
                <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>{d.label}</div>
                {d.url ? (
                  <img src={d.url} alt={d.label} className="rounded-lg w-full h-24 object-cover" style={{ border: "1px solid var(--border)" }} />
                ) : (
                  <div className="rounded-lg w-full h-24 flex items-center justify-center text-xs"
                    style={{ border: "1px dashed var(--border)", color: "var(--muted-2)" }}>Not provided</div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-xl p-3.5 flex items-start gap-3 text-xs"
            style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
            <Lock size={14} style={{ color: "var(--accent)", marginTop: 1, flexShrink: 0 }} />
            <span style={{ color: "var(--text)" }}>Your data is encrypted and only used for identity verification.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl p-3 text-sm flex items-start gap-2"
          style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.4)", color: "#f85149" }}>
          <AlertTriangle size={14} className="shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {step > 1 && step < 4 && (
          <button type="button" onClick={back} className="btn btn-ghost">
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div className="flex-1"></div>
        {step < 4 ? (
          <button type="button" onClick={next} disabled={!canAdvance} className="btn btn-primary disabled:opacity-40">
            Continue <ArrowRight size={14} />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting || !step1Valid || !step2Valid || !step3Valid}
            className="btn btn-primary disabled:opacity-40">
            {submitting ? "Submitting" : <><Check size={14} /> Submit for review</>}
          </button>
        )}
      </div>
    </div>
  );
}

function DocUpload({
  label, value, onChange, inputRef, onFile, uploading,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onFile: (file: File, setter: (v: string) => void) => Promise<void>;
  uploading: boolean;
}) {
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <div className="text-xs mb-1.5 font-semibold" style={{ color: "var(--muted)" }}>{label}</div>
      {!value ? (
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f, onChange as (v: string) => void); }}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl py-6 text-center cursor-pointer transition"
          style={{
            background: drag ? "var(--accent-dim)" : "var(--panel-2)",
            border: "1.5px dashed " + (drag ? "var(--accent)" : "var(--border)"),
          }}>
          <UploadCloud size={22} style={{ color: drag ? "var(--accent)" : "var(--muted)", margin: "0 auto 6px" }} />
          <div className="text-xs font-semibold">{uploading ? "Processing" : "Click to upload or drag & drop"}</div>
          <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>PNG or JPG  up to 8 MB</div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f, onChange as (v: string) => void); }} />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--panel-2)" }}>
          <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
            <CheckCircle2 size={12} style={{ color: "var(--green)" }} />
            <div className="text-xs flex-1 font-medium">Uploaded</div>
            <button type="button" onClick={() => onChange(undefined)} className="p-1 rounded hover:bg-white/5">
              <XIcon size={12} style={{ color: "var(--muted)" }} />
            </button>
          </div>
          <img src={value} alt="upload" className="w-full h-32 object-cover" />
        </div>
      )}
    </div>
  );
}