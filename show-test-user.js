const fs = require("fs");
const path = "/opt/apexvault-prod/data/store.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));
const s = data.store || data;
const uid = "u_9h3y41xo";

const user = (s.users || []).find(u => u.id === uid);
const txs = (s.transactions || []).filter(t => t.userId === uid);
const bal = (s.balances || []).filter(b => b.userId === uid);
const sess = (s.sessions || []).filter(x => x.userId === uid);
const kyc = (s.kycSubmissions || []).filter(k => k.userId === uid);
const orders = (s.orders || []).filter(o => o.userId === uid);
const holdings = (s.holdings || []).filter(h => h.userId === uid);
const earn = (s.earnPositions || []).filter(e => e.userId === uid);

console.log("=== WOULD DELETE ===");
console.log("  user:", user ? user.email : "(none)");
console.log("  transactions:", txs.length, txs.map(t => `${t.type} $${t.amount}`).join(", "));
console.log("  balances:", bal.length, JSON.stringify(bal));
console.log("  sessions:", sess.length);
console.log("  kycSubmissions:", kyc.length);
console.log("  orders:", orders.length);
console.log("  holdings:", holdings.length);
console.log("  earnPositions:", earn.length);
console.log();
console.log("If this looks right, run the dry-run flag removal next.");