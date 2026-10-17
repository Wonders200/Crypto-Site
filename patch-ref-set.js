const fs = require("fs");
let ok = 0, fail = 0;
function logOk(l) { ok++; console.log("  OK:   " + l); }
function logFail(l) { fail++; console.log("  FAIL: " + l); }

/* =========================================================
   1. PATCH REFERRALS PAGE
   ========================================================= */
console.log("--- app/referrals/page.tsx ---");
const refPath = "app/referrals/page.tsx";
let r = fs.readFileSync(refPath, "utf8");
const rCRLF = r.includes("\r\n");
if (rCRLF) r = r.replace(/\r\n/g, "\n");

function rep(oldStr, newStr, label) {
  if (r.includes(newStr)) return;
  if (r.includes(oldStr)) { r = r.replace(oldStr, newStr); logOk(label); }
  else { logFail(label); }
}

rep(
  'import { Gift, Copy, Check, Users, DollarSign, Share2, UserPlus } from "lucide-react";',
  'import { Gift, Copy, Check, Users, DollarSign, Share2, UserPlus } from "lucide-react";\nimport { useI18n } from "@/lib/i18n";',
  "ref: import useI18n"
);
rep(
  '  const { push } = useToast();',
  '  const { push } = useToast();\n  const { t } = useI18n();',
  "ref: useI18n hook"
);
rep(
  '<h1 className="text-xl font-bold mt-4">Sign in to view referrals</h1>',
  '<h1 className="text-xl font-bold mt-4">{t("referrals.signIn")}</h1>',
  "ref: sign in title"
);
rep(
  '<Link href="/login" className="btn btn-primary inline-block mt-6">Sign in</Link>',
  '<Link href="/login" className="btn btn-primary inline-block mt-6">{t("referrals.signInBtn")}</Link>',
  "ref: sign in btn"
);
rep(
  '<BackButton fallback="/dashboard" label="Back to dashboard" />\n        <div className="panel p-8 mt-6 text-center">',
  '<BackButton fallback="/dashboard" label={t("referrals.backToDashboard")} />\n        <div className="panel p-8 mt-6 text-center">',
  "ref: back button 1"
);
rep(
  '<h1 className="text-xl font-bold mt-4">Activating your referral code</h1>',
  '<h1 className="text-xl font-bold mt-4">{t("referrals.activating")}</h1>',
  "ref: activating title"
);
rep(
  '<p className="text-sm mt-2" style={{ color: "var(--muted)" }}>If this persists, contact support.</p>',
  '<p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{t("referrals.activatingMsg")}</p>',
  "ref: activating msg"
);
rep(
  'push({ kind: "success", title: "Copied" });',
  'push({ kind: "success", title: t("referrals.copiedToast") });',
  "ref: copied toast"
);
rep(
  'const shareData = { title: "Join ApexVault", text: "Use my link to sign up for ApexVault", url: link };',
  'const shareData = { title: t("referrals.shareTitle"), text: t("referrals.shareText"), url: link };',
  "ref: share data"
);
rep(
  'push({ kind: "success", title: "Link copied" });',
  'push({ kind: "success", title: t("referrals.linkCopied") });',
  "ref: link copied toast"
);
rep(
  '<div className="-ml-2 -mb-2"><BackButton fallback="/dashboard" label="Back to dashboard" /></div>',
  '<div className="-ml-2 -mb-2"><BackButton fallback="/dashboard" label={t("referrals.backToDashboard")} /></div>',
  "ref: back button 2"
);
rep(
  'Referrals\n        </h1>',
  '{t("referrals.title")}\n        </h1>',
  "ref: title"
);
rep(
  'Invite friends and earn rewards when they join and trade.',
  '{t("referrals.subtitle")}',
  "ref: subtitle"
);
rep(
  '> Referred friends</div>',
  '> {t("referrals.stats.friends")}</div>',
  "ref: stat friends"
);
rep(
  '> Total earned</div>',
  '> {t("referrals.stats.earned")}</div>',
  "ref: stat earned"
);
rep(
  '> Your code</div>',
  '> {t("referrals.stats.code")}</div>',
  "ref: stat code"
);
rep(
  '<h2 className="text-lg font-semibold mb-3">Your referral link</h2>',
  '<h2 className="text-lg font-semibold mb-3">{t("referrals.linkTitle")}</h2>',
  "ref: link title"
);
rep(
  "Share this link. When someone signs up using it, they'll be linked to your account.",
  '{t("referrals.linkDesc")}',
  "ref: link desc"
);
rep(
  '{copied === "link" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}',
  '{copied === "link" ? <><Check size={12} /> {t("referrals.copied")}</> : <><Copy size={12} /> {t("referrals.copy")}</>}',
  "ref: copy btn"
);
rep(
  '<Share2 size={12} /> Share',
  '<Share2 size={12} /> {t("referrals.share")}',
  "ref: share btn"
);
rep(
  '<h2 className="text-lg font-semibold mb-4">Your referrals</h2>',
  '<h2 className="text-lg font-semibold mb-4">{t("referrals.listTitle")}</h2>',
  "ref: list title"
);
rep(
  '<p className="mt-4 text-sm font-semibold">No referrals yet</p>',
  '<p className="mt-4 text-sm font-semibold">{t("referrals.noReferrals")}</p>',
  "ref: no referrals"
);
rep(
  '<p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Share your link to start earning.</p>',
  '<p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t("referrals.noReferralsDesc")}</p>',
  "ref: no referrals desc"
);
rep(
  '>Name</th>',
  '>{t("referrals.colName")}</th>',
  "ref: col name"
);
rep(
  '>Email</th>',
  '>{t("referrals.colEmail")}</th>',
  "ref: col email"
);
rep(
  '>Joined</th>',
  '>{t("referrals.colJoined")}</th>',
  "ref: col joined"
);
rep(
  '>Bonus</th>',
  '>{t("referrals.colBonus")}</th>',
  "ref: col bonus"
);

if (rCRLF) r = r.replace(/\n/g, "\r\n");
fs.writeFileSync(refPath, r, "utf8");

/* =========================================================
   2. PATCH SETTINGS PAGE
   ========================================================= */
console.log("\n--- app/settings/page.tsx ---");
const setPath = "app/settings/page.tsx";
let s = fs.readFileSync(setPath, "utf8");
const sCRLF = s.includes("\r\n");
if (sCRLF) s = s.replace(/\r\n/g, "\n");

