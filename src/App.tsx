import { useCallback, useEffect, useMemo, useState } from 'react';

import { Stock, StockTickerConnection, Ticker } from './api';

type Stocks = { [symbol: string]: Stock };

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    viewBox="0 0 24 24"
  >
    <g fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
    </g>
  </svg>
);

const StockItem = ({
  onUnsubscribe,
  stock,
}: {
  onUnsubscribe: (symbol: string) => void;
  stock: Stock;
}) => (
  <tr className="border-b">
    <td>{stock.symbol}</td>
    <td>{stock.price ?? 'Waiting...'}</td>
    <td>
      <button
        className="btn btn-red my-2"
        type="button"
        onClick={() => onUnsubscribe(stock.symbol)}
      >
        Unsubscribe
      </button>
    </td>
  </tr>
);

export const App = () => {
  const [symbolEntered, setSymbolEntered] = useState('');
  const [stocks, setStocks] = useState<Stocks>({});
  const [connection, setConnection] = useState<StockTickerConnection>();

  useEffect(() => {
    const conn = Ticker.connect(stock => {
      setStocks(s =>
        Object.hasOwn(s, stock.symbol)
          ? {
              ...s,
              [stock.symbol]: { symbol: stock.symbol, price: stock.price },
            }
          : s
      );
    });
    setConnection(conn);
    return () => conn.dispose();
  }, []);

  const onSubscribe = () => {
    const splitSymbols = symbolEntered.split(/[ ,]+/);

    setStocks(s => {
      const stocksToAdd = splitSymbols.reduce((acc, curr) => {
        acc[curr] = { symbol: curr };
        return acc;
      }, {} as Stocks);

      return { ...stocksToAdd, ...s };
    });

    connection?.subscribe(splitSymbols);
  };

  const onUnsubscribe = useCallback(
    (symbol: string) => {
      connection?.unsubscribe(symbol);

      setStocks(s => {
        const { [symbol]: omit, ...remainder } = s;
        return remainder;
      });
    },
    [connection]
  );

  const stocksList = useMemo(
    () =>
      Object.values(stocks).map(stock => (
        <StockItem
          key={stock.symbol}
          onUnsubscribe={onUnsubscribe}
          stock={stock}
        ></StockItem>
      )),
    [onUnsubscribe, stocks]
  );

  return (
    <div className="flex flex-col h-full gap-3 m-3">
      <div className="flex flex-row gap-4">
        <h1 className="text-2xl">Nasdaq Stock Ticker</h1>
        <a
          className="w-22 h-22"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Open on GitHub"
          href="https://github.com/marklbarlow/stock-ticker"
        >
          <Logo></Logo>
        </a>
      </div>

      <h4 className="text-sm text-stone-500">
        Enter one or more stock symbols, separated by a comma
      </h4>
      <div className="flex flex-row gap-2">
        <input
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Stock symbols"
          onChange={event => setSymbolEntered(event.target.value)}
        />

        <button className="btn btn-blue" type="button" onClick={onSubscribe}>
          Subscribe
        </button>
      </div>
      <table className="table-fixed text-left text-sm font-light max-w-xl ">
        <thead className="border-b font-medium bg-neutral-50 ">
          <tr>
            <th>Symbol</th>
            <th>Price</th>
            <th>Subscription</th>
          </tr>
        </thead>
        <tbody>{stocksList}</tbody>
      </table>
    </div>
  );
};
