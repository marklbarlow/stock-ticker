export interface Stock {
  symbol: string;
  price?: number;
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

export const Ticker: StockTicker = {
  connect: (onTick: (stock: Stock) => void): StockTickerConnection => {
    const subscribedSymbols = new Set<string>();
    const timer = setInterval(() => {
      subscribedSymbols.forEach(s => {
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key':
              'a9b6b03cf8msh40f0fc20099da17p1cbe86jsn321b5ac5e495',
            'X-RapidAPI-Host': 'realstonks.p.rapidapi.com',
          },
        };

        fetch(`https://realstonks.p.rapidapi.com/${s}`, options)
          .then(response => response.json() as Promise<TickerResponse>)
          .then(response => onTick({ price: response.price, symbol: s }))
          .catch(err => console.error(err));
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