function repS(oldStr, newStr, label) {
  if (s.includes(newStr)) return;
  if (s.includes(oldStr)) { s = s.replace(oldStr, newStr); logOk(label); }
  else { logFail(label); }
}

repS(
  'import AvatarUploader from "@/components/AvatarUploader";',
  'import AvatarUploader from "@/components/AvatarUploader";\nimport { useI18n } from "@/lib/i18n";',
  "set: import useI18n"
);
repS(
  '  const { push } = useToast();',
  '  const { push } = useToast();\n  const { t } = useI18n();',
  "set: useI18n hook"
);
repS(
  'push({ kind: "error", title: "Error", message: data?.error });',
  'push({ kind: "error", title: t("settings.error"), message: data?.error });',
  "set: error toast"
);
repS(
  'push({ kind: "success", title: "2FA enabled" });',
  'push({ kind: "success", title: t("settings.2faEnabled") });',
  "set: 2fa enabled toast"
);
repS(
  'push({ kind: "error", title: "Invalid code", message: data?.error });',
  'push({ kind: "error", title: t("settings.invalidCode"), message: data?.error });',
  "set: invalid code toast"
);
repS(
  'if (!confirm("Disable 2FA? Your account will be less secure.")) return;',
  'if (!confirm(t("settings.confirmDisable"))) return;',
  "set: confirm disable"
);
repS(
  'push({ kind: "success", title: "2FA disabled" });',
  'push({ kind: "success", title: t("settings.2faDisabled") });',
  "set: 2fa disabled toast"
);
repS(
  '<h1 className="text-xl font-bold mt-4">Sign in to view settings</h1>',
  '<h1 className="text-xl font-bold mt-4">{t("settings.signIn")}</h1>',
  "set: sign in title"
);
repS(
  '<Link href="/login" className="btn btn-primary inline-block mt-6">Sign in</Link>',
  '<Link href="/login" className="btn btn-primary inline-block mt-6">{t("settings.signInBtn")}</Link>',
  "set: sign in btn"
);
repS(
  '<BackButton fallback="/dashboard" label="Back to dashboard" />',
  '<BackButton fallback="/dashboard" label={t("settings.backToDashboard")} />',
  "set: back button"
);
repS(
  '<h1 className="text-3xl font-bold">Account settings</h1>',
  '<h1 className="text-3xl font-bold">{t("settings.title")}</h1>',
  "set: title"
);
repS(
  '<Mail size={16} /> Profile',
  '<Mail size={16} /> {t("settings.profile")}',
  "set: profile"
);
repS(
  '>Name</div>',
  '>{t("settings.name")}</div>',
  "set: name"
);
repS(
  '>Email</div>',
  '>{t("settings.email")}</div>',
  "set: email"
);
repS(
  '>Tier</div>',
  '>{t("settings.tier")}</div>',
  "set: tier"
);
repS(
  '<h2 className="font-semibold">Two-factor authentication</h2>',
  '<h2 className="font-semibold">{t("settings.2faTitle")}</h2>',
  "set: 2fa title"
);
repS(
  '<span className="pill pill-green ml-auto">ENABLED</span>',
  '<span className="pill pill-green ml-auto">{t("settings.2faStatus")}</span>',
  "set: 2fa status"
);
repS(
  '<div className="text-sm" style={{ color: "var(--muted)" }}>Checking status</div>',
  '<div className="text-sm" style={{ color: "var(--muted)" }}>{t("settings.checking")}</div>',
  "set: checking"
);
repS(
  "Your account is protected with an authenticator app. You'll be asked for a 6-digit code when signing in.",
  '{t("settings.2faOnDesc")}',
  "set: 2fa on desc"
);
repS(
  'className="btn btn-ghost mt-4">Disable 2FA</button>',
  'className="btn btn-ghost mt-4">{t("settings.disable2fa")}</button>',
  "set: disable 2fa btn"
);
repS(
  "Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)",
  '{t("settings.scanQr")}',
  "set: scan qr desc"
);
repS(
  '<div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Or enter manually</div>',
  '<div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>{t("settings.enterManually")}</div>',
  "set: enter manually"
);
repS(
  '<div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Enter the 6-digit code from your app</div>',
  '<div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{t("settings.enterCode")}</div>',
  "set: enter code"
);
repS(
  '{loading ? "Verifying" : "Confirm and enable"}',
  '{loading ? t("settings.verifying") : t("settings.confirmEnable")}',
  "set: confirm enable btn"
);
repS(
  'className="w-full mt-2 btn btn-ghost text-xs">Cancel</button>',
  'className="w-full mt-2 btn btn-ghost text-xs">{t("settings.cancel")}</button>',
  "set: cancel btn"
);
repS(
  "Add an extra layer of security to your account. You'll need an authenticator app.",
  '{t("settings.2faOffDesc")}',
  "set: 2fa off desc"
);
repS(
  '{loading ? "Preparing" : "Enable 2FA"}',
  '{loading ? t("settings.preparing") : t("settings.enable2fa")}',
  "set: enable 2fa btn"
);

if (sCRLF) s = s.replace(/\n/g, "\r\n");
fs.writeFileSync(setPath, s, "utf8");

/* =========================================================
   3. ADD KEYS TO ALL 8 DICTIONARIES
   ========================================================= */
