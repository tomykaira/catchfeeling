/* jshint esversion: 6 */

const express = require('express');
const app = express();
const WebSocket = require('ws');
const expressWs = require('express-ws')(app);

const kMinPlayerCount = 2;
const gameTimeout = 120 * 1000;
const players = [];
// Use only ひらがな
const dictionary = [
  'りんご',
  'ごりら',
  'らっぱ',
  'ぱんつ',
];
const recentlySelectedWords = [];
let painterIndex = -1;
let currentWord = null;
let gameEndTime = null;
let gameTimeoutObserver = null;

app.use(express.static(__dirname + '/../client'));

app.ws('/', (ws, req) => {
  ws.on('message', (msg) => {
    let decoded = null;
    try {
      decoded = JSON.parse(msg);
    } catch(e) {
      return;
    }
    console.log(decoded);
    switch (decoded.ev) {
    case 'join':
      let isNgName = decoded.name === 'SYSTEM' || decoded.name === '' || decoded.name === null;
      for (let player of players) {
        isNgName = isNgName || (player.name === decoded.name);
      }
      if (isNgName) {
        sendOne(ws, error('この名前は使用できません。ブラウザをリロードして再試行してください'));
        return;
      }
      players.push(new Player(ws, decoded.name));
      fanOut(systemMessage(decoded.name + 'さんが入室しました'));
      if (players.length >= kMinPlayerCount) {
        fanOut(systemMessage('最低履行人数があつまりました。'));
        waitChangePainter(0);
      }
      break;
    case 'textMessage':
      let answerer = null;
      for (let p of players) {
        if (p.ws === ws) {
          answerer = p;
          break;
        }
      }
      if (answerer === players[painterIndex]) {
        decoded.msg = decoded.msg.replace(currentWord, '○○○');
      }
      fanOut(decoded);
      if (answerer !== players[painterIndex] && decoded.msg === currentWord) {
        if (answerer === null) {
          console.error('Unexpected: no answerer');
          return;
        }
        let point = Math.round((gameEndTime - Date.now()) / 1000);
        stopGameTimer();

        let msg = answerer.name + 'さんが正解しました!' + point + 'ポイント獲得! 現在の得点:';
        answerer.point += point;
        for (let p of players) {
          msg += ' ' + p.name + 'さん ' + p.point + '点';
        }
        fanOut(endTimer());
        fanOut(systemMessage(msg));
        fanOut(audio('ok'));
        waitChangePainter((painterIndex + 1) % players.length);
      }
      break;
    case 'paintEvent':
      if (painterIndex >= 0 && painterIndex < players.length) {
        let painter = players[painterIndex];
        if (painter.ws === ws) {
          fanOut(decoded);
        }
      }
      break;
    }
  });

  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('error', () => { disconnect(ws); });
  ws.on('close', () => { disconnect(ws); });
});

class Player {
  constructor(ws, name) {
    this.ws = ws;
    this.name = name;
    this.point = 0;
  }
}

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

const interval = setInterval(function ping() {
  expressWs.getWss().clients.forEach(function each(ws) {
    if (ws.isAlive === false || ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
      disconnect(ws);
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 5000);

function disconnect(ws) {
  let i = 0;
  for (i = 0; i < players.length; i++) {
    if (players[i].ws === ws) { break; }
  }
  if (i >= players.length) { return; }
  let disconnectedPlayer = players.splice(i, 1)[0];
  fanOut(systemMessage(disconnectedPlayer.name + 'さんが退出しました。'));
  if (i === painterIndex) {
    fanOut(systemMessage('絵師が退出したため、次のお題に移動します。今のお題は「' + currentWord + '」でした。'));
    fanOut(endTimer());
    waitChangePainter(painterIndex);
  }
}

function waitChangePainter(nextPainterIndex) {
  fanOut(systemMessage('5秒後に次のゲームが始まります'));
  setTimeout(() => { changePainter(nextPainterIndex); }, 5000);
}

function changePainter(nextPainterIndex) {
  painterIndex = nextPainterIndex;
  let painter = players[painterIndex];
  let nextWord = selectWord();
  currentWord = nextWord;
  fanOutOtherThan(painter.ws, systemMessage(painter.name + 'さんが絵を描きます。みんなで当てましょう。'));
  fanOutOtherThan(painter.ws, {'ev': 'ctrl', 'cmd': 'role', 'role': 'answerer'});
  sendOne(painter.ws, systemMessage('あなたが絵師です。お題は「' + nextWord + '」です。絵をかいてください。'));
  sendOne(painter.ws, {'ev': 'ctrl', 'cmd': 'role', 'role': 'painter'});
  startGameTimer();
  fanOut(startTimer(gameTimeout));
  fanOut(audio('question'));
}

function selectWord() {
  cleanUpRecentlySelectedWords();
  while (true) {
    let idx = (Math.random() * dictionary.length) | 0;
    let word = dictionary[idx];
    let isUsed = false;
    for (let rsw of recentlySelectedWords) {
      isUsed = isUsed || rsw.word === word;
      if (isUsed) break;
    }
    if (!isUsed) {
      recentlySelectedWords.push({word: word, usedTimeMs: Date.now()});
      return word;
    }
  }
}

function startGameTimer() {
  stopGameTimer();

  gameEndTime = Date.now() + gameTimeout;
  gameTimeoutObserver = setTimeout(() => {
    stopGameTimer();
    endGameByTimeLimit();
  }, gameTimeout);
}

function stopGameTimer() {
  if (gameTimeoutObserver !== null) {
    clearTimeout(gameTimeoutObserver);
    gameTimeoutObserver = null;
  }
}

function endGameByTimeLimit() {
  fanOut(endTimer());
  fanOut(systemMessage('時間切れ！正解者は居ませんでした 「' + currentWord + '」'));
  fanOut(audio('ng'));

  currentWord = null;
  waitChangePainter((painterIndex + 1) % players.length);
}

function cleanUpRecentlySelectedWords() {
  const newList = [];
  const thresholdTimeMs = Date.now() - 24 * 60 * 60 * 1000;
  for (let w of recentlySelectedWords) {
    if (w.usedTimeMs >= thresholdTimeMs) {
      newList.push(w);
    }
  }
  recentlySelectedWords.splice(0);
  recentlySelectedWords.push(...newList);
}

function error(msg) {
  return {'ev': 'error', 'msg': msg};
}

function systemMessage(msg) {
  return {'ev': 'textMessage', 'name': 'SYSTEM', 'msg': msg};
}

function startTimer(timeLimit) {
  return {'ev': 'startTimer', 'timeLimit': timeLimit};
}

function endTimer() {
  return {'ev': 'endTimer'};
}

function audio(id) {
  return {'ev': 'audio', 'id': id};
}

function fanOut(msg) {
  const fanOutMessageString = JSON.stringify(msg);
  expressWs.getWss().clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(fanOutMessageString);
    }
  });
}

function fanOutOtherThan(ws, msg) {
  const fanOutMessageString = JSON.stringify(msg);
  expressWs.getWss().clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(fanOutMessageString);
    }
  });
}

function sendOne(ws, msg) {
  if (ws.readyState === WebSocket.OPEN) {
    const string = JSON.stringify(msg);
    ws.send(string);
  }
}

app.listen(9898);
