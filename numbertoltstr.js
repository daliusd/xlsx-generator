let _numbers = {0: "nulis", 1: "vienas", 2: "du", 3: "trys", 4: "keturi", 5: "penki",
  6: "šeši", 7: "septyni", 8: "aštuoni", 9: "devyni", 10: "dešimt",
  11: "vienuolika", 12: "dvylika", 13:"trylika", 14: "keturiolika",
  15: "penkiolika", 16: "šešiolika", 17: "septyniolika",
  18: "aštuoniolika",  19: "devyniolika"
};

let _tens = {2: 'dvidešimt', 3: 'trisdešimt', 4: 'keturiasdešimt', 5: 'penkiasdešimt',
  6: 'šešiasdešimt', 7: 'septyniasdešimt', 8: 'aštuoniasdešimt', 9: 'devyniasdešimt'
};

let _forms = {
  'eur': ["euras", "eurai", "eurų"],
  '10x2': ["šimtas", "šimtai"], // third form not available as never used
  '10x3': ["tūkstantis", "tūkstančiai", "tūkstančių"],
  '10x6': ["milijonas", "milijonai", "milijonų"],
  '10x9': ["milijardas", "milijardai", "milijardų"],
  '10x12': ["trilijonas", "trilijonai", "trilijonų"],
  '10x15': ["kvadrilijonas", "kvadrilijonai", "kvadrilijonų"]
};

function getForm (number) {
  if ((number >= 10 && number <= 19) || number % 10 == 0) {
    return 2;
  }
  if (number % 10 === 1) {
    return 0;
  }
  else {
    return 1;
  }
}

function getNumberAsStr (number) {
  if (number < 20)
    return _numbers[number];
  let high = Math.trunc(number / 10) % 10;
  let low = number % 10;
  let tens = _tens[high];
  if (low != 0)
    return tens + ' ' + _numbers[low];
  return tens;
}

function getNumberToStrHundredsPart (number) {
  let hundreds = Math.trunc(number / 100);
  let remaining = number % 100;
  let hundredsStr = '';
  if (hundreds > 0) {
    hundredsStr = (hundreds === 1 ? '' : getNumberAsStr(hundreds) + ' ') + _forms['10x2'][getForm(hundreds)];
    if (remaining == 0) {
      return hundredsStr;
    }
    return hundredsStr + ' ' + getNumberAsStr(remaining);
  }
  return getNumberAsStr(remaining);
}

module.exports = function (number) {
  let result = '';
  let cents = number * 100 % 100;
  let intNumber = Math.trunc (number);
  
  let iter = 0;
  do {
    let numberStr = getNumberToStrHundredsPart (intNumber % 1000);

    numberStr += ' ' + _forms[iter === 0 ? 'eur' : '10x' + iter*3][getForm (intNumber % 100)];
    result = numberStr + (result.length > 0 ? ' ' : '') + result;
    
    iter += 1;
    intNumber = Math.trunc (intNumber / 1000);
  }
  while (intNumber > 0);

  return (result + ' ' + cents + ' ct');
}