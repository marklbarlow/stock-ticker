import { useCallback, useEffect, useMemo, useState } from 'react';

import { Stock, StockTickerConnection, Ticker } from './api';

type Stocks = { [symbol: string]: Stock };

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
      <h1 className="text-2xl">Nasdaq Stock Ticker</h1>
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
