// Icon and colour for a category name. Names come from the backend parser and from users,
// so this matches on keywords and falls back to a neutral style for anything unknown.
const CATEGORY_STYLES = [
  { match: /RENT|HOUS/, icon: 'home', color: '#34d399' },
  { match: /INVEST|SIP|MUTUAL|STOCK/, icon: 'trending-up', color: '#22d3ee' },
  { match: /FOOD|DINING|GROCER|RESTAURANT/, icon: 'restaurant', color: '#fbbf24' },
  { match: /TRAVEL|TRANSPORT|TRANSIT|FUEL/, icon: 'commute', color: '#fb7185' },
  { match: /SUBSCRIPTION|ENTERTAIN/, icon: 'subscriptions', color: '#c084fc' },
  { match: /TELECOM|RECHARGE|MOBILE/, icon: 'smartphone', color: '#38bdf8' },
  { match: /UTILIT|BILL|ELECTRIC/, icon: 'bolt', color: '#facc15' },
  { match: /SHOP/, icon: 'shopping-bag', color: '#f472b6' },
  { match: /SALARY|INCOME|BONUS/, icon: 'payments', color: '#4edea3' },
  { match: /INSURANCE/, icon: 'security', color: '#818cf8' },
  { match: /HEALTH|MEDICAL/, icon: 'local-hospital', color: '#f87171' },
  { match: /EDUCATION/, icon: 'school', color: '#a3e635' },
  { match: /ATM|CASH/, icon: 'local-atm', color: '#2dd4bf' },
  { match: /TRANSFER/, icon: 'swap-horiz', color: '#60a5fa' },
  { match: /REFUND/, icon: 'replay', color: '#4edea3' },
  { match: /INTEREST/, icon: 'percent', color: '#a3e635' },
  { match: /FEE/, icon: 'receipt-long', color: '#fb923c' },
];

const DEFAULT_STYLE = { icon: 'label-outline', color: '#94a3b8' };

export const getCategoryStyle = (category) => {
  const name = (category || '').toUpperCase();
  const { icon, color } = CATEGORY_STYLES.find((style) => style.match.test(name)) || DEFAULT_STYLE;
  return { icon, color, tint: `${color}1f`, border: `${color}66` };
};
