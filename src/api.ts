export interface Stock {
  changePercentage?: number;
  changePoint?: number;
  symbol: string;
  price?: number;
  totalVolume?: string;
  valid?: boolean;
}

export interface TickerResponse {
  price: number;
  change_point: number;
  change_percentage: number;
  total_vol: string;
}

export interface StockTicker {
  connect: (onTick: (stock: Stock) => void) => StockTickerConnection;
}

export interface StockTickerConnection {
  subscribe: (symbols: string | string[]) => void;
  unsubscribe: (symbol: string) => void;
  dispose: () => void;
}

const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'a9b6b03cf8msh40f0fc20099da17p1cbe86jsn321b5ac5e495',
    'X-RapidAPI-Host': 'realstonks.p.rapidapi.com',
  },
};

export const Ticker: StockTicker = {
  connect: (onTick: (stock: Stock) => void): StockTickerConnection => {
    const invalid = new Set<string>();
    const subscribedSymbols = new Set<string>();
    const timer = setInterval(() => {
      subscribedSymbols.forEach(async s => {
        if (!invalid.has(s)) {
          try {
            const response = await fetch(
              `https://realstonks.p.rapidapi.com/${s}`,
              options
            );

            if (response?.ok) {
              const tickerResponse: TickerResponse = await response.json();
              onTick({
                changePercentage: tickerResponse.change_percentage,
                changePoint: tickerResponse.change_point,
                price: tickerResponse.price,
                symbol: s,
                totalVolume: tickerResponse.total_vol,
                valid: true,
              });
            } else {
              invalid.add(s);
              onTick({ symbol: s, valid: false });
            }
          } catch (error) {
            console.error(error);
          }
        }
      });
    }, 2000);

    return {
      subscribe: (symbols: string | string[]) => {
        const symbolsArray = Array.isArray(symbols) ? symbols : [symbols];
        symbolsArray.forEach(s => subscribedSymbols.add(s));
      },
      unsubscribe: (symbol: string) => {
        subscribedSymbols.delete(symbol);
      },
      dispose: () => {
        clearInterval(timer);
      },
    };
  },
};
