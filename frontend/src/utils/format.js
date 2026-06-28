export function formatMoney(value) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let formatted;
  if (absValue >= 1e12) {
    formatted = `$${(absValue / 1e12).toFixed(2)}T`;
  } else if (absValue >= 1e9) {
    formatted = `$${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    formatted = `$${(absValue / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    formatted = `$${(absValue / 1e3).toFixed(1)}K`;
  } else {
    formatted = `$${absValue.toFixed(0)}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

export function formatNumber(value, decimals = 0) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${(value * 100).toFixed(2)}%`;
}

export function formatShortPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}
