/* jshint esversion: 6 */
/* jshint sub: true */

function body(name) {
  const socket = new WebSocket('ws://' + location.host);
  let myRole = 'visitor';

  function send(obj) {
    socket.send(JSON.stringify(obj));
  }

  function sendJoin() {
    send({'ev': 'join', 'name': name});
  }

  function sendTextMessage(text) {
    send({'ev': 'textMessage', 'name': name, 'msg': text});
  }

  function sendPaintEvent(paintEvent, details) {
    details['ev'] = paintEvent;
    send({'ev': 'paintEvent', 'd': details});
  }

  function sendMessage() {
    var message = document.getElementById('message-input').value;
    socket.send(message);
  }

  function logMessageReceived(message) {
    var messageElement = document.createElement('li');
    messageElement.innerText = JSON.stringify(message);
    document.getElementById('messages').appendChild(messageElement);
  }

  const eventHandlerMap = {};

  eventHandlerMap['ctrl'] = (msg) => {
    switch (msg['cmd']) {
      case 'clear':
        ctx.clearRect(0, 0, canvas.width * dpr, canvas.height * dpr);
        break;
      case 'role':
        myRole = msg['role'];
        break;
    }
  };

  eventHandlerMap['error'] = (msg) => {
    alert(msg['msg']);
  };

  socket.onopen = function (event) {
    sendJoin();
  };

  socket.onerror = (event) => {
    console.log('onerror', event);
    alert("エラーが発生しました。ページをリロードしてください。");
  };

  socket.onmessage = (event) => {
    try {
      let data = JSON.parse(event.data);
      let handler = eventHandlerMap[data['ev']];
      if (handler) {
        handler(data);
      }
    } catch (e) {
      console.log('error', e);
    }
  };

  const textInput = document.querySelector('#text');
  const sendButton = document.querySelector('#send');
  const chatForm = document.querySelector('#chat-form');
  function sendChat(ev) {
    ev.preventDefault();
    const text = textInput.value;
    sendTextMessage(text);
    textInput.value = '';
    return false;
  }
  sendButton.addEventListener('click', sendChat);
  chatForm.addEventListener('submit', sendChat);

  const canvas = document.querySelector('#canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  ctx.resetTransform();
  canvas.width = canvas.offsetWidth*dpr;
  canvas.height = canvas.offsetHeight*dpr;
  ctx.scale(dpr, dpr);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  function translateFromRatio(fn, details) {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const x = width * details['x'];
    const y = height * details['y'];
    ctx[fn](x, y);
  }
  function translateOrigin(mouseOrTouchEvent) {
    const rect = canvas.getBoundingClientRect();

    if (mouseOrTouchEvent instanceof TouchEvent) {
      return [
        (mouseOrTouchEvent.touches[0].clientX - rect.left),
        (mouseOrTouchEvent.touches[0].clientY - rect.top),
      ];
    } else {
      return [
        (mouseOrTouchEvent.clientX - rect.left),
        (mouseOrTouchEvent.clientY - rect.top),
      ];
    }
  }
  function translateToRatio(details) {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    details['x'] = details['x'] / width;
    details['y'] = details['y'] / height;
    return details;
  }
  eventHandlerMap['paintEvent'] = (data) => {
    switch (data['d']['ev']) {
    case 'color':
      ctx.strokeStryle = data['d']['color'];
      break;
    case 'down':
      ctx.beginPath();
      translateFromRatio('moveTo', data['d']);
      break;
    case 'move':
      translateFromRatio('lineTo', data['d']);
      ctx.stroke();
      break;
    case 'up':
      ctx.closePath();
      break;
    }
  };
  let isMouseDown = false;

  function drawStart(e) {
    e.preventDefault();
    if (myRole !== 'painter') { return; }
    let [x, y] = translateOrigin(e);
    isMouseDown = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    sendPaintEvent('down', translateToRatio({
      'x': x,
      'y': y,
    }));
  }
  function drawMove(e) {
    e.preventDefault();
    if (!isMouseDown) return;
    let [x, y] = translateOrigin(e);
    e.preventDefault();
    ctx.lineTo(x, y);
    ctx.stroke();
    sendPaintEvent('move', translateToRatio({
      'x': x,
      'y': y,
    }));
  }
  function drawEnd(e) {
    e.preventDefault();
    if (!isMouseDown) return;
    e.preventDefault();
    ctx.closePath();
    sendPaintEvent('up', {});
    isMouseDown = false;
  }

  canvas.addEventListener('mousedown', drawStart);
  canvas.addEventListener('mousemove', drawMove);
  canvas.addEventListener('mouseup', drawEnd);
  canvas.addEventListener('touchstart', drawStart);
  canvas.addEventListener('touchmove', drawMove);
  canvas.addEventListener('touchend', drawEnd);

  const history = document.querySelector('#history');
  eventHandlerMap['textMessage'] = (data) => {
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.setAttribute('class', 'msg-name');
    const name = document.createTextNode(data.name);
    nameSpan.appendChild(name);
    const textSpan = document.createElement('span');
    textSpan.setAttribute('class', 'msg-text');
    const text = document.createTextNode(data.msg);
    textSpan.appendChild(text);
    li.appendChild(nameSpan);
    li.appendChild(textSpan);
    history.insertBefore(li, history.firstChild);
  };
}

window.addEventListener('load', () => {
  let name = prompt('Catch Feeling にようこそ!おなまえを入力して入室してください。', '');
  if (name === null ||  name === '') {
    alert('さようなら…');
    return;
  }
  body(name);
});
