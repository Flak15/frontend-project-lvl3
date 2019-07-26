import fs from 'fs';
import path from 'path';
import Nightmare from 'nightmare';
import init from '../src/init';
import timer from 'timer-promise';

beforeEach(() => {
  const pathToHtml = path.resolve(__dirname, '__fixtures__/index.html');
  const res = fs.readFileSync(pathToHtml, 'utf8');
  document.documentElement.innerHTML = res;
  init();
});


// test('duckduckgo', () => {
//   init();
//   const nightmare = new Nightmare({ show: true });
//   nightmare
//     .goto('https://localhost:8080')
//     .evaluate(() => document.querySelector('.jumbotron p').innerText)
//     .then(r => expect(r).toBe('17 апреля 2019'));
//     // .type('#basic-url', 'https://raw.githubusercontent.com/Flak15/frontend-project-lvl3/master/__tests__/__fixtures__/stream.rss')
//     // .click('#add')
//     // .wait('.jumbotron')
//
//
// });
test('test', () => {

  expect(document.body.innerHTML).toMatchSnapshot();
  const input = document.querySelector('#basic-url');
  const button = document.querySelector('#add');
  input.value = 'https://raw.githubusercontent.com/Flak15/frontend-project-lvl3/master/__tests__/__fixtures__/stream.rss';
  button.disabled = false;
  button.click();
  timer.start(100).then(() => expect(setInterval(() => document.body.innerHTML, 3000)).toMatchSnapshot());
  //setInterval( , 3000);


});
