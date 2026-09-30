"use client";

/**
 * Official brand marks for cryptocurrency assets.
 * Logos are official project trademarks, reproduced unaltered for identification.
 */

export interface CoinIconProps {
  symbol: string;
  size?: number;
  color?: string;
  className?: string;
}

function svgProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style: { display: "block" as const, flexShrink: 0 },
  };
}

export default function CoinIcon({ symbol, size = 32, color = "#5b7cfa", className }: CoinIconProps) {
  const s = symbol.toUpperCase();
  const p = svgProps(size, className);

  switch (s) {
    case "BTC":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#F7931A"/><path fill="#FFF" d="M22.5 14.2c.3-2-1.2-3.1-3.4-3.8l.7-2.8-1.7-.4-.7 2.7c-.4-.1-.9-.2-1.3-.3l.7-2.7-1.7-.4-.7 2.8c-.4-.1-.7-.2-1.1-.2l-2.3-.6-.5 1.8s1.3.3 1.2.3c.7.2.8.6.8 1l-.8 3.1c.1 0 .1 0 .2.1l-.2 0-1.1 4.4c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.8c.4.1.9.2 1.3.3l-.7 2.8 1.7.4.7-2.8c2.9.5 5 .3 5.9-2.3.7-2.1-.1-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.5zM18.9 19.6c-.5 2.1-4 1-5.2.7l.9-3.7c1.1.3 4.8.8 4.3 3zM19.4 14.2c-.5 1.9-3.4.9-4.4.7l.8-3.4c.9.2 4 .7 3.6 2.7z"/></svg>);

    case "ETH":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#627EEA"/><g fill="#FFF"><path fillOpacity=".6" d="M16.5 4v8.9l7.5 3.3z"/><path d="M16.5 4L9 16.2l7.5-3.3z"/><path fillOpacity=".6" d="M16.5 22v6l7.5-10.4z"/><path d="M16.5 28v-6L9 17.6z"/><path fillOpacity=".2" d="M16.5 20.6l7.5-4.4-7.5-3.3z"/><path fillOpacity=".6" d="M9 16.2l7.5 4.4v-7.7z"/></g></svg>);

    case "USDT":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#26A17B"/><path fill="#FFF" d="M17.9 17v0c-.1 0-.7 0-2 0-1 0-1.7 0-2 0v0c-3.9-.2-6.8-.9-6.8-1.7s2.9-1.5 6.8-1.7v2.7c.3 0 1 .1 2 .1 1.2 0 1.8-.1 1.9-.1v-2.7c3.9.2 6.8.9 6.8 1.7s-2.9 1.5-6.8 1.7m0-3.6v-2.4h5.4V7.4H8.6v3.7h5.4V13.5c-4.4.2-7.7 1.1-7.7 2.1s3.3 1.9 7.7 2.1v7.6h3.9v-7.6c4.4-.2 7.7-1.1 7.7-2.1s-3.3-1.9-7.7-2.1"/></svg>);

    case "USDC":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#2775CA"/><path fill="#FFF" d="M20.5 18.6c0-2.4-1.5-3.2-4.4-3.6-2.1-.3-2.5-.6-2.5-1.4s.7-1.3 1.8-1.3 1.8.4 2 1.3c.1.2.2.3.4.3h1c.2 0 .4-.2.4-.4v-.1c-.3-1.5-1.4-2.6-3-2.8v-.9c0-.2-.2-.4-.4-.4h-.9c-.2 0-.4.2-.4.4v.9c-2 .3-3.3 1.6-3.3 3.4 0 2.3 1.4 3.2 4.3 3.6 1.9.3 2.5.6 2.5 1.4 0 .9-.8 1.5-1.9 1.5-1.5 0-2-.6-2.3-1.5-.1-.2-.2-.4-.4-.4h-1c-.2 0-.4.2-.4.4v.1c.3 1.7 1.4 2.8 3.6 3v.9c0 .2.2.4.4.4h.9c.2 0 .4-.2.4-.4v-.9c2.1-.3 3.4-1.7 3.4-3.5z"/><path fill="#FFF" d="M13 25c-4.9-1.8-7.5-7.3-5.7-12.2 1-2.6 3-4.7 5.7-5.7.2-.1.3-.2.3-.4v-.7c0-.2-.2-.4-.4-.4h-.2c-5.9 1.9-9.2 8.2-7.3 14.1 1.1 3.6 3.9 6.3 7.5 7.5.2.1.4 0 .4-.2v-.7c0-.2-.1-.4-.3-.4zM19.1 4.4c-.2-.1-.4 0-.4.2v.7c0 .2.1.4.3.4 4.9 1.8 7.5 7.3 5.7 12.2-1 2.6-3 4.7-5.7 5.7-.2.1-.3.2-.3.4v.7c0 .2.2.4.4.4h.2c5.9-1.9 9.2-8.2 7.3-14.1-1.1-3.6-3.9-6.3-7.5-7.5z"/></svg>);

    case "SOL":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><defs><linearGradient id="sol" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient></defs><g fill="url(#sol)"><path d="M9.5 20a.7.7 0 0 1 .5-.2h13.4c.3 0 .5.4.2.6l-2.6 2.6a.7.7 0 0 1-.5.2H7.1a.3.3 0 0 1-.2-.6z"/><path d="M9.5 9.2a.7.7 0 0 1 .5-.2h13.4c.3 0 .5.4.2.6l-2.6 2.6a.7.7 0 0 1-.5.2H7.1a.3.3 0 0 1-.2-.6z"/><path d="M20.9 14.6a.7.7 0 0 0-.5-.2H7a.3.3 0 0 0-.2.6l2.6 2.6c.1.1.3.2.5.2h13.4a.3.3 0 0 0 .2-.6z"/></g></svg>);

    case "BNB":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#F0B90B"/><path fill="#FFF" d="m12.1 16 3.9-3.9 3.9 3.9 2.3-2.3-6.2-6.2-6.2 6.2zm-3.9 0 2.3 2.3L12.7 16 10.5 13.7zM16.2 22.2l3.9-3.9-2.3-2.3-3.9 3.9-3.9-3.9L7.7 18.3l3.9 3.9 3.9-3.9zM18.4 16l-.7-.7-.7.7.7.7z"/></svg>);

    case "XRP":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#23292F"/><path fill="#FFF" d="M23.1 8h2.3l-5.5 5.4c-1 1-2.4 1.6-3.9 1.6s-2.9-.6-3.9-1.6L6.6 8h2.3l4.2 4.1c.8.8 1.9 1.2 3 1.2s2.2-.4 3-1.2zm-14.3 16H6.5l5.5-5.4c1-1 2.4-1.6 3.9-1.6s2.9.6 3.9 1.6l5.5 5.4h-2.3l-4.2-4.1c-.8-.8-1.9-1.2-3-1.2s-2.2.4-3 1.2z"/></svg>);

    case "ADA":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#0033AD"/><g fill="#FFF"><circle cx="16" cy="16" r="1.5"/><circle cx="16" cy="11" r="1"/><circle cx="16" cy="21" r="1"/><circle cx="11" cy="16" r="1"/><circle cx="21" cy="16" r="1"/><circle cx="12.5" cy="12.5" r="1"/><circle cx="19.5" cy="12.5" r="1"/><circle cx="12.5" cy="19.5" r="1"/><circle cx="19.5" cy="19.5" r="1"/><circle cx="16" cy="7" r=".9"/><circle cx="16" cy="25" r=".9"/><circle cx="7" cy="16" r=".9"/><circle cx="25" cy="16" r=".9"/></g></svg>);

    case "DOGE":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#C2A633"/><path fill="#FFF" d="M13.2 14.1h2.6v-1.5c0-.5.4-.9.9-.9h4.5v3h-3.6v1.5h3.1v2.9h-3.1v3.4c0 .5-.4.9-.9.9h-1.4c-.5 0-.9-.4-.9-.9v-3.4h-2.6v-2.9h2.6v-1.4h-1.2z"/></svg>);

    case "AVAX":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#E84142"/><path fill="#FFF" d="M16.7 7.5c-.4-.7-1.4-.7-1.8 0l-3 5.2c-.4.7.1 1.6.9 1.6h6c.8 0 1.3-.9.9-1.6zm5.6 9.6c-.4-.7-1.4-.7-1.8 0l-1.7 3c-.4.7.1 1.6.9 1.6h3.4c.8 0 1.3-.9.9-1.6zm-9.9 0c-.4-.7-1.4-.7-1.8 0l-1.7 3c-.4.7.1 1.6.9 1.6h3.4c.8 0 1.3-.9.9-1.6z"/></svg>);

    case "DOT":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#E6007A"/><g fill="#FFF"><ellipse cx="16" cy="8" rx="4.5" ry="2.2"/><ellipse cx="16" cy="24" rx="4.5" ry="2.2"/><ellipse cx="8" cy="16" rx="2.2" ry="4.5"/><ellipse cx="24" cy="16" rx="2.2" ry="4.5"/></g></svg>);

    case "LINK":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#2A5ADA"/><path fill="#FFF" d="M16 6.5 8.5 10.9v8.7L16 24l7.5-4.4v-8.7zm0 2.7 5.2 3v6l-5.2 3-5.2-3v-6z"/></svg>);

    case "MATIC":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#8247E5"/><path fill="#FFF" d="M21.7 13.2c-.4-.2-.9-.2-1.3 0l-2.9 1.7-2 1.1-2.9 1.7c-.4.2-.9.2-1.3 0l-2.3-1.4c-.4-.2-.7-.7-.7-1.2v-2.6c0-.5.2-.9.7-1.2l2.3-1.3c.4-.2.9-.2 1.3 0l2.3 1.4c.4.2.7.7.7 1.2v1.7l2-1.2v-1.7c0-.5-.2-.9-.7-1.2l-4.3-2.5c-.4-.2-.9-.2-1.3 0l-4.4 2.6c-.4.2-.7.7-.7 1.2v5.2c0 .5.2.9.7 1.2l4.4 2.5c.4.2.9.2 1.3 0l2.9-1.7 2-1.2 2.9-1.7c.4-.2.9-.2 1.3 0l2.3 1.3c.4.2.7.7.7 1.2v2.6c0 .5-.2.9-.7 1.2l-2.3 1.4c-.4.2-.9.2-1.3 0l-2.3-1.3c-.4-.2-.7-.7-.7-1.2V19l-2 1.2v1.7c0 .5.2.9.7 1.2l4.3 2.5c.4.2.9.2 1.3 0l4.4-2.5c.4-.2.7-.7.7-1.2v-5.3c0-.5-.2-.9-.7-1.2z"/></svg>);

    case "UNI":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#FF007A"/><path fill="#FFF" d="M16.6 6.4c-.5.1-1.5 1-1.5 1.5 0 .3.6.4.9.2.4-.3 1-.2 1.3.2.4.5.3 1.1-.2 1.5-.5.4-1.2.5-1.8.2l-.4-.2-1 .4c-1.9.9-3.3 2.9-3.5 5.1l-.1.9.9-.5c2.9-1.5 5.9-1.4 7.3.3.4.5.6 1 .6 1.6 0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5c0-.3.1-.6.2-.9l-.3-.1c-1.2 1.4-1.6 3-1 4.6.6 1.5 2 2.5 3.7 2.6 2 .1 3.8-1.4 4.1-3.3.3-1.9-.8-3.9-2.9-5.2l-.6-.4.2-.3c1.3-1.8 3.5-1.7 4.2-1.5.3.1.5-.1.4-.4-.1-.3-.6-.9-1.2-1.2-.9-.6-2.1-.7-3.2-.3l-.4.2-.6-.5c-.7-.6-1.6-1-2.5-.9z"/></svg>);

    case "LTC":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#A6A9AA"/><path fill="#FFF" d="M17.4 8.5v3.6l-2.5 8.8-2.4.9-.6 2.2h10.4l-.6 2.5H10.6l1.1-4 2.3-.9 2.7-9.4h-2.4l.5-1.9h2.3V8.5z"/></svg>);

    case "NEAR":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M22.4 8.6c-.6 0-1.1.3-1.5.8l-3.1 4.4-1.7-2.4c-.4-.5-.9-.8-1.5-.8s-1.1.3-1.5.8l-3.5 5v-4.2c0-.7-.5-1.2-1.2-1.2s-1.2.5-1.2 1.2v9.4c0 .7.5 1.2 1.2 1.2.4 0 .8-.2 1-.5l3.1-4.4 1.7 2.4c.4.5.9.8 1.5.8s1.1-.3 1.5-.8l3.5-5v4.2c0 .7.5 1.2 1.2 1.2s1.2-.5 1.2-1.2v-9.4c0-.7-.5-1.2-1.2-1.2z"/></svg>);

    case "APT":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><g fill="#FFF"><circle cx="16" cy="9" r="1.3"/><circle cx="12.2" cy="11" r="1.3"/><circle cx="19.8" cy="11" r="1.3"/><circle cx="9" cy="16" r="1.3"/><circle cx="23" cy="16" r="1.3"/><circle cx="12.2" cy="21" r="1.3"/><circle cx="19.8" cy="21" r="1.3"/><circle cx="16" cy="23" r="1.3"/></g></svg>);

    case "ARB":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#12AAFF"/><path fill="#FFF" d="m16 6.5-8 4.7v9.6l8 4.7 8-4.7v-9.6zm-1.5 14.8-1.5.9-3-1.8v-3.5l3-1.8 1.5.9zm6 0-1.5.9-1.5-.9v-3.5l1.5-.9 1.5.9z"/></svg>);

    case "OP":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#FF0420"/><path fill="#FFF" d="M11.9 21.7c-1.3 0-2.4-.3-3.2-.9-.8-.6-1.2-1.5-1.2-2.7 0-.3.1-.7.2-1.2.3-1.7.9-3.3 1.6-4.9.2-.4.5-.7 1-.8.9-.2 1.9-.3 2.9-.3s1.9.1 2.7.3c.9.2 1.6.6 2.1 1.2.5.6.7 1.3.7 2.1 0 .4-.1.9-.2 1.4-.3 1.6-.8 3.1-1.4 4.5-.2.4-.5.6-.9.8-1.1.3-2.2.5-3.3.5z"/></svg>);

    case "AAVE":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#B6509E"/><path fill="#2EBAC6" d="M16 6.5l8.4 14.6c.2.4 0 .9-.5.9H23c-.3 0-.6-.2-.8-.5L16 10l-1.7 3 2.3 4c.2.4 0 .9-.5.9h-1.3c-.3 0-.6-.2-.8-.5l-1.6-2.7-1.6 2.7c-.1.3-.4.5-.8.5h-1.3c-.5 0-.7-.5-.5-.9l2.3-4-1.7-3-4.4 7.6c-.2.3-.4.5-.8.5H7.6c-.5 0-.7-.5-.5-.9L15 6.5c.2-.4.8-.4 1 0z"/></svg>);

    case "PYUSD":
      return (<svg {...p}><rect width="32" height="32" rx="8" fill="#FFF"/><path fill="#003087" d="M9.5 7.4h6.1c3.2 0 5.2 1.8 4.7 4.9-.5 2.9-2.5 4.8-6 4.8h-3c-.4 0-.6.2-.7.7l-1.1 6.5c-.1.4-.3.5-.6.5h-2.7c-.3 0-.4-.2-.3-.5l2.9-16.4c.1-.4.3-.5.7-.5z"/><path fill="#009CDE" d="M13.4 11h6.1c3.2 0 5.2 1.8 4.7 4.9-.5 2.9-2.5 4.8-6 4.8h-3c-.4 0-.6.2-.7.7l-1.1 6.5c-.1.4-.3.5-.6.5h-2.7c-.3 0-.4-.2-.3-.5l2.9-16.4c.1-.4.3-.5.7-.5z" opacity=".95"/></svg>);

    case "TRX":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#FF060A"/><path fill="#FFF" d="M23.5 9 8 8.1c-.4 0-.6.3-.4.6l5.1 6.5c.2.2.4.3.6.3l10.5 1.4c.4 0 .6-.4.4-.7l-5.1-5.3c-.1-.2-.2-.2-.3-.2zm-1.4 1.6 3 3.1-7.1-.9zm-2.6 3.2-4.4 6-3.6-4.6z"/></svg>);

    case "TON":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#0098EA"/><path fill="#FFF" d="M22.5 9.5h-13c-.6 0-1 .5-1 1.1 0 .2.1.4.2.6l6.5 10.3c.4.6 1.1.6 1.5 0l6.5-10.3c.3-.5.1-1.2-.4-1.5-.1-.1-.2-.2-.3-.2zm-6.4 9.4-1.6-2.5V12h1.6zm-3.5-6.6v4.1l-1.6 2.5V12h1.6zm5.2 0h-3v2.9h3zm2.4 0h-1.6v2.9h1.6z"/></svg>);

    case "SHIB":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#FFA409"/><g fill="#FFF"><circle cx="13" cy="14" r="1.5"/><circle cx="19" cy="14" r="1.5"/><circle cx="13" cy="14" r=".6" fill="#FFA409"/><circle cx="19" cy="14" r=".6" fill="#FFA409"/><path d="M16 18c-1.5 0-2.7.7-3 1.7.6.9 1.7 1.5 3 1.5s2.4-.6 3-1.5c-.3-1-1.5-1.7-3-1.7z"/><ellipse cx="16" cy="20.5" rx=".7" ry=".5" fill="#FFA409"/></g></svg>);

    case "BCH":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#8DC351"/><path fill="#FFF" d="M22.3 14.1c.3-1.7-1-2.6-2.8-3.2l.6-2.3-1.4-.3-.6 2.2c-.4-.1-.7-.2-1.1-.3l.6-2.2-1.4-.4-.6 2.3c-.3-.1-.6-.1-.9-.2l-1.9-.5-.4 1.5s1 .2 1 .3c.6.1.7.5.6.8l-.6 2.6c0 0 .1 0 .2.1l-.2 0-.9 3.6c-.1.2-.2.5-.6.4 0 0-1-.2-1-.2l-.7 1.6 1.8.4c.3.1.7.1 1 .2l-.6 2.4 1.4.4.6-2.3c.4.1.7.2 1.1.3l-.6 2.3 1.4.3.6-2.3c2.4.4 4.1.3 4.9-1.9.6-1.7 0-2.8-1.3-3.5.9-.2 1.6-.8 1.8-2zm-3.2 4.5c-.4 1.7-3.4.8-4.3.5l.8-3.1c1 .2 4 .7 3.5 2.6zm.4-4.5c-.4 1.6-2.8.8-3.6.6l.7-2.8c.8.2 3.3.6 2.9 2.2z"/></svg>);

    case "ATOM":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#2E3148"/><g fill="#FFF"><ellipse cx="16" cy="16" rx="3" ry="10"/><ellipse cx="16" cy="16" rx="3" ry="10" transform="rotate(60 16 16)" opacity=".85"/><ellipse cx="16" cy="16" rx="3" ry="10" transform="rotate(120 16 16)" opacity=".7"/><circle cx="16" cy="16" r="2" fill="#2E3148"/></g></svg>);

    case "FIL":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#0090FF"/><path fill="#FFF" d="M21.4 12h-2.1l.6-2.5-.7-.2-.6 2.7h-2.1l.7-2.8-.7-.2-.7 3h-4c-.4 0-.7.2-.9.5l-.6.9h5.4l-.4 1.4h-5.7l-.4 1.5h5.6l-.7 2.8h-5.6l-.4 1.5h5.4l-.4 1.6.7.2 2-8.1h2.1l-1.9 7.9.7.2 1.9-8.1h2.1z"/></svg>);

    case "HBAR":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#222"/><path fill="#FFF" d="M20.5 8.5v6.4h-9V8.5H9v15h2.5v-6.4h9v6.4H23v-15z"/></svg>);

    case "VET":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#15BDFF"/><path fill="#FFF" d="M16 7 9 20h3l4-7.5L20 20h3z"/></svg>);

    case "ICP":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#29ABE2"/><path fill="#FFF" d="M23 12.5c-1.6 0-3.1 1-4 2.2l-1.5 2 .6.9c1 1.4 2.4 2.4 3.9 2.4 2.4 0 4-1.9 4-3.7s-1.2-3.8-3-3.8zm-14 7c1.6 0 3.1-1 4-2.2l1.5-2-.6-.9c-1-1.4-2.4-2.4-3.9-2.4-2.4 0-4 1.9-4 3.7s1.2 3.8 3 3.8z"/></svg>);

    case "XLM":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M23.2 14.6c.4-.1.6-.5.5-.9s-.5-.6-.9-.5l-3.9 1.3-6.4 2.1-2.7.9c-.1-.2-.2-.4-.2-.6 0-.6.3-1.2.9-1.4l2.9-1 2.3-.8 4.1-1.4c.4-.1.6-.5.5-.9-.1-.4-.5-.6-.9-.5L8.5 16.1c-1.4.5-2.3 1.7-2.5 3.1v.5c.3 1.6 1.6 2.8 3.2 2.8.3 0 .6 0 .8-.1l3.9-1.3 6.4-2.1 2.9-1c.1.2.2.4.2.6 0 .7-.4 1.2-.9 1.4l-2.9 1-2.3.8-4.1 1.4c-.4.1-.6.5-.5.9.1.4.5.6.9.5l10.6-3.6c1.4-.5 2.4-1.8 2.4-3.3 0-.2 0-.4-.1-.6-.3-1.5-1.6-2.6-3.1-2.6-.3 0-.5 0-.7.1z"/></svg>);

    case "ALGO":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M11 22h2.4l1.5-2.9.8 1.6L17 22h2.4l-2-3.9 1.2-2.4 3.4 6.3H24l-4.6-8.5-1.5 2.9L14 8l-1.5 3 3.3 6.4z"/></svg>);

    case "FTM":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#1969FF"/><path fill="#FFF" d="m22 11.6-5.2 3v6l-.8.5-.8-.5v-6L10 11.6l-.8.5v7l3.4 2 .8-.5v-6l.8.5v6l3.4 2 3.4-2v-7z"/></svg>);

    case "RNDR":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M11 8h6c2.2 0 4 1.8 4 4 0 1.7-1.1 3.2-2.6 3.7L22 24h-3.5l-3.3-8h-1.7v8H11zm2.5 2.5v3h3.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z"/></svg>);

    case "XMR":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#FF6600"/><path fill="#FFF" d="M15.6 20.8h-2.9v-6.5l3.3 3.3 3.3-3.3v6.5h-2.9v3.7h6.6V10.8h-.1l-6.9 6.9-6.9-6.9H9.1v13.7h6.6z"/><path fill="#FFF" d="M9.1 9.4v1.4l.1 0 6.9 6.9 6.9-6.9h.1V9.4z"/></svg>);

    case "ZIL":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#49C1BF"/><path fill="#FFF" d="m20.9 8.5-6 6.9h5.6l-9.4 8.1 6-6.9h-5.6z"/></svg>);

    case "ETC":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#328332"/><g fill="#FFF"><path fillOpacity=".6" d="M16.5 4v8.9l7.5 3.3z"/><path d="M16.5 4L9 16.2l7.5-3.3z"/><path fillOpacity=".6" d="M16.5 22v6l7.5-10.4z"/><path d="M16.5 28v-6L9 17.6z"/><path fillOpacity=".2" d="M16.5 20.6l7.5-4.4-7.5-3.3z"/><path fillOpacity=".6" d="M9 16.2l7.5 4.4v-7.7z"/></g></svg>);

    case "XLM":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M23.2 14.6c.4-.1.6-.5.5-.9s-.5-.6-.9-.5l-3.9 1.3-6.4 2.1-2.7.9c-.1-.2-.2-.4-.2-.6 0-.6.3-1.2.9-1.4l2.9-1 2.3-.8 4.1-1.4c.4-.1.6-.5.5-.9-.1-.4-.5-.6-.9-.5L8.5 16.1c-1.4.5-2.3 1.7-2.5 3.1v.5c.3 1.6 1.6 2.8 3.2 2.8.3 0 .6 0 .8-.1l3.9-1.3 6.4-2.1 2.9-1c.1.2.2.4.2.6 0 .7-.4 1.2-.9 1.4l-2.9 1-2.3.8-4.1 1.4c-.4.1-.6.5-.5.9.1.4.5.6.9.5l10.6-3.6c1.4-.5 2.4-1.8 2.4-3.3 0-.2 0-.4-.1-.6-.3-1.5-1.6-2.6-3.1-2.6-.3 0-.5 0-.7.1z"/></svg>);

    case "ZEC":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#ECB244"/><path fill="#FFF" d="M20.5 8v2.4h-6.7l6.7 7.8v2.4h-3.7V24h-1.6v-3.4H10.5V18l6.7-7.8h-6.7V7.8h3.8V5h1.6v2.8h4.6z"/></svg>);

    case "DASH":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#008CE7"/><path fill="#FFF" d="M22 13.5l-2.4 2.6H9.2l-.6.7H20l-2 2.2H5.5l-.5.5-1.5 1.6h14.7l2.9-3.1 1.4-1.5.5-.5.5-.5.6-.6zM11 15h9l-2.4 2.6H8.6z"/></svg>);

    case "STX":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#5546FF"/><path fill="#FFF" d="M16 8.5 6.5 16 16 23.5 25.5 16zM16 11l5.9 5-5.9 5-5.9-5z"/></svg>);

    case "KAS":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#70C7BA"/><path fill="#FFF" d="M16 6 8 18l4 4h8l4-4z"/></svg>);

    case "RUNE":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#33FF99"/><path fill="#000" d="m16 5-2 7 5 4-5 4 2 7 9-11zM8 16l5-6v12z"/></svg>);

    case "CAKE":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#1FC7D4"/><path fill="#FFF" d="M12 18c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm-2.8-5.5c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8-.8 1.8-1.8 1.8-1.8-.8-1.8-1.8zm12 0c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8-.8 1.8-1.8 1.8-1.8-.8-1.8-1.8zM16 6c-4 0-7.3 2.4-7.3 5.4v1.3h14.6v-1.3C23.3 8.4 20 6 16 6z"/></svg>);

    case "XTZ":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#2C7DF7"/><path fill="#FFF" d="M16 5.5 9 12v9l7 5.5 7-5.5v-9zm0 2.4 5 4v7l-5 4-5-4v-7z"/></svg>);

    case "DAI":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#F5AC37"/><path fill="#FFF" d="M22 14.8h-1.2c-.1-.8-.4-1.6-.7-2.3h1.9v-1.2h-3c-.8-1.1-2-1.7-3.4-1.7h-4.4v2.9H9.9v1.2h1.3v1.8H9.9v1.2h1.3v3.7h4.4c1.4 0 2.6-.6 3.4-1.7h3v-1.2h-1.9c.3-.7.6-1.5.7-2.3H22z"/></svg>);

    case "AR":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#222"/><path fill="#FFF" d="M16 6 7 21h3l6-10.5 6 10.5h3z"/></svg>);

    case "GRT":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#6747ED"/><path fill="#FFF" d="M16 6 6 16l10 10 10-10zm0 3.5 6.5 6.5-6.5 6.5-6.5-6.5z"/></svg>);

    case "SAND":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#00ADEF"/><path fill="#FFF" d="M10 20l6-4 6 4-6 4zm0-8l6-4 6 4-6 4z"/></svg>);

    case "MANA":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#FF2D55"/><path fill="#FFF" d="M16 6 8 16v4l8 4 8-4v-4zm0 2.5 4 5-4 2-4-2z"/></svg>);

    case "CRV":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#40649F"/><g fill="#FFF"><circle cx="10" cy="10" r="2"/><circle cx="22" cy="10" r="2"/><circle cx="10" cy="22" r="2"/><circle cx="22" cy="22" r="2"/></g></svg>);

    case "MKR":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#1AAB9B"/><path fill="#FFF" d="M8 20V12l8 6 8-6v8h-2v-5l-6 4.5L10 15v5z"/></svg>);

    case "COMP":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#00D395"/><path fill="#FFF" d="m16 6 8 4.6v10.8L16 26l-8-4.6V10.6zm0 2.3L10 11.8v8.4l6 3.5 6-3.5v-8.4z"/></svg>);

    case "SNX":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#00D1FF"/><path fill="#FFF" d="M9 20V12l7 5 7-5v8z"/></svg>);

    case "1INCH":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#1B314F"/><path fill="#FFF" d="M12 10h6v2h-2v10h-2V12h-2z"/></svg>);

    case "BAT":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#FF5000"/><path fill="#FFF" d="M16 6 8 20h3l2.5-5h5L21 20h3z"/></svg>);

    case "CHZ":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#CD0124"/><path fill="#FFF" d="M22 10 10 22l-2-2 12-12zm-12 0 12 12-2 2L8 12z"/></svg>);

    case "GALA":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M12 8v16h3V8zm5 0v5h3V8zm0 6v5h3v-5zm0 6v4h3v-4z"/></svg>);

    case "IMX":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#0A0A0A"/><path fill="#FFF" d="M9 10h4v12H9zm5 0h5c2 0 3 1 3 2.5s-1 2-2 2.3c1.5.3 2.5 1.2 2.5 3S21.5 22 19.5 22h-5.5z"/></svg>);

    case "APE":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#0054F9"/><path fill="#FFF" d="M16 6 8 26h2l6-14 6 14h2z"/></svg>);

    case "LDO":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#F69988"/><path fill="#FFF" d="M12 22V12l4-6 4 6v10z"/></svg>);

    case "SEI":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#9E1F19"/><path fill="#FFF" d="M16 6 8 16l8 10 8-10zm0 3 5 7-5 6-5-6z"/></svg>);

    case "SUI":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#4DA2FF"/><path fill="#FFF" d="M16 6c-3 4-6 6-6 10a6 6 0 0 0 12 0c0-4-3-6-6-10z"/></svg>);

    case "TIA":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#7B2BF9"/><path fill="#FFF" d="M16 5 8 25h3l5-13 5 13h3z"/></svg>);

    case "INJ":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#00D2FF"/><path fill="#FFF" d="M16 6 8 16l8 10 8-10z"/></svg>);

    case "PYTH":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#E6DAFE"/><path fill="#6E56CF" d="M16 6 8 16l8 10 8-10z"/></svg>);

    case "JUP":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#C7F284"/><path fill="#000" d="M8 16l4-6 4 6-4 6zm8 0l4-6 4 6-4 6z"/></svg>);

    case "WIF":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#C7A67B"/><path fill="#FFF" d="M10 18c0-3 2-5 5-5s5 2 5 5-2 4-5 4-5-1-5-4zm3-7h4l-2-2z"/></svg>);

    case "BONK":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#F9A825"/><text x="16" y="22" textAnchor="middle" fill="#000" fontFamily="Inter" fontSize="16" fontWeight="900">B</text></svg>);

    case "PEPE":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#3D8130"/><path fill="#FFF" d="M9 14a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm8 0a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM11 21c1 1 3 1.5 5 1.5s4-.5 5-1.5z"/></svg>);

    case "FLOKI":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#F7B219"/><path fill="#000" d="M10 14a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm8 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM12 22l4-3 4 3-4 2z"/></svg>);

    case "FET":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#1D1D1D"/><path fill="#FFF" d="M8 16l4-6 4 6-4 6zm8 0l4-6 4 6-4 6z"/></svg>);

    case "WLD":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M8 20V12l8 6 8-6v8z"/></svg>);

    case "STRK":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#0C0C4F"/><path fill="#FFF" d="M16 6 8 16l8 10 8-10zm0 4 4 6-4 6-4-6z"/></svg>);

    case "ZK":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#FFF"/><path fill="#000" d="M11 10h10l-5 6h5l-10 6 5-6h-5z"/></svg>);

    case "ENA":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M16 6 8 16l8 10 8-10z"/></svg>);

    case "ONDO":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M16 8a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/></svg>);

    case "TAO":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M8 12h16v2H8zm4 4h8v2h-8z"/></svg>);

    case "GRASS":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#4A9D5F"/><path fill="#FFF" d="M8 22h16v2H8zm2-4h12v2H10zm2-4h8v2h-8zm2-4h4v2h-4z"/></svg>);

    case "NXT":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#E83D3D"/><path fill="#FFF" d="M10 22V10l12 12V10"/><path stroke="#FFF" strokeWidth="2.5" fill="none" d="M10 22V10l12 12V10"/></svg>);

    case "MOVE":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M10 22V10l4 4v8zm6 0V10l6 6v6z"/></svg>);

    case "STETH":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#00A3FF"/><g fill="#FFF"><path fillOpacity=".6" d="M16.5 4v8.9l7.5 3.3z"/><path d="M16.5 4L9 16.2l7.5-3.3z"/><path fillOpacity=".6" d="M16.5 22v6l7.5-10.4z"/><path d="M16.5 28v-6L9 17.6z"/></g></svg>);

    case "WBTC":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#F7931A"/><text x="16" y="21" textAnchor="middle" fill="#FFF" fontFamily="Inter" fontSize="11" fontWeight="900">WB</text></svg>);

    case "FDUSD":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#00A478"/><path fill="#FFF" d="M16 6v20M6 16h20" stroke="#FFF" strokeWidth="2.5"/></svg>);

    case "TUSD":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#002868"/><path fill="#FFF" d="M16 6v10l-6-6 6-4zm0 0v10l6-6-6-4zm0 12v8l-6-6zm0 8v-8l6 6z"/></svg>);

    case "USDD":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#1B1B1B"/><text x="16" y="21" textAnchor="middle" fill="#FFF" fontFamily="Inter" fontSize="13" fontWeight="900">D</text></svg>);

    case "FRAX":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><text x="16" y="21" textAnchor="middle" fill="#FFF" fontFamily="Inter" fontSize="13" fontWeight="900">F</text></svg>);

    case "CRO":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#103F68"/><path fill="#FFF" d="M16 6 8 16l8 10 8-10z"/></svg>);

    case "OKB":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M16 6l-6 6 6 6-6 6h6l6-6-6-6 6-6z"/></svg>);

    case "LEO":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#F7A600"/><path fill="#000" d="M12 6v16h10v4H8V6z"/></svg>);

    case "NEO":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#00E599"/><path fill="#FFF" d="M16 6 8 10v12l8 4 8-4V10z"/></svg>);

    case "EOS":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M16 6 8 26h4l4-10 4 10h4z"/></svg>);

    case "IOTA":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#242424"/><g fill="#FFF"><circle cx="16" cy="8" r="1.5"/><circle cx="12" cy="11" r="1.5"/><circle cx="20" cy="11" r="1.5"/><circle cx="8" cy="16" r="1.5"/><circle cx="24" cy="16" r="1.5"/><circle cx="12" cy="21" r="1.5"/><circle cx="20" cy="21" r="1.5"/><circle cx="16" cy="24" r="1.5"/></g></svg>);

    case "ZRX":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#000"/><path fill="#FFF" d="M10 8l6 6h-6zm12 16l-6-6h6zm-12 0l6-6-6-6z"/></svg>);

    case "ENJ":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#7866D5"/><path fill="#FFF" d="M16 6 8 16l8 10 8-10z"/></svg>);

    case "AXS":
      return (<svg {...p}><circle cx="16" cy="16" r="16" fill="#0055D5"/><path fill="#FFF" d="M16 6l-6 10h4l2-3 2 3h4z"/></svg>);

    default:
      return (
        <svg {...p}>
          <circle cx="16" cy="16" r="16" fill={color} />
          <text x="16" y="21" textAnchor="middle" fill="#0A0B0F" fontFamily="Inter, system-ui, sans-serif" fontSize="13" fontWeight="700">
            {s.slice(0, 1)}
          </text>
        </svg>
      );
  }
}