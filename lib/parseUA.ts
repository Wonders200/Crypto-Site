export interface ParsedUA {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: "Desktop" | "Mobile" | "Tablet" | "Bot" | "Unknown";
  raw: string;
}

/**
 * Lightweight User-Agent parser.
 * Detects the most common browsers, operating systems, and device types.
 * Not exhaustive  just enough to give admins useful context.
 */
export function parseUA(ua: string): ParsedUA {
  const out: ParsedUA = {
    browser: "Unknown",
    browserVersion: "",
    os: "Unknown",
    osVersion: "",
    deviceType: "Unknown",
    raw: ua,
  };

  if (!ua) return out;

  // ---- Device type ----
  if (/bot|crawler|spider|slurp|bingpreview/i.test(ua)) out.deviceType = "Bot";
  else if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) out.deviceType = "Tablet";
  else if (/Mobile|iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua)) out.deviceType = "Mobile";
  else if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) out.deviceType = "Desktop";

  // ---- Browser (order matters  check most specific first) ----
  const rules: [RegExp, string][] = [
    [/EdgA?\/(\d+(?:\.\d+)?)/, "Edge"],
    [/OPR\/(\d+(?:\.\d+)?)/, "Opera"],
    [/Opera.*?Version\/(\d+(?:\.\d+)?)/, "Opera"],
    [/Vivaldi\/(\d+(?:\.\d+)?)/, "Vivaldi"],
    [/Brave\/(\d+(?:\.\d+)?)/, "Brave"],
    [/YaBrowser\/(\d+(?:\.\d+)?)/, "Yandex"],
    [/Firefox\/(\d+(?:\.\d+)?)/, "Firefox"],
    [/FxiOS\/(\d+(?:\.\d+)?)/, "Firefox"],
    [/CriOS\/(\d+(?:\.\d+)?)/, "Chrome"],
    [/Chrome\/(\d+(?:\.\d+)?)/, "Chrome"],
    [/Safari\/(\d+(?:\.\d+)?)/, "Safari"],
    [/MSIE\s(\d+(?:\.\d+)?)/, "Internet Explorer"],
    [/Trident.*rv:(\d+(?:\.\d+)?)/, "Internet Explorer"],
  ];
  for (const [re, name] of rules) {
    const m = ua.match(re);
    if (m) {
      out.browser = name;
      out.browserVersion = m[1] ?? "";
      break;
    }
  }

  // Safari version  Safari's UA string often contains "Version/x.y" instead
  if (out.browser === "Safari") {
    const v = ua.match(/Version\/(\d+(?:\.\d+)?)/);
    if (v) out.browserVersion = v[1];
  }

  // ---- Operating system ----
  if (/Windows NT 10\.0/.test(ua)) { out.os = "Windows"; out.osVersion = "10 / 11"; }
  else if (/Windows NT 6\.3/.test(ua)) { out.os = "Windows"; out.osVersion = "8.1"; }
  else if (/Windows NT 6\.2/.test(ua)) { out.os = "Windows"; out.osVersion = "8"; }
  else if (/Windows NT 6\.1/.test(ua)) { out.os = "Windows"; out.osVersion = "7"; }
  else if (/Windows NT/.test(ua)) { out.os = "Windows"; out.osVersion = ""; }
  else if (/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/.test(ua)) {
    out.os = "macOS";
    out.osVersion = ua.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/)![1].replace(/_/g, ".");
  }
  else if (/Android (\d+(?:\.\d+)?)/.test(ua)) { out.os = "Android"; out.osVersion = ua.match(/Android (\d+(?:\.\d+)?)/)![1]; }
  else if (/iPhone OS (\d+[._]\d+)/.test(ua)) { out.os = "iOS"; out.osVersion = ua.match(/iPhone OS (\d+[._]\d+)/)![1].replace(/_/g, "."); }
  else if (/iPad.*OS (\d+[._]\d+)/.test(ua)) { out.os = "iPadOS"; out.osVersion = ua.match(/iPad.*OS (\d+[._]\d+)/)![1].replace(/_/g, "."); }
  else if (/CrOS/.test(ua)) { out.os = "ChromeOS"; out.osVersion = ""; }
  else if (/Ubuntu/.test(ua)) { out.os = "Ubuntu"; out.osVersion = ""; }
  else if (/Linux/.test(ua)) { out.os = "Linux"; out.osVersion = ""; }

  return out;
}

/** Format as "Chrome 120  Windows 11" for display */
export function formatUA(ua: string): string {
  const p = parseUA(ua);
  const browser = p.browserVersion ? `${p.browser} ${p.browserVersion.split(".")[0]}` : p.browser;
  const os = p.osVersion ? `${p.os} ${p.osVersion}` : p.os;
  return `${browser}  ${os}`;
}

/** Short device label: "Chrome 120" */
export function shortDevice(ua: string): string {
  const p = parseUA(ua);
  if (p.browser === "Unknown") return "Unknown";
  const v = p.browserVersion ? p.browserVersion.split(".")[0] : "";
  return v ? `${p.browser} ${v}` : p.browser;
}