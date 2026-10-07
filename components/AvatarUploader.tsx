'use client';
import { useState, useRef } from 'react';
import { useAuth, useAdminStore, useToast } from '@/app/providers';
import { Camera, Upload, Trash2 } from 'lucide-react';

function resizeToDataUrl(file: File, maxSize = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('no ctx'); return; }
        ctx.drawImage(img, 0, 0, w, h);
        try { resolve(canvas.toDataURL('image/jpeg', quality)); }
        catch (e) { reject(e); }
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AvatarUploader() {
  const { user } = useAuth();
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  const record: any = store.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
  const avatar: string | undefined = record?.avatar;
  const initials = user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { push({ kind: "error", title: "Only image files" }); return; }
    if (file.size > 5 * 1024 * 1024) { push({ kind: "error", title: "Under 5 MB please" }); return; }
    setBusy(true);
    try {
      const dataUrl = await resizeToDataUrl(file);
      if (record) {
        update("users", store.users.map((u: any) => u.id === record.id ? { ...u, avatar: dataUrl } : u));
      } else {
        const id = "u_" + Math.random().toString(36).slice(2, 10);
        update("users", [{ id, name: user.name, email: user.email, tier: user.tier, status: "active",
          kycVerified: false, kycStatus: "unverified", createdAt: Date.now(), avatar: dataUrl } as any, ...store.users]);
        if (!(store.balances ?? []).some((b: any) => b.userId === id)) {
          update("balances", [{ userId: id, usd: 0, locked: 0, updatedAt: Date.now() } as any, ...(store.balances ?? [])]);
        }
      }
      log("AVATAR_UPLOAD", user.email);
      push({ kind: "success", title: "Avatar updated" });
    } catch {
      push({ kind: "error", title: "Could not process image" });
    } finally { setBusy(false); }
  };

  const clear = () => {
    if (!record) return;
    update("users", store.users.map((u: any) => u.id === record.id ? { ...u, avatar: undefined } : u));
    push({ kind: "success", title: "Avatar removed" });
  };

  return (
    <div className="panel p-6 flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold"
          style={{ background: avatar ? "transparent" : "var(--accent-dim)", color: "var(--accent)" }}>
          {avatar ? <img src={avatar} alt={user.name} className="w-full h-full object-cover" /> : initials}
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={busy}
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--green)", color: "#0a0b0f" }} aria-label="Change avatar">
          <Camera size={14} />
        </button>
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="font-semibold text-lg">Profile photo</div>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          PNG, JPG, or WEBP. Max 5 MB. We resize to 256256 automatically.
        </p>
        <div className="flex gap-2 mt-3 justify-center sm:justify-start">
          <button onClick={() => fileRef.current?.click()} disabled={busy}
            className="btn btn-primary text-xs">
            <Upload size={12} /> {busy ? "Uploading" : avatar ? "Change photo" : "Upload photo"}
          </button>
          {avatar && (
            <button onClick={clear}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
              style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>
              <Trash2 size={11} /> Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>
    </div>
  );
}