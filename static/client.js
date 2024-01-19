'use strict';

// формируем API
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
    '<button id="back" class="calculate-symbol"><-</button><div id="output" class="calculate-display">404</div>';
  const numbers = await api.calculate();
  for (let i = 1; i < numbers.length + 1; i++) {
    const [id, view] = numbers[i - 1];

    if (view === '0') {
      input.innerHTML += `<button style="display: block; margin-left: 65px; margin-bottom: 65px;" class="calculate-symbol" id="${id}">${view}</button>`;
      continue;
    }
    input.innerHTML += `<button class="calculate-symbol" id="${id}">${view}</button>`;
    if (i % 3 === 0 && i < 10) {
      input.innerHTML += '<p></p>';
      continue;
    }
    const index = i - 1;
    if (i > 10 && index % 3 === 0) {
      input.innerHTML += '<p></p>';
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

// сделать универсальную функцию
async function factory(name) {
  const { input, output } = await window[`${name}Render`]();
  const socket = new WebSocket(`ws://localhost:8000/${name}`);

  const handler = (data) => {
    const id = data.target.id;
    // мы хотим отправить запрос на сервер, но обработка должна произойти в api
    socket.send(id); // отправляем данные в виде объекта
    output.innerHTML += id;
    if (id === 'back') {
      removeEventListener('click', handler);
      menuRender();
      socket.close();
    }
  };

  input.addEventListener('click', handler);
}

menuRender();
