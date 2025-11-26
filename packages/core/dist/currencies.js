// src/currencies.ts
var currencies = ["MXN", "USD", "EUR"];
var defaultCurrency = "MXN";
var fallbackCurrency = "USD";
var currencyMetadata = {
  MXN: {
    code: "MXN",
    symbol: "$",
    name: "Mexican Peso",
    decimals: 2,
    symbolPosition: "before",
    locales: ["es-MX"]
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    decimals: 2,
    symbolPosition: "before",
    locales: ["en-US"]
  },
  EUR: {
    code: "EUR",
    symbol: "\u20AC",
    name: "Euro",
    decimals: 2,
    symbolPosition: "after",
    locales: ["es-ES", "pt-PT"]
  }
};
function isValidCurrency(value) {
  return currencies.includes(value);
}
function parseCurrency(value) {
  if (value && isValidCurrency(value)) {
    return value;
  }
  return fallbackCurrency;
}
function getCurrencyMetadata(currency) {
  const validCurrency = parseCurrency(currency);
  return currencyMetadata[validCurrency];
}
function formatCurrency(amount, currency, options) {
  const meta = currencyMetadata[currency];
  const formatted = amount.toFixed(meta.decimals);
  const parts = formatted.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimalPart = parts[1];
  const number = `${integerPart}.${decimalPart}`;
  let result;
  if (meta.symbolPosition === "before") {
    result = `${meta.symbol}${number}`;
  } else {
    result = `${number}${meta.symbol}`;
  }
  if (options?.showCode) {
    result = `${result} ${currency}`;
  }
  return result;
}

export { currencies, currencyMetadata, defaultCurrency, fallbackCurrency, formatCurrency, getCurrencyMetadata, isValidCurrency, parseCurrency };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=currencies.js.map