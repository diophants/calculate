'use strict';

const buildApi = (methods) => {
  const api = {};
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
  return api;
};

const api = buildApi(['menuRender', 'calculate']);

const show = (list) => {
  const output = document.getElementById('output');
  output.innerHTML = '';
  console.log(list);
  for (const item of list) {
    output.innerHTML += `<button id="${item}">${item}</button>`;
    output.innerHTML += `<p></p>`;
  }
};

const scenario = async () => {
  const list = await api.menuRender();
  show(list);
};
scenario();