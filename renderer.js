// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var XLSX = require('xlsx');
var XlsxTemplate = require('xlsx-template');

const ipc = require('electron').ipcRenderer
const path = require('path')
const fs = require('fs');

const Store = require('electron-store');
const store = new Store();

const selectTemplateBtn = document.getElementById('select-template')
const selectDataBtn = document.getElementById('select-data')
const selectOutputBtn = document.getElementById('select-output')
const generateBtn = document.getElementById('generate')

let templatePath = store.get('template');
let dataPath = store.get('data');
let outputPath = store.get('output');

document.getElementById('template').value = templatePath === undefined ? "" : templatePath;
document.getElementById('data').value = dataPath === undefined ? "" : dataPath;
document.getElementById('output').value = outputPath === undefined ? "" : outputPath;

selectTemplateBtn.addEventListener('click', function (event) {
  ipc.send('open-file-dialog-for-template');
})

ipc.on('selected-template-file', function (event, path) {
  templatePath = path[0];
  store.set('template', templatePath);
  document.getElementById('template').value = templatePath;
})

selectDataBtn.addEventListener('click', function (event) {
  ipc.send('open-file-dialog-for-data');
})

ipc.on('selected-data-file', function (event, path) {
  dataPath = path[0];
  store.set('data', dataPath);
  document.getElementById('data').value = dataPath;
})

selectOutputBtn.addEventListener('click', function (event) {
  ipc.send('open-folder-dialog-for-output');
})

ipc.on('selected-output-folder', function (event, path) {
  outputPath = path[0];
  store.set('output', outputPath);
  document.getElementById('output').value = outputPath;
})

generateBtn.addEventListener('click', function (event) {
  document.getElementById('info').innerHTML = 'Generate clicked. Trying to read: ' + dataPath;
  var data = XLSX.readFile(dataPath);

  var firstSheet = data.SheetNames[0];
  var worksheet = data.Sheets[firstSheet];
  var inputData = XLSX.utils.sheet_to_json (worksheet);

  document.getElementById('info').innerHTML = 'Reading template from: ' + templatePath;
  var templateData = fs.readFileSync (templatePath);
  document.getElementById('info').innerHTML = 'Template read';
  
  for (var idx = 0; idx < inputData.length; idx++) {
    document.getElementById('info').innerHTML = 'Substituting data: ' + JSON.stringify(inputData[idx]);
    
    var template = new XlsxTemplate(templateData);
    template.substitute('VU', inputData[idx]);

    document.getElementById('info').innerHTML = 'Generating output from template';
    var outData = template.generate();
    
    var outputFile = path.join(outputPath, idx.toString() + ".xlsx");
    document.getElementById('info').innerHTML = 'Writing file: ' + outputFile;
  
    fs.writeFileSync (outputFile, outData, 'binary');
  }
})
