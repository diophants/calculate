module.exports = () => {
  const output = document.getElementById('output');
  output.innerHTML = '';
  for (i = 0; i < 10; i++) {
    output.innerHTML += `<button>${i}</button>`;
  }
  return output;
};
