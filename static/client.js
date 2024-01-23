'use strict';

const api = {};
const buildApi = (methods) => {
  for (const method of methods) {
    api[method] = (...args) =>
      new Promise((resolve, reject) => {
        const url = `/api/${method}`;
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        }).then((res) => {
          const { status } = res;
          if (status !== 200) {
            reject(new Error(`Status Code: ${status}`));
            return;
          }
          resolve(res.json());
        });
      });
  }
};

const menuRender = async () => {
  buildApi(['menuRender']);
  const output = document.getElementById('view');
  const list = await api.menuRender();
  buildApi(list);
  output.innerHTML = '';
  for (const item of list) {
    if (item === 'menuRender') continue;
    output.innerHTML += `<button id="${item}">${item}</button><p></p>`;
  }
  const selectApp = (data) => {
    const method = data.target.id;
    const listApps = Object.keys(api);
    if (listApps.some((item) => item === method)) {
      factory(method);
      output.removeEventListener('click', selectApp);
    }
  };

  output.addEventListener('click', selectApp);
};

async function calculateRender() {
  const view = document.getElementById('view');
  view.innerHTML = '<div id="calculate"></div>';
  const input = document.getElementById('calculate');
  input.innerHTML =
    '<button id="back" class="calculate-symbol"><-</button><div id="output" class="calculate-display"></div>';
  const numbers = await api.calculate();
  for (let i = 1; i < numbers.length + 1; i++) {
    const [id, view] = numbers[i - 1];
    input.innerHTML += `<button class="calculate-symbol" id="${id}">${view}</button>`;
    if (i % 3 === 0) {
      input.innerHTML += '<p></p>';
      if (i === 12) {
        input.innerHTML += '<p style="margin-bottom: 35px;"></p>';
      }
      continue;
    }
  }
  const output = document.getElementById('output');
  return { input, output };
}

async function exchangeRateRender() {
  const view = document.getElementById('view');
  view.innerHTML = '<div id="exchangeRate"></div>';
  const input = document.getElementById('exchangeRate');
  input.innerHTML = '<button id="back"><-</button>';
  input.innerHTML += `<h1 id="rub">exchange rate!</h1>`;
  input.innerHTML += `<div id="output" class="calculate-display">404</div>`;
  const output = document.getElementById('output');
  return { input, output };
}

async function factory(nameApp) {
  const { input, output } = await window[`${nameApp}Render`]();
  const socket = new WebSocket(`ws://localhost:8000/${nameApp}`);

  function handler(data) {
    const id = data.target.id;
    const value = data.target.innerText;
    socket.send(id);
    output.innerHTML += value;
    if (id === 'back') {
      removeEventListener('click', handler);
      menuRender();
      socket.close();
    }
  }

  input.addEventListener('click', handler);
}

menuRender();
