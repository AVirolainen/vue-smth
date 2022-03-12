/* eslint-disable prettier/prettier */

const API_KEY = `2d0e4ef4296d951d80557235e93b861eb7695d9a9ba196593980b54db4fb0083`;

const tickersHandler = new Map();

const loadTickers = () => {
  if (tickersHandler.size == 0) {
    return;
  }
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandler
      .keys()]
      .join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((r) => r.json())
    .then((rawData) =>{
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      )

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandler.get(currency) || [];
        handlers.forEach(fn => fn(newPrice))
      })
  })
};

export const loadAllTickers = () =>
  fetch(
    `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
  ).then((r) => r.json());

export const subscribeToTicker = (ticker, callback) => {
  const existingSubscribe = tickersHandler.get(ticker) || [];
  tickersHandler.set(ticker, [...existingSubscribe, callback]);
};

export const unsubscribeToTicker = (ticker) => {
  tickersHandler.delete(ticker)
};

setInterval(loadTickers);

window.tickers = tickersHandler;
