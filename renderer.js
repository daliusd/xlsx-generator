// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var XLSX = require('xlsx');
var XlsxTemplate = require('xlsx-template');

const ipc = require('electron').ipcRenderer
const path = require('path')
const fs = require('fs');
const capitalize = require('capitalize')
const numberToLTstr = require('./numbertoltstr');

const Store = require('electron-store');
const store = new Store();

const selectTemplateBtn = document.getElementById('select-template')
const selectDataBtn = document.getElementById('select-data')
const selectOutputBtn = document.getElementById('select-output')
const generateBtn = document.getElementById('generate')

document.getElementById('template').value = store.get('template', '');
document.getElementById('data').value = store.get('data', '');
document.getElementById('output').value = store.get('output', '');

function resetLog () {
  document.getElementById('info').innerHTML = '';
}

function log(text) {
  document.getElementById('info').innerHTML += text + "<br/>";
}

selectTemplateBtn.addEventListener('click', function (event) {
  ipc.send('open-file-dialog-for-template');
})

ipc.on('selected-template-file', function (event, path) {
  document.getElementById('template').value = path[0];
})

selectDataBtn.addEventListener('click', function (event) {
  ipc.send('open-file-dialog-for-data');
})

ipc.on('selected-data-file', function (event, path) {
  document.getElementById('data').value = path[0];
})

selectOutputBtn.addEventListener('click', function (event) {
  ipc.send('open-folder-dialog-for-output');
})

ipc.on('selected-output-folder', function (event, path) {
  document.getElementById('output').value = path[0];
})

generateBtn.addEventListener('click', function (event) {
  try {
    resetLog();
    var templatePath = document.getElementById('template').value
    var dataPath = document.getElementById('data').value
    var outputPath = document.getElementById('output').value

    store.set('template', templatePath);
    store.set('data', dataPath);
    store.set('output', outputPath);

    if (templatePath === "" || dataPath === "" || outputPath === "") {
      log("Ne visi laukai užpildyti");
      return;
    }

    log('Generate clicked. Trying to read: ' + dataPath);
    var data = XLSX.readFile(dataPath);
  
    var firstSheet = data.SheetNames[0];
    var worksheet = data.Sheets[firstSheet];
    var inputData = XLSX.utils.sheet_to_json (worksheet);
  
    log('Reading template from: ' + templatePath);
    var templateWorkBook = XLSX.readFile(templatePath);
    var firstTemplateSheet = templateWorkBook.SheetNames[0];

    var templateData = fs.readFileSync (templatePath);
    log('Template read');
    
    for (var idx = 0; idx < inputData.length; idx++) {
      for (var key in inputData[idx]) {
        if (key.indexOf(',') !== -1) {
          var s = key.split(',');
          if (s[1] == "toltstr") {
            inputData[idx][key] = capitalize(numberToLTstr(parseFloat(inputData[idx][key])));
          }
        }
      }
      log('Substituting data: ' + JSON.stringify(inputData[idx]));

      var template = new XlsxTemplate(templateData);
      template.substitute(firstTemplateSheet, inputData[idx]);
  
      log('Generating output from template');
      var outData = template.generate();
      
      var outputFile = path.join(outputPath, idx.toString() + ".xlsx");
      log('Writing file: ' + outputFile);
    
      fs.writeFileSync (outputFile, outData, 'binary');
    }
  }
  catch (ex) {
    log(ex);
  }
})
