import { Store, DEFAULT_STORE } from "./adminStore";

/**
 * Ensures every top-level key in the store exists and is the right type.
 * Never throws  always returns a usable Store object.
 */
export function sanitizeStore(input: any): Store {
  const base = DEFAULT_STORE;
  if (!input || typeof input !== "object") return { ...base };

  const arr = <T,>(v: any, fallback: T[]): T[] => (Array.isArray(v) ? v : fallback);

  return {
    coins:           arr(input.coins, base.coins),
    users:           arr(input.users, base.users),
    holdings:        arr(input.holdings, base.holdings),
    orders:          arr(input.orders, base.orders),
    news:            arr(input.news, base.news),
    learnTopics:     arr(input.learnTopics, base.learnTopics),
    earnProducts:    arr(input.earnProducts, base.earnProducts),
    pricingTiers:    arr(input.pricingTiers, base.pricingTiers),
    audit:           arr(input.audit, base.audit),
    balances:        arr(input.balances, base.balances),
    transactions:    arr(input.transactions, base.transactions),
    sessions:        arr(input.sessions, base.sessions),
    depositAddresses: arr(input.depositAddresses, base.depositAddresses),
    testimonials:    arr(input.testimonials, base.testimonials),
    kycSubmissions:  arr(input.kycSubmissions, base.kycSubmissions),
    earnPositions:   arr(input.earnPositions, base.earnPositions),
    newsMeta:        input.newsMeta && typeof input.newsMeta === "object" ? { ...base.newsMeta, ...input.newsMeta } : base.newsMeta,
    settings:        input.settings && typeof input.settings === "object"
      ? { ...base.settings, ...input.settings, depositRequirements: input.settings.depositRequirements ?? base.settings.depositRequirements, trustBar: Array.isArray(input.settings.trustBar) ? input.settings.trustBar : base.settings.trustBar }
      : base.settings,
    credentials:     input.credentials && typeof input.credentials === "object" ? input.credentials : base.credentials,
    demoUser:        input.demoUser && typeof input.demoUser === "object" ? input.demoUser : base.demoUser,
  };
}