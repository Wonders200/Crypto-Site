"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminKycSubmission, AdminUser, KycStatus } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Textarea, Select, Badge, Kpi } from "@/components/admin/ui";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import LiveDate from "@/components/LiveDate";
import { Search, Check, X, Eye, FileText, User, AlertTriangle } from "lucide-react";

interface ReviewRow {
  userId: string;
  user: AdminUser;
  submission?: AdminKycSubmission;
  status: KycStatus;
  fullName: string;
  country: string;
  idType?: string;
  idNumber?: string;
  docsCount: number;
  submittedAt: number;
  rejectionReason?: string;
  reviewedAt?: number;
  reviewedBy?: string;
}

export default function AdminKycPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<ReviewRow | null>(null);
  const [rejecting, setRejecting] = useState<ReviewRow | null>(null);
  const [reason, setReason] = useState("");

  const rows = useMemo<ReviewRow[]>(() => {
    return store.users.map(u => {
      const sub = (store.kycSubmissions ?? []).find(s => s.userId === u.id);
      const status: KycStatus = u.kycStatus ?? (u.kycVerified ? "verified" : "unverified");
      const docs = sub ? [sub.idFrontUrl, sub.idBackUrl, sub.selfieUrl].filter(Boolean).length : 0;
      return {
        userId: u.id,
        user: u,
        submission: sub,
        status,
        fullName: sub?.fullName ?? u.name,
        country: sub?.country ?? "",
        idType: sub?.idType,
        idNumber: sub?.idNumber,
        docsCount: docs,
        submittedAt: sub?.submittedAt ?? u.createdAt,
        rejectionReason: sub?.rejectionReason,
        reviewedAt: sub?.reviewedAt,
        reviewedBy: sub?.reviewedBy,
      };
    });
  }, [store.users, store.kycSubmissions]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows
      .filter(r => statusFilter === "all" || r.status === statusFilter)
      .filter(r => {
        if (!term) return true;
        return r.fullName.toLowerCase().includes(term) || r.user.email.toLowerCase().includes(term);
      })
      .sort((a, b) => {
        const order: Record<KycStatus, number> = { pending: 0, rejected: 1, unverified: 2, verified: 3 };
        if (a.status !== b.status) return order[a.status] - order[b.status];
        return b.submittedAt - a.submittedAt;
      });
  }, [rows, q, statusFilter]);

  const pendingCount = rows.filter(r => r.status === "pending").length;
  const verifiedCount = rows.filter(r => r.status === "verified").length;
  const unverifiedCount = rows.filter(r => r.status === "unverified").length;
  const rejectedCount = rows.filter(r => r.status === "rejected").length;

  const approve = (r: ReviewRow) => {
    let sub = r.submission;
    if (!sub) {
      sub = {
        id: "kyc_" + Math.random().toString(36).slice(2, 10),
        userId: r.userId, fullName: r.user.name, dateOfBirth: "", country: "", address: "", city: "", postalCode: "", phone: "",
        idType: "passport", idNumber: "", status: "verified", submittedAt: Date.now(),
      };
      update("kycSubmissions", [sub, ...(store.kycSubmissions ?? [])]);
    } else {
      update("kycSubmissions", (store.kycSubmissions ?? []).map(x => (x.id === sub!.id
        ? { ...x, status: "verified" as KycStatus, reviewedAt: Date.now(), reviewedBy: store.credentials.email }
        : x)));
    }
    update("users", store.users.map(u => (u.id === r.userId ? { ...u, kycStatus: "verified" as KycStatus, kycVerified: true } : u)));
    log("KYC_APPROVE", "KYC: " + r.user.email, r.fullName);
    push({ kind: "success", title: "KYC approved", message: r.fullName + " is now verified." });
    setViewing(null);
  };

  const reject = () => {
    if (!rejecting) return;
    if (!reason.trim()) { push({ kind: "error", title: "Please provide a reason" }); return; }
    let sub = rejecting.submission;
    if (!sub) {
      sub = {
        id: "kyc_" + Math.random().toString(36).slice(2, 10),
        userId: rejecting.userId, fullName: rejecting.user.name, dateOfBirth: "", country: "", address: "", city: "", postalCode: "", phone: "",
        idType: "passport", idNumber: "", status: "rejected", submittedAt: Date.now(),
      };
      update("kycSubmissions", [sub, ...(store.kycSubmissions ?? [])]);
    } else {
      update("kycSubmissions", (store.kycSubmissions ?? []).map(x => (x.id === sub!.id
        ? { ...x, status: "rejected" as KycStatus, reviewedAt: Date.now(), reviewedBy: store.credentials.email, rejectionReason: reason.trim() }
        : x)));
    }
    update("users", store.users.map(u => (u.id === rejecting.userId ? { ...u, kycStatus: "rejected" as KycStatus, kycVerified: false } : u)));
    log("KYC_REJECT", "KYC: " + rejecting.user.email, reason.trim());
    push({ kind: "success", title: "KYC rejected" });
    setRejecting(null);
    setReason("");
    setViewing(null);
  };

  const resetToUnverified = (r: ReviewRow) => {
    if (!confirm("Reset KYC for " + r.fullName + "?")) return;
    update("users", store.users.map(u => (u.id === r.userId ? { ...u, kycStatus: "unverified" as KycStatus, kycVerified: false } : u)));
    if (r.submission) {
      update("kycSubmissions", (store.kycSubmissions ?? []).map(x => (x.id === r.submission!.id
        ? { ...x, status: "unverified" as KycStatus, reviewedAt: Date.now(), reviewedBy: store.credentials.email }
        : x)));
    }
    log("KYC_RESET", "KYC: " + r.user.email, r.fullName);
    push({ kind: "success", title: "KYC reset" });
  };

  return (
    <div>
      <PageHeader
        title="KYC Reviews"
        subtitle={rows.length + " customers  " + pendingCount + " pending  " + verifiedCount + " verified"}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Pending review" value={String(pendingCount)} tone={pendingCount > 0 ? "amber" : "default"} />
        <Kpi label="Verified" value={String(verifiedCount)} tone="green" />
        <Kpi label="Unverified" value={String(unverifiedCount)} tone={unverifiedCount > 0 ? "amber" : "default"} />
        <Kpi label="Rejected" value={String(rejectedCount)} tone={rejectedCount > 0 ? "red" : "default"} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or email"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
        <div className="w-44">
          <Select value={statusFilter} onChange={setStatusFilter} options={[
            { value: "all", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "verified", label: "Verified" },
            { value: "unverified", label: "Unverified" },
            { value: "rejected", label: "Rejected" },
          ]} />
        </div>
      </div>

      <Panel padded={false}>
        <DataTable<ReviewRow>
          keyFn={r => r.userId}
          rows={filtered}
          empty="No customers match your search."
          columns={[
            { key: "user", label: "Customer", render: r => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                  {r.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{r.fullName}</div>
                  <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{r.user.email}</div>
                </div>
              </div>
            )},
            { key: "country", label: "Country", render: r => <span className="text-xs">{r.country}</span> },
            { key: "doc", label: "Document", render: r => (
              <div>
                <div className="text-xs font-medium capitalize">{r.idType ? r.idType.replace("_", " ") : ""}</div>
                <div className="text-[11px] mono" style={{ color: "var(--muted)" }}>{r.idNumber ?? ""}</div>
              </div>
            )},
            { key: "docs", label: "Files", align: "center", render: r => (
              r.docsCount > 0
                ? <span className="text-xs"><FileText size={11} className="inline mr-1" />{r.docsCount}</span>
                : <span className="text-xs" style={{ color: "var(--muted-2)" }}>none</span>
            )},
            { key: "status", label: "Status", align: "center", render: r => (
              <Badge kind={r.status === "verified" ? "green" : r.status === "pending" ? "amber" : r.status === "rejected" ? "red" : "gray"}>
                {r.status}
              </Badge>
            )},
            { key: "at", label: "Updated", align: "right", render: r => (
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                <LiveTimeAgo ts={r.reviewedAt ?? r.submittedAt} />
              </span>
            )},
            { key: "act", label: "", align: "right", render: r => (
              <div className="flex justify-end gap-1.5">
                <Btn kind="ghost" size="sm" onClick={() => setViewing(r)}><Eye size={11} /> View</Btn>
                {r.status === "pending" && (
                  <>
                    <Btn kind="success" size="sm" onClick={() => approve(r)}><Check size={11} /> Approve</Btn>
                    <Btn kind="danger" size="sm" onClick={() => { setRejecting(r); setReason(""); }}><X size={11} /></Btn>
                  </>
                )}
                {r.status === "verified" && (
                  <Btn kind="ghost" size="sm" onClick={() => resetToUnverified(r)}>Reset</Btn>
                )}
              </div>
            )},
          ]}
        />
      </Panel>

      <Modal open={!!viewing} onClose={() => setViewing(null)}
        title={viewing ? "KYC  " + viewing.fullName : "KYC"}
        footer={viewing && viewing.status === "pending" ? (
          <>
            <Btn kind="danger" onClick={() => { setRejecting(viewing); setReason(""); setViewing(null); }}><X size={12} /> Reject</Btn>
            <Btn kind="success" onClick={() => approve(viewing)}><Check size={12} /> Approve &amp; verify</Btn>
          </>
        ) : (
          <>
            {viewing && !viewing.submission && (
              <a href="/admin/debug" className="text-xs font-semibold px-3 py-2 rounded-lg"
                style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                Debug store
              </a>
            )}
            <Btn kind="ghost" onClick={() => setViewing(null)}>Close</Btn>
          </>
        )}>
        {viewing && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                {viewing.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{viewing.fullName}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{viewing.user.email}</div>
              </div>
              <Badge kind={viewing.status === "verified" ? "green" : viewing.status === "pending" ? "amber" : viewing.status === "rejected" ? "red" : "gray"}>
                {viewing.status}
              </Badge>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold"
                style={{ background: "var(--panel-2)", color: "var(--muted)" }}>
                <User size={11} className="inline mr-1" /> Personal information
              </div>
              {[
                ["Full legal name", viewing.submission?.fullName ?? viewing.user.name],
                ["Date of birth", viewing.submission?.dateOfBirth ?? ""],
                ["Country", viewing.submission?.country ?? ""],
                ["Address", viewing.submission?.address ?? ""],
                ["City", viewing.submission?.city ?? ""],
                ["Phone", viewing.submission?.phone ?? ""],
              ].map(([k, v], i) => (
                <div key={k} className="flex justify-between px-4 py-2 text-sm gap-4" style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ color: "var(--muted)" }}>{k}</span>
                  <span className="mono text-right">{v || ""}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold"
                style={{ background: "var(--panel-2)", color: "var(--muted)" }}>
                <FileText size={11} className="inline mr-1" /> Document
              </div>
              <div className="flex justify-between px-4 py-2 text-sm gap-4" style={{ borderTop: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>Type</span>
                <span className="capitalize">{viewing.submission?.idType ? viewing.submission.idType.replace("_", " ") : ""}</span>
              </div>
              <div className="flex justify-between px-4 py-2 text-sm gap-4" style={{ borderTop: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>Number</span>
                <span className="mono">{viewing.submission?.idNumber ?? ""}</span>
              </div>
            </div>

            {!viewing.submission ? (
              <div className="rounded-xl p-5 flex flex-col items-center text-center gap-3"
                style={{ background: "rgba(124,143,245,0.08)", border: "1px dashed rgba(124,143,245,0.5)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                  <User size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold">No KYC submission yet</div>
                  <div className="text-xs mt-1 max-w-md" style={{ color: "var(--muted)" }}>
                    This customer has an account but has not submitted the KYC form.
                    Once they complete <span className="mono" style={{ color: "var(--accent)" }}>/kyc</span>,
                    their personal details and document images will appear here.
                  </div>
                </div>
                <div className="text-[11px] rounded-lg px-3 py-2 mt-2 max-w-md"
                  style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  <strong style={{ color: "var(--text)" }}>Tip:</strong> If they claim they submitted,
                  check that they're using the <strong>same browser</strong> (not incognito, not another device).
                  localStorage doesn't cross browsers.
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-2 font-semibold" style={{ color: "var(--muted)" }}>Documents &amp; images</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "ID front", url: viewing.submission.idFrontUrl },
                    { label: "ID back", url: viewing.submission.idBackUrl },
                    { label: "Selfie", url: viewing.submission.selfieUrl },
                  ].map(d => (
                    <div key={d.label}>
                      <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>{d.label}</div>
                      {d.url ? (
                        <a href={d.url} target="_blank" rel="noreferrer">
                          <img src={d.url} alt={d.label} className="rounded-lg w-full h-32 object-cover cursor-zoom-in"
                            style={{ border: "1px solid var(--border)" }} />
                        </a>
                      ) : (
                        <div className="rounded-lg w-full h-32 flex items-center justify-center text-xs text-center"
                          style={{ border: "1px dashed var(--border)", color: "var(--muted-2)" }}>
                          No image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewing.status === "rejected" && viewing.rejectionReason && (
              <div className="rounded-xl p-3.5 flex items-start gap-3 text-xs"
                style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.4)", color: "var(--red)" }}>
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Rejected:</strong> {viewing.rejectionReason}
                  {viewing.reviewedAt && <div className="mt-1 opacity-70">Reviewed <LiveDate ts={viewing.reviewedAt} mode="datetime" /></div>}
                </div>
              </div>
            )}

            <div className="text-xs flex justify-between flex-wrap gap-2" style={{ color: "var(--muted)" }}>
              <span>Submitted <LiveTimeAgo ts={viewing.submittedAt} /></span>
              {viewing.reviewedBy && <span>Reviewed by <strong className="mono">{viewing.reviewedBy}</strong></span>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!rejecting} onClose={() => { setRejecting(null); setReason(""); }}
        title="Reject KYC"
        footer={<><Btn kind="ghost" onClick={() => { setRejecting(null); setReason(""); }}>Cancel</Btn><Btn kind="danger" onClick={reject}>Reject</Btn></>}>
        {rejecting && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Provide a reason. <strong style={{ color: "var(--text)" }}>{rejecting.fullName}</strong> will see it and can resubmit.
            </p>
            <Field label="Reason for rejection">
              <Textarea value={reason} onChange={setReason} rows={4} />
            </Field>
            <div className="flex flex-wrap gap-2">
              {[
                "Document photo is blurry or unreadable",
                "Selfie does not match the ID photo",
                "Document appears to be expired",
                "Information does not match",
                "Document appears altered",
              ].map(r => (
                <button key={r} type="button" onClick={() => setReason(r)}
                  className="text-xs px-2.5 py-1.5 rounded-md"
                  style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}