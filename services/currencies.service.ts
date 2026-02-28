export type CurrencyOption = {
  code: string;
  name: string;
};

type CurrencyObserver = (currencies: CurrencyOption[]) => void;

const CURRENCIES_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.min.json";

let currencyCache: CurrencyOption[] | null = null;
let isLoadingCurrencies = false;
const currencyObservers = new Set<CurrencyObserver>();
let loadCurrenciesPromise: Promise<CurrencyOption[]> | null = null;

function notifyCurrencyObservers() {
  const snapshot = currencyCache ? [...currencyCache] : [];
  for (const observer of currencyObservers) {
    observer(snapshot);
  }
}

export function subscribeToCurrencyOptions(observer: CurrencyObserver): () => void {
  currencyObservers.add(observer);
  observer(currencyCache ? [...currencyCache] : []);

  return () => {
    currencyObservers.delete(observer);
  };
}

export function getCurrencyOptionsSnapshot(): CurrencyOption[] {
  return currencyCache ? [...currencyCache] : [];
}

function normalizeCurrencyEntries(payload: Record<string, string>): CurrencyOption[] {
  return Object.entries(payload)
    .map(([code, name]) => ({
      code: code.toUpperCase(),
      name: String(name || "").trim(),
    }))
    .filter((currency) => currency.code.length > 0 && currency.name.length > 0)
    .sort((a, b) => a.code.localeCompare(b.code));
}

export async function loadCurrencyOptions(): Promise<CurrencyOption[]> {
  if (currencyCache) {
    return [...currencyCache];
  }

  if (loadCurrenciesPromise) {
    return loadCurrenciesPromise;
  }

  loadCurrenciesPromise = (async () => {
    isLoadingCurrencies = true;

    try {
      const response = await fetch(CURRENCIES_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch currencies (${response.status})`);
      }

      const payload = (await response.json()) as Record<string, string>;
      currencyCache = normalizeCurrencyEntries(payload);
      notifyCurrencyObservers();
      return [...currencyCache];
    } catch (error) {
      console.error("Error fetching currencies:", error);

      currencyCache = [
        { code: "ARS", name: "Argentine Peso" },
        { code: "USD", name: "US Dollar" },
      ];

      notifyCurrencyObservers();

      return [...currencyCache];
    } finally {
      isLoadingCurrencies = false;
      loadCurrenciesPromise = null;
    }
  })();

  return loadCurrenciesPromise;
}

export async function getCurrencyOptions(): Promise<CurrencyOption[]> {
  return loadCurrencyOptions();
}

export async function getExchangeRateForCurrencies(
  sourceCurrencyCode: string,
  targetCurrencyCode: string,
): Promise<number | null> {
  const source = sourceCurrencyCode.trim().toLowerCase();
  const target = targetCurrencyCode.trim().toLowerCase();

  if (!source || !target) {
    return null;
  }

  if (source === target) {
    return 1;
  }

  try {
    const response = await fetch(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${source}.json`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate (${response.status})`);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const sourceRates = payload[source] as Record<string, unknown> | undefined;
    const rate = Number(sourceRates?.[target]);

    if (!Number.isFinite(rate) || rate <= 0) {
      return null;
    }

    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
}
