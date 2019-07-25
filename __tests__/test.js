import { promises as fs } from 'fs';
import path from 'path';
import Nightmare from 'nightmare';
import init from '../src/init';




beforeEach(() => {
  const pathToHtml = path.resolve(__dirname, '__fixtures__/index.html');
  fs.readFile(pathToHtml, 'utf8').then(res => document.body.innerHTML = res);
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
test('duckduckgo', () => {


  const nightmare = new Nightmare();



        // your actual testing urls will likely be `http://localhost:port/path`
        nightmare.goto('ttps://localhost:8080')
          .end()
          .then(function (result) { done() })
          .catch(done)
      

});