console.log("\n--- dictionaries ---");
const T = {
  en: {
    "referrals.signIn": "Sign in to view referrals",
    "referrals.signInBtn": "Sign in",
    "referrals.backToDashboard": "Back to dashboard",
    "referrals.activating": "Activating your referral code",
    "referrals.activatingMsg": "If this persists, contact support.",
    "referrals.copiedToast": "Copied",
    "referrals.shareTitle": "Join ApexVault",
    "referrals.shareText": "Use my link to sign up for ApexVault",
    "referrals.linkCopied": "Link copied",
    "referrals.title": "Referrals",
    "referrals.subtitle": "Invite friends and earn rewards when they join and trade.",
    "referrals.stats.friends": "Referred friends",
    "referrals.stats.earned": "Total earned",
    "referrals.stats.code": "Your code",
    "referrals.linkTitle": "Your referral link",
    "referrals.linkDesc": "Share this link. When someone signs up using it, they'll be linked to your account.",
    "referrals.copy": "Copy",
    "referrals.copied": "Copied",
    "referrals.share": "Share",
    "referrals.listTitle": "Your referrals",
    "referrals.noReferrals": "No referrals yet",
    "referrals.noReferralsDesc": "Share your link to start earning.",
    "referrals.colName": "Name",
    "referrals.colEmail": "Email",
    "referrals.colJoined": "Joined",
    "referrals.colBonus": "Bonus",
    
    "settings.error": "Error",
    "settings.2faEnabled": "2FA enabled",
    "settings.invalidCode": "Invalid code",
    "settings.confirmDisable": "Disable 2FA? Your account will be less secure.",
    "settings.2faDisabled": "2FA disabled",
    "settings.signIn": "Sign in to view settings",
    "settings.signInBtn": "Sign in",
    "settings.backToDashboard": "Back to dashboard",
    "settings.title": "Account settings",
    "settings.profile": "Profile",
    "settings.name": "Name",
    "settings.email": "Email",
    "settings.tier": "Tier",
    "settings.2faTitle": "Two-factor authentication",
    "settings.2faStatus": "ENABLED",
    "settings.checking": "Checking status",
    "settings.2faOnDesc": "Your account is protected with an authenticator app. You'll be asked for a 6-digit code when signing in.",
    "settings.disable2fa": "Disable 2FA",
    "settings.scanQr": "Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)",
    "settings.enterManually": "Or enter manually",
    "settings.enterCode": "Enter the 6-digit code from your app",
    "settings.verifying": "Verifying",
    "settings.confirmEnable": "Confirm and enable",
    "settings.cancel": "Cancel",
    "settings.2faOffDesc": "Add an extra layer of security to your account. You'll need an authenticator app.",
    "settings.preparing": "Preparing",
    "settings.enable2fa": "Enable 2FA"
  },
  es: {
    "referrals.signIn": "Inicia sesión para ver referidos",
    "referrals.signInBtn": "Iniciar sesión",
    "referrals.backToDashboard": "Volver al panel",
    "referrals.activating": "Activando tu código de referido",
    "referrals.activatingMsg": "Si esto persiste, contacta a soporte.",
    "referrals.copiedToast": "Copiado",
    "referrals.shareTitle": "Únete a ApexVault",
    "referrals.shareText": "Usa mi enlace para registrarte en ApexVault",
    "referrals.linkCopied": "Enlace copiado",
    "referrals.title": "Referidos",
    "referrals.subtitle": "Invita a amigos y gana recompensas cuando se unan y operen.",
    "referrals.stats.friends": "Amigos referidos",
    "referrals.stats.earned": "Total ganado",
    "referrals.stats.code": "Tu código",
    "referrals.linkTitle": "Tu enlace de referido",
    "referrals.linkDesc": "Comparte este enlace. Cuando alguien se registre con él, quedará vinculado a tu cuenta.",
    "referrals.copy": "Copiar",
    "referrals.copied": "Copiado",
    "referrals.share": "Compartir",
    "referrals.listTitle": "Tus referidos",
    "referrals.noReferrals": "Aún no hay referidos",
    "referrals.noReferralsDesc": "Comparte tu enlace para empezar a ganar.",
    "referrals.colName": "Nombre",
    "referrals.colEmail": "Correo",
    "referrals.colJoined": "Se unió",
    "referrals.colBonus": "Bono",
    
    "settings.error": "Error",
    "settings.2faEnabled": "2FA habilitado",
    "settings.invalidCode": "Código inválido",
    "settings.confirmDisable": "¿Desactivar 2FA? Tu cuenta será menos segura.",
    "settings.2faDisabled": "2FA desactivado",
    "settings.signIn": "Inicia sesión para ver ajustes",
    "settings.signInBtn": "Iniciar sesión",
    "settings.backToDashboard": "Volver al panel",
    "settings.title": "Ajustes de cuenta",
    "settings.profile": "Perfil",
    "settings.name": "Nombre",
    "settings.email": "Correo",
    "settings.tier": "Nivel",
    "settings.2faTitle": "Autenticación de dos factores",
    "settings.2faStatus": "HABILITADO",
    "settings.checking": "Comprobando estado",
    "settings.2faOnDesc": "Tu cuenta está protegida con una app de autenticación. Se te pedirá un código de 6 dígitos al iniciar sesión.",
    "settings.disable2fa": "Desactivar 2FA",
    "settings.scanQr": "Escanea este código QR con tu app de autenticación (Google Authenticator, Authy, 1Password, etc.)",
    "settings.enterManually": "O ingresa manualmente",
    "settings.enterCode": "Ingresa el código de 6 dígitos de tu app",
    "settings.verifying": "Verificando",
    "settings.confirmEnable": "Confirmar y habilitar",
    "settings.cancel": "Cancelar",
    "settings.2faOffDesc": "Añade una capa extra de seguridad. Necesitarás una app de autenticación.",
    "settings.preparing": "Preparando",
    "settings.enable2fa": "Habilitar 2FA"
  },
  fr: {
    "referrals.signIn": "Connectez-vous pour voir les parrainages",
    "referrals.signInBtn": "Se connecter",
    "referrals.backToDashboard": "Retour au tableau de bord",
    "referrals.activating": "Activation de votre code de parrainage",
    "referrals.activatingMsg": "Si cela persiste, contactez le support.",
    "referrals.copiedToast": "Copié",
    "referrals.shareTitle": "Rejoignez ApexVault",
    "referrals.shareText": "Utilisez mon lien pour vous inscrire sur ApexVault",
    "referrals.linkCopied": "Lien copié",
    "referrals.title": "Parrainages",
    "referrals.subtitle": "Invitez des amis et gagnez des récompenses.",
    "referrals.stats.friends": "Amis parrainés",
    "referrals.stats.earned": "Total gagné",
    "referrals.stats.code": "Votre code",
    "referrals.linkTitle": "Votre lien de parrainage",
    "referrals.linkDesc": "Partagez ce lien. Quand quelqu'un s'inscrit avec, il sera lié à votre compte.",
    "referrals.copy": "Copier",
    "referrals.copied": "Copié",
    "referrals.share": "Partager",
    "referrals.listTitle": "Vos filleuls",
    "referrals.noReferrals": "Aucun parrainage pour le moment",
    "referrals.noReferralsDesc": "Partagez votre lien pour commencer à gagner.",
    "referrals.colName": "Nom",
    "referrals.colEmail": "E-mail",
    "referrals.colJoined": "Inscrit le",
    "referrals.colBonus": "Bonus",
    
    "settings.error": "Erreur",
    "settings.2faEnabled": "2FA activée",
    "settings.invalidCode": "Code invalide",
    "settings.confirmDisable": "Désactiver la 2FA ? Votre compte sera moins sécurisé.",
    "settings.2faDisabled": "2FA désactivée",
    "settings.signIn": "Connectez-vous pour voir les paramètres",
    "settings.signInBtn": "Se connecter",
    "settings.backToDashboard": "Retour au tableau de bord",
    "settings.title": "Paramètres du compte",
    "settings.profile": "Profil",
    "settings.name": "Nom",
    "settings.email": "E-mail",
    "settings.tier": "Niveau",
    "settings.2faTitle": "Authentification à deux facteurs",
    "settings.2faStatus": "ACTIVÉE",
    "settings.checking": "Vérification du statut",
    "settings.2faOnDesc": "Votre compte est protégé. Un code à 6 chiffres vous sera demandé à la connexion.",
    "settings.disable2fa": "Désactiver la 2FA",
    "settings.scanQr": "Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, 1Password, etc.)",
    "settings.enterManually": "Ou saisir manuellement",
    "settings.enterCode": "Entrez le code à 6 chiffres de votre application",
    "settings.verifying": "Vérification",
    "settings.confirmEnable": "Confirmer et activer",
    "settings.cancel": "Annuler",
    "settings.2faOffDesc": "Ajoutez une couche de sécurité. Vous aurez besoin d'une application d'authentification.",
    "settings.preparing": "Préparation",
    "settings.enable2fa": "Activer la 2FA"
  },
  de: {
    "referrals.signIn": "Anmelden, um Empfehlungen zu sehen",
    "referrals.signInBtn": "Anmelden",
    "referrals.backToDashboard": "Zurück zum Dashboard",
    "referrals.activating": "Empfehlungscode wird aktiviert",
    "referrals.activatingMsg": "Wenn dies anhält, kontaktieren Sie den Support.",
    "referrals.copiedToast": "Kopiert",
    "referrals.shareTitle": "ApexVault beitreten",
    "referrals.shareText": "Nutzen Sie meinen Link für ApexVault",
    "referrals.linkCopied": "Link kopiert",
    "referrals.title": "Empfehlungen",
    "referrals.subtitle": "Laden Sie Freunde ein und verdienen Sie Prämien.",
    "referrals.stats.friends": "Empfohlene Freunde",
    "referrals.stats.earned": "Insgesamt verdient",
    "referrals.stats.code": "Ihr Code",
    "referrals.linkTitle": "Ihr Empfehlungslink",
    "referrals.linkDesc": "Teilen Sie diesen Link. Wenn sich jemand anmeldet, wird er mit Ihrem Konto verknüpft.",
    "referrals.copy": "Kopieren",
    "referrals.copied": "Kopiert",
    "referrals.share": "Teilen",
    "referrals.listTitle": "Ihre Empfehlungen",
    "referrals.noReferrals": "Noch keine Empfehlungen",
    "referrals.noReferralsDesc": "Teilen Sie Ihren Link, um zu verdienen.",
    "referrals.colName": "Name",
    "referrals.colEmail": "E-Mail",
    "referrals.colJoined": "Beigetreten",
    "referrals.colBonus": "Bonus",
    
    "settings.error": "Fehler",
    "settings.2faEnabled": "2FA aktiviert",
    "settings.invalidCode": "Ungültiger Code",
    "settings.confirmDisable": "2FA deaktivieren? Ihr Konto wird weniger sicher sein.",
    "settings.2faDisabled": "2FA deaktiviert",
    "settings.signIn": "Anmelden, um Einstellungen zu sehen",
    "settings.signInBtn": "Anmelden",
    "settings.backToDashboard": "Zurück zum Dashboard",
    "settings.title": "Kontoeinstellungen",
    "settings.profile": "Profil",
    "settings.name": "Name",
    "settings.email": "E-Mail",
    "settings.tier": "Stufe",
    "settings.2faTitle": "Zwei-Faktor-Authentifizierung",
    "settings.2faStatus": "AKTIVIERT",
    "settings.checking": "Status wird geprüft",
    "settings.2faOnDesc": "Ihr Konto ist geschützt. Bei der Anmeldung wird ein 6-stelliger Code benötigt.",
    "settings.disable2fa": "2FA deaktivieren",
    "settings.scanQr": "Scannen Sie diesen QR-Code mit Ihrer Authentifizierungs-App",
    "settings.enterManually": "Oder manuell eingeben",
    "settings.enterCode": "Geben Sie den 6-stelligen Code aus Ihrer App ein",
    "settings.verifying": "Überprüfen",
    "settings.confirmEnable": "Bestätigen und aktivieren",
    "settings.cancel": "Abbrechen",
    "settings.2faOffDesc": "Fügen Sie eine zusätzliche Sicherheitsebene hinzu.",
    "settings.preparing": "Vorbereiten",
    "settings.enable2fa": "2FA aktivieren"
  },
  "pt-BR": {
    "referrals.signIn": "Entre para ver indicações",
    "referrals.signInBtn": "Entrar",
    "referrals.backToDashboard": "Voltar ao painel",
    "referrals.activating": "Ativando seu código de indicação",
    "referrals.activatingMsg": "Se isso persistir, contate o suporte.",
    "referrals.copiedToast": "Copiado",
    "referrals.shareTitle": "Junte-se à ApexVault",
    "referrals.shareText": "Use meu link para se cadastrar na ApexVault",
    "referrals.linkCopied": "Link copiado",
    "referrals.title": "Indicações",
    "referrals.subtitle": "Convide amigos e ganhe recompensas.",
    "referrals.stats.friends": "Amigos indicados",
    "referrals.stats.earned": "Total ganho",
    "referrals.stats.code": "Seu código",
    "referrals.linkTitle": "Seu link de indicação",
    "referrals.linkDesc": "Compartilhe este link. Quando alguém se cadastrar, ficará vinculado à sua conta.",
    "referrals.copy": "Copiar",
    "referrals.copied": "Copiado",
    "referrals.share": "Compartilhar",
    "referrals.listTitle": "Suas indicações",
    "referrals.noReferrals": "Nenhuma indicação ainda",
    "referrals.noReferralsDesc": "Compartilhe seu link para começar a ganhar.",
    "referrals.colName": "Nome",
    "referrals.colEmail": "E-mail",
    "referrals.colJoined": "Entrou em",
    "referrals.colBonus": "Bônus",
    
    "settings.error": "Erro",
    "settings.2faEnabled": "2FA ativado",
    "settings.invalidCode": "Código inválido",
    "settings.confirmDisable": "Desativar 2FA? Sua conta ficará menos segura.",
    "settings.2faDisabled": "2FA desativado",
    "settings.signIn": "Entre para ver configurações",
    "settings.signInBtn": "Entrar",
    "settings.backToDashboard": "Voltar ao painel",
    "settings.title": "Configurações da conta",
    "settings.profile": "Perfil",
    "settings.name": "Nome",
    "settings.email": "E-mail",
    "settings.tier": "Nível",
    "settings.2faTitle": "Autenticação de dois fatores",
    "settings.2faStatus": "ATIVADO",
    "settings.checking": "Verificando status",
    "settings.2faOnDesc": "Sua conta está protegida. Um código de 6 dígitos será solicitado no login.",
    "settings.disable2fa": "Desativar 2FA",
    "settings.scanQr": "Escaneie este QR code com seu app autenticador",
    "settings.enterManually": "Ou insira manualmente",
    "settings.enterCode": "Digite o código de 6 dígitos do seu app",
    "settings.verifying": "Verificando",
    "settings.confirmEnable": "Confirmar e ativar",
    "settings.cancel": "Cancelar",
    "settings.2faOffDesc": "Adicione uma camada extra de segurança.",
    "settings.preparing": "Preparando",
    "settings.enable2fa": "Ativar 2FA"
  },
  zh: {
    "referrals.signIn": "\u767b\u5f55\u4ee5\u67e5\u770b\u63a8\u8350",
    "referrals.signInBtn": "\u767b\u5f55",
    "referrals.backToDashboard": "\u8fd4\u56de\u4eea\u8868\u677f",
    "referrals.activating": "\u6b63\u5728\u6fc0\u6d3b\u60a8\u7684\u63a8\u8350\u7801",
    "referrals.activatingMsg": "\u5982\u679c\u6301\u7eed\u51fa\u73b0\u6b64\u60c5\u51b5\uff0c\u8bf7\u8054\u7cfb\u5ba2\u670d\u3002",
    "referrals.copiedToast": "\u5df2\u590d\u5236",
    "referrals.shareTitle": "\u52a0\u5165 ApexVault",
    "referrals.shareText": "\u4f7f\u7528\u6211\u7684\u94fe\u63a5\u6ce8\u518c ApexVault",
    "referrals.linkCopied": "\u94fe\u63a5\u5df2\u590d\u5236",
    "referrals.title": "\u63a8\u8350",
    "referrals.subtitle": "\u9080\u8bf7\u597d\u53cb\uff0c\u5728\u4ed6\u4eec\u52a0\u5165\u5e76\u4ea4\u6613\u65f6\u8d5a\u53d6\u5956\u52b1\u3002",
    "referrals.stats.friends": "\u63a8\u8350\u7684\u597d\u53cb",
    "referrals.stats.earned": "\u603b\u6536\u76ca",
    "referrals.stats.code": "\u60a8\u7684\u4ee3\u7801",
    "referrals.linkTitle": "\u60a8\u7684\u63a8\u8350\u94fe\u63a5",
    "referrals.linkDesc": "\u5206\u4eab\u6b64\u94fe\u63a5\u3002\u5f53\u6709\u4eba\u4f7f\u7528\u5b83\u6ce8\u518c\u65f6\uff0c\u4ed6\u4eec\u5c06\u4e0e\u60a8\u7684\u8d26\u6237\u7ed1\u5b9a\u3002",
    "referrals.copy": "\u590d\u5236",
    "referrals.copied": "\u5df2\u590d\u5236",
    "referrals.share": "\u5206\u4eab",
    "referrals.listTitle": "\u60a8\u7684\u63a8\u8350",
    "referrals.noReferrals": "\u6682\u65e0\u63a8\u8350",
    "referrals.noReferralsDesc": "\u5206\u4eab\u60a8\u7684\u94fe\u63a5\u4ee5\u5f00\u59cb\u8d5a\u53d6\u3002",
    "referrals.colName": "\u59d3\u540d",
    "referrals.colEmail": "\u90ae\u7bb1",
    "referrals.colJoined": "\u52a0\u5165\u65f6\u95f4",
    "referrals.colBonus": "\u5956\u52b1",
    
    "settings.error": "\u9519\u8bef",
    "settings.2faEnabled": "2FA \u5df2\u542f\u7528",
    "settings.invalidCode": "\u9a8c\u8bc1\u7801\u65e0\u6548",
    "settings.confirmDisable": "\u7981\u7528 2FA\uff1f\u60a8\u7684\u8d26\u6237\u5c06\u4e0d\u518d\u5b89\u5168\u3002",
    "settings.2faDisabled": "2FA \u5df2\u7981\u7528",
    "settings.signIn": "\u767b\u5f55\u4ee5\u67e5\u770b\u8bbe\u7f6e",
    "settings.signInBtn": "\u767b\u5f55",
    "settings.backToDashboard": "\u8fd4\u56de\u4eea\u8868\u677f",
    "settings.title": "\u8d26\u6237\u8bbe\u7f6e",
    "settings.profile": "\u4e2a\u4eba\u8d44\u6599",
    "settings.name": "\u59d3\u540d",
    "settings.email": "\u90ae\u7bb1",
    "settings.tier": "\u7b49\u7ea7",
    "settings.2faTitle": "\u4e24\u6b65\u9a8c\u8bc1",
    "settings.2faStatus": "\u5df2\u542f\u7528",
    "settings.checking": "\u68c0\u67e5\u72b6\u6001\u4e2d",
    "settings.2faOnDesc": "\u60a8\u7684\u8d26\u6237\u53d7\u5230\u9a8c\u8bc1\u5668\u5e94\u7528\u4fdd\u62a4\u3002\u767b\u5f55\u65f6\u5c06\u8981\u6c42\u8f93\u5165 6 \u4f4d\u9a8c\u8bc1\u7801\u3002",
    "settings.disable2fa": "\u7981\u7528 2FA",
    "settings.scanQr": "\u4f7f\u7528\u60a8\u7684\u9a8c\u8bc1\u5668\u5e94\u7528\u626b\u63cf\u6b64\u4e8c\u7ef4\u7801\uff08Google Authenticator\u3001Authy \u7b49\uff09",
    "settings.enterManually": "\u6216\u624b\u52a8\u8f93\u5165",
    "settings.enterCode": "\u8f93\u5165\u5e94\u7528\u4e2d\u7684 6 \u4f4d\u9a8c\u8bc1\u7801",
    "settings.verifying": "\u9a8c\u8bc1\u4e2d",
    "settings.confirmEnable": "\u786e\u8ba4\u5e76\u542f\u7528",
    "settings.cancel": "\u53d6\u6d88",
    "settings.2faOffDesc": "\u4e3a\u60a8\u7684\u8d26\u6237\u6dfb\u52a0\u989d\u5916\u7684\u5b89\u5168\u9632\u62a4\u3002\u60a8\u9700\u8981\u4e00\u4e2a\u9a8c\u8bc1\u5668\u5e94\u7528\u3002",
    "settings.preparing": "\u51c6\u5907\u4e2d",
    "settings.enable2fa": "\u542f\u7528 2FA"
  },
  ar: {
    "referrals.signIn": "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0639\u0631\u0636 \u0627\u0644\u0625\u062d\u0627\u0644\u0627\u062a",
    "referrals.signInBtn": "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    "referrals.backToDashboard": "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645",
    "referrals.activating": "\u062c\u0627\u0631\u064d \u062a\u0641\u0639\u064a\u0644 \u0631\u0645\u0632 \u0627\u0644\u0625\u062d\u0627\u0644\u0629",
    "referrals.activatingMsg": "\u0625\u0630\u0627 \u0627\u0633\u062a\u0645\u0631 \u0630\u0644\u0643\u060c \u0641\u0627\u062a\u0635\u0644 \u0628\u0627\u0644\u062f\u0639\u0645.",
    "referrals.copiedToast": "\u062a\u0645 \u0627\u0644\u0646\u0633\u062e",
    "referrals.shareTitle": "\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 ApexVault",
    "referrals.shareText": "\u0627\u0633\u062a\u062e\u062f\u0645 \u0631\u0627\u0628\u0637\u064a \u0644\u0644\u062a\u0633\u062c\u064a\u0644 \u0641\u064a ApexVault",
    "referrals.linkCopied": "\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637",
    "referrals.title": "\u0627\u0644\u0625\u062d\u0627\u0644\u0627\u062a",
    "referrals.subtitle": "\u0627\u062f\u0639\u064f \u0623\u0635\u062f\u0642\u0627\u0621\u0643 \u0648\u0627\u0643\u0633\u0628 \u0645\u0643\u0627\u0641\u0622\u062a \u0639\u0646\u062f\u0645\u0627 \u064a\u0646\u0636\u0645\u0648\u0646 \u0648\u064a\u062a\u062f\u0627\u0648\u0644\u0648\u0646.",
    "referrals.stats.friends": "\u0627\u0644\u0623\u0635\u062f\u0642\u0627\u0621 \u0627\u0644\u0645\u062d\u0627\u0644\u0648\u0646",
    "referrals.stats.earned": "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0623\u0631\u0628\u0627\u062d",
    "referrals.stats.code": "\u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u062e\u0627\u0635 \u0628\u0643",
    "referrals.linkTitle": "\u0631\u0627\u0628\u0637 \u0627\u0644\u0625\u062d\u0627\u0644\u0629",
    "referrals.linkDesc": "\u0634\u0627\u0631\u0643 \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637. \u0639\u0646\u062f\u0645\u0627 \u064a\u0633\u062c\u0651\u0644 \u0634\u062e\u0635\u064c \u0645\u0627 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647\u060c \u0633\u064a\u062a\u0645 \u0631\u0628\u0637\u0647 \u0628\u062d\u0633\u0627\u0628\u0643.",
    "referrals.copy": "\u0646\u0633\u062e",
    "referrals.copied": "\u062a\u0645 \u0627\u0644\u0646\u0633\u062e",
    "referrals.share": "\u0645\u0634\u0627\u0631\u0643\u0629",
    "referrals.listTitle": "\u0625\u062d\u0627\u0644\u0627\u062a\u0643",
    "referrals.noReferrals": "\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u062d\u0627\u0644\u0627\u062a \u0628\u0639\u062f",
    "referrals.noReferralsDesc": "\u0634\u0627\u0631\u0643 \u0631\u0627\u0628\u0637\u0643 \u0644\u0644\u0628\u062f\u0621 \u0641\u064a \u0627\u0644\u0643\u0633\u0628.",
    "referrals.colName": "\u0627\u0644\u0627\u0633\u0645",
    "referrals.colEmail": "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    "referrals.colJoined": "\u0627\u0646\u0636\u0645 \u0641\u064a",
    "referrals.colBonus": "\u0645\u0643\u0627\u0641\u0623\u0629",
    
    "settings.error": "\u062e\u0637\u0623",
    "settings.2faEnabled": "\u062a\u0645 \u062a\u0641\u0639\u064a\u0644 2FA",
    "settings.invalidCode": "\u0631\u0645\u0632 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d",
    "settings.confirmDisable": "\u062a\u0639\u0637\u064a\u0644 2FA\u061f \u0633\u064a\u0643\u0648\u0646 \u062d\u0633\u0627\u0628\u0643 \u0623\u0642\u0644 \u0623\u0645\u0627\u0646\u064b\u0627.",
    "settings.2faDisabled": "\u062a\u0645 \u062a\u0639\u0637\u064a\u0644 2FA",
    "settings.signIn": "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0639\u0631\u0636 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
    "settings.signInBtn": "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    "settings.backToDashboard": "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645",
    "settings.title": "\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0628",
    "settings.profile": "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a",
    "settings.name": "\u0627\u0644\u0627\u0633\u0645",
    "settings.email": "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    "settings.tier": "\u0627\u0644\u0645\u0633\u062a\u0648\u0649",
    "settings.2faTitle": "\u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629 \u0628\u0639\u0627\u0645\u0644\u064a\u0646 \u0627\u062b\u0646\u064a\u0646",
    "settings.2faStatus": "\u0645\u0641\u0639\u0651\u0644",
    "settings.checking": "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u062d\u0627\u0644\u0629",
    "settings.2faOnDesc": "\u062d\u0633\u0627\u0628\u0643 \u0645\u062d\u0645\u064a \u0628\u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629. \u0633\u064a\u064f\u0637\u0644\u0628 \u0645\u0646\u0643 \u0631\u0645\u0632 \u0645\u0643\u0648\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645 \u0639\u0646\u062f \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644.",
    "settings.disable2fa": "\u062a\u0639\u0637\u064a\u0644 2FA",
    "settings.scanQr": "\u0627\u0645\u0633\u062d \u0631\u0645\u0632 \u0627\u0644\u0627\u0633\u062a\u062c\u0627\u0628\u0629 \u0627\u0644\u0633\u0631\u064a\u0639 \u0628\u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629",
    "settings.enterManually": "\u0623\u0648 \u0623\u062f\u062e\u0644 \u064a\u062f\u0648\u064a\u064b\u0627",
    "settings.enterCode": "\u0623\u062f\u062e\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0643\u0648\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645",
    "settings.verifying": "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642",
    "settings.confirmEnable": "\u062a\u0623\u0643\u064a\u062f \u0648\u062a\u0641\u0639\u064a\u0644",
    "settings.cancel": "\u0625\u0644\u063a\u0627\u0621",
    "settings.2faOffDesc": "\u0623\u0636\u0641 \u0637\u0628\u0642\u0629 \u0623\u0645\u0627\u0646 \u0625\u0636\u0627\u0641\u064a\u0629. \u0633\u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u062a\u0637\u0628\u064a\u0642 \u0645\u0635\u0627\u062f\u0642\u0629.",
    "settings.preparing": "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0636\u064a\u0631",
    "settings.enable2fa": "\u062a\u0641\u0639\u064a\u0644 2FA"
  },
  hi: {
    "referrals.signIn": "\u0930\u0947\u092b\u093c\u0930\u0932 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u093e\u0907\u0928 \u0907\u0928 \u0915\u0930\u0947\u0902",
    "referrals.signInBtn": "\u0938\u093e\u0907\u0928 \u0907\u0928 \u0915\u0930\u0947\u0902",
    "referrals.backToDashboard": "\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921 \u092a\u0930 \u0935\u093e\u092a\u0938",
    "referrals.activating": "\u0906\u092a\u0915\u093e \u0930\u0947\u092b\u093c\u0930\u0932 \u0915\u094b\u0921 \u0938\u0915\u094d\u0930\u093f\u092f \u0939\u094b \u0930\u0939\u093e \u0939\u0948",
    "referrals.activatingMsg": "\u092f\u0926\u093f \u092f\u0939 \u091c\u093e\u0930\u0940 \u0930\u0939\u0924\u093e \u0939\u0948, \u0924\u094b \u0938\u092e\u0930\u094d\u0925\u0928 \u0938\u0947 \u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u0947\u0902\u0964",
    "referrals.copiedToast": "\u0915\u0949\u092a\u0940 \u0939\u094b \u0917\u092f\u093e",
    "referrals.shareTitle": "ApexVault \u0938\u0947 \u091c\u0941\u0921\u093c\u0947\u0902",
    "referrals.shareText": "ApexVault \u092a\u0930 \u0938\u093e\u0907\u0928 \u0905\u092a \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u092e\u0947\u0930\u093e \u0932\u093f\u0902\u0915 \u0907\u0938\u094d\u0924\u0947\u092e\u093e\u0932 \u0915\u0930\u0947\u0902",
    "referrals.linkCopied": "\u0932\u093f\u0902\u0915 \u0915\u0949\u092a\u0940 \u0939\u094b \u0917\u092f\u093e",
    "referrals.title": "\u0930\u0947\u092b\u093c\u0930\u0932",
    "referrals.subtitle": "\u0926\u094b\u0938\u094d\u0924\u094b\u0902 \u0915\u094b \u0906\u092e\u0902\u0924\u094d\u0930\u093f\u0924 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0907\u0928\u093e\u092e \u0915\u092e\u093e\u090f\u0902\u0964",
    "referrals.stats.friends": "\u0930\u0947\u092b\u093c\u0930 \u0915\u093f\u090f \u0917\u090f \u092e\u093f\u0924\u094d\u0930",
    "referrals.stats.earned": "\u0915\u0941\u0932 \u0915\u092e\u093e\u0908",
    "referrals.stats.code": "\u0906\u092a\u0915\u093e \u0915\u094b\u0921",
    "referrals.linkTitle": "\u0906\u092a\u0915\u093e \u0930\u0947\u092b\u093c\u0930\u0932 \u0932\u093f\u0902\u0915",
    "referrals.linkDesc": "\u0907\u0938 \u0932\u093f\u0902\u0915 \u0915\u094b \u0938\u093e\u091d\u093e \u0915\u0930\u0947\u0902\u0964 \u091c\u092c \u0915\u094b\u0908 \u0907\u0938\u0915\u093e \u0909\u092a\u092f\u094b\u0917 \u0915\u0930\u0915\u0947 \u0938\u093e\u0907\u0928 \u0905\u092a \u0915\u0930\u0924\u093e \u0939\u0948, \u0924\u094b \u0935\u0939 \u0906\u092a\u0915\u0947 \u0916\u093e\u0924\u0947 \u0938\u0947 \u091c\u0941\u0921\u093c \u091c\u093e\u0924\u093e \u0939\u0948\u0964",
    "referrals.copy": "\u0915\u0949\u092a\u0940 \u0915\u0930\u0947\u0902",
    "referrals.copied": "\u0915\u0949\u092a\u0940 \u0939\u094b \u0917\u092f\u093e",
    "referrals.share": "\u0938\u093e\u091d\u093e \u0915\u0930\u0947\u0902",
    "referrals.listTitle": "\u0906\u092a\u0915\u0947 \u0930\u0947\u092b\u093c\u0930\u0932",
    "referrals.noReferrals": "\u0905\u092d\u0940 \u0924\u0915 \u0915\u094b\u0908 \u0930\u0947\u092b\u093c\u0930\u0932 \u0928\u0939\u0940\u0902",
    "referrals.noReferralsDesc": "\u0915\u092e\u093e\u0928\u093e \u0936\u0941\u0930\u0942 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0905\u092a\u0928\u093e \u0932\u093f\u0902\u0915 \u0938\u093e\u091d\u093e \u0915\u0930\u0947\u0902\u0964",
    "referrals.colName": "\u0928\u093e\u092e",
    "referrals.colEmail": "\u0908\u092e\u0947\u0932",
    "referrals.colJoined": "\u0936\u093e\u092e\u093f\u0932 \u0939\u0941\u090f",
    "referrals.colBonus": "\u092c\u094b\u0928\u0938",
    
    "settings.error": "\u0924\u094d\u0930\u0941\u091f\u093f",
    "settings.2faEnabled": "2FA \u0938\u0915\u094d\u0930\u093f\u092f",
    "settings.invalidCode": "\u0905\u092e\u093e\u0928\u094d\u092f \u0915\u094b\u0921",
    "settings.confirmDisable": "2FA \u0905\u0915\u094d\u0937\u092e \u0915\u0930\u0947\u0902? \u0906\u092a\u0915\u093e \u0916\u093e\u0924\u093e \u0915\u092e \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0939\u094b\u0917\u093e\u0964",
    "settings.2faDisabled": "2FA \u0905\u0915\u094d\u0937\u092e",
    "settings.signIn": "\u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u093e\u0907\u0928 \u0907\u0928 \u0915\u0930\u0947\u0902",
    "settings.signInBtn": "\u0938\u093e\u0907\u0928 \u0907\u0928 \u0915\u0930\u0947\u0902",
    "settings.backToDashboard": "\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921 \u092a\u0930 \u0935\u093e\u092a\u0938",
    "settings.title": "\u0916\u093e\u0924\u093e \u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938",
    "settings.profile": "\u092a\u094d\u0930\u094b\u092b\u093c\u093e\u0907\u0932",
    "settings.name": "\u0928\u093e\u092e",
    "settings.email": "\u0908\u092e\u0947\u0932",
    "settings.tier": "\u0938\u094d\u0924\u0930",
    "settings.2faTitle": "\u0926\u094b-\u0915\u093e\u0930\u0915 \u092a\u094d\u0930\u092e\u093e\u0923\u0940\u0915\u0930\u0923",
    "settings.2faStatus": "\u0938\u0915\u094d\u0930\u093f\u092f",
    "settings.checking": "\u0938\u094d\u0925\u093f\u0924\u093f \u091c\u093e\u0902\u091a\u0940 \u091c\u093e \u0930\u0939\u0940 \u0939\u0948",
    "settings.2faOnDesc": "\u0906\u092a\u0915\u093e \u0916\u093e\u0924\u093e \u092a\u094d\u0930\u092e\u093e\u0923\u0940\u0915\u0930\u0923 \u0910\u092a \u0938\u0947 \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0939\u0948\u0964 \u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u0924\u0947 \u0938\u092e\u092f 6 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u0915\u094b\u0921 \u092e\u093e\u0902\u0917\u093e \u091c\u093e\u090f\u0917\u093e\u0964",
    "settings.disable2fa": "2FA \u0905\u0915\u094d\u0937\u092e \u0915\u0930\u0947\u0902",
    "settings.scanQr": "\u0905\u092a\u0928\u0947 \u092a\u094d\u0930\u092e\u093e\u0923\u0940\u0915\u0930\u0923 \u0910\u092a \u0938\u0947 \u0907\u0938 QR \u0915\u094b\u0921 \u0915\u094b \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0947\u0902",
    "settings.enterManually": "\u092f\u093e \u092e\u0948\u0928\u094d\u092f\u0941\u0905\u0932 \u0930\u0942\u092a \u0938\u0947 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902",
    "settings.enterCode": "\u0905\u092a\u0928\u0947 \u0910\u092a \u0938\u0947 6 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u0915\u094b\u0921 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902",
    "settings.verifying": "\u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902",
    "settings.confirmEnable": "\u092a\u0941\u0937\u094d\u091f\u093f \u0915\u0930\u0947\u0902 \u0914\u0930 \u0938\u0915\u094d\u0937\u092e \u0915\u0930\u0947\u0902",
    "settings.cancel": "\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902",
    "settings.2faOffDesc": "\u0905\u092a\u0928\u0947 \u0916\u093e\u0924\u0947 \u092e\u0947\u0902 \u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u0938\u0941\u0930\u0915\u094d\u0937\u093e \u091c\u094b\u0921\u093c\u0947\u0902\u0964 \u0906\u092a\u0915\u094b \u090f\u0915 \u092a\u094d\u0930\u092e\u093e\u0923\u0940\u0915\u0930\u0923 \u0910\u092a \u0915\u0940 \u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e \u0939\u094b\u0917\u0940\u0964",
    "settings.preparing": "\u0924\u0948\u092f\u093e\u0930 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902",
    "settings.enable2fa": "2FA \u0938\u0915\u094d\u0937\u092e \u0915\u0930\u0947\u0902"
  }
};

for (const loc of Object.keys(T)) {
  const p = "lib/i18n/dictionaries/" + loc + ".ts";
  let d = fs.readFileSync(p, "utf8");
  const c2 = d.includes("\r\n");
  if (c2) d = d.replace(/\r\n/g, "\n");
  const keys = T[loc];
  const add = Object.entries(keys).filter(([k]) => !d.includes('"' + k + '"')).map(([k, v]) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(v) + ',').join("\n");
  if (!add) { console.log("  SKIP: " + loc); continue; }
  const idx = d.lastIndexOf("\n};\n");
  if (idx === -1) { console.log("  FAIL: " + loc); continue; }
  d = d.slice(0, idx) + "\n" + add + d.slice(idx);
  if (c2) d = d.replace(/\n/g, "\r\n");
  fs.writeFileSync(p, d, "utf8");
  console.log("  OK: " + loc + " +" + Object.keys(keys).length);
}

console.log("\nTotals: " + ok + " applied, " + fail + " failed");