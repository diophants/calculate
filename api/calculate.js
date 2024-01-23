//создать ws://localhost:8000/calculator
class ParseMethod {
  coll(key) {
    key = this[key];
    if (typeof key === 'function') {
      return key();
    }
  }
  one() {
    return 1;
  }
  two() {
    return 2;
  }
  three() {
    return 3;
  }
  mult() {
    return 10;
  }
  exp() {}
}

const expressions = [
  ['one', '1'],
  ['two', '2'],
  ['three', '3'],
  ['four', '4'],
  ['five', '5'],
  ['six', '6'],
  ['seven', '7'],
  ['eight', '8'],
  ['nine', '9'],
  ['dot', '.'],
  ['zero', '0'],
  ['clear', 'C'],
  ['equally', '='],
  ['plus', '+'],
  ['minus', '-'],
  ['mult', '*'],
  ['div', '/'],
];

const method = new ParseMethod(expressions);
module.exports = function (name) {
  if (!arguments.length) {
    return expressions;
  }

  return method.coll(name);
  return [name]();
};
