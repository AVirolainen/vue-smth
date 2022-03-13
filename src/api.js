/* eslint-disable prettier/prettier */

const API_KEY = `2d0e4ef4296d951d80557235e93b861eb7695d9a9ba196593980b54db4fb0083`;
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5"

socket.addEventListener("message", (e) => {
  const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data);
  if(type !== AGGREGATE_INDEX || newPrice === undefined){
    return;
  }
  const handlers = tickersHandler.get(currency) || [];
  handlers.forEach((fn) => fn(newPrice));
});
const tickersHandler = new Map();

export const loadAllTickers = () =>
  fetch(
    `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
  ).then((r) => r.json());

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message)
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker){
  const message = {
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  };
  sendToWebSocket(message)
}

function unsubscribeToTickerOnWs(ticker){
  const message = {
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  };
  sendToWebSocket(message)
}

export const subscribeToTicker = (ticker, callback) => {
  const existingSubscribe = tickersHandler.get(ticker) || [];
  tickersHandler.set(ticker, [...existingSubscribe, callback]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeToTicker = (ticker) => {
  tickersHandler.delete(ticker);
  unsubscribeToTickerOnWs(ticker)
};

window.tickers = tickersHandler;
