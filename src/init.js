import WatchJS from 'melanke-watchjs';
import validator from 'validator';
import axios from 'axios';
import RSSItem from './RSSItem';

export default () => {
  const state = {
    inputValue: '',
    sources: [],
    items: [],
    newItems: [],
    lastUpdate: 0,
    inputStatus: 'empty'
  };

  const addButton = document.querySelector('#add');
  const container = document.querySelector('#mount');
  const input = document.querySelector('#basic-url');
  const info = document.querySelector('#info');

  WatchJS.watch(state, 'newItems', () => {
    const { items, newItems } = state;
    newItems.slice().sort((a, b) => a.pubDate - b.pubDate)
      .map(item => container.prepend(item.render()));
    state.items = [...newItems, ...items];
    state.lastUpdate = state.items[0].pubDate;
  });

  const getRSSFeed = url => axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then((res) => {
    const parser = new DOMParser();
    return parser.parseFromString(res.data, 'application/xml');
  });


  const addNewSource = (url) => {
    state.sources = [...state.sources, url];
    getRSSFeed(url).then((document) => {
      const items = document.querySelectorAll('item');
      const source = document.querySelector('channel title');
      const newItems = Array.from(items).map(item => new RSSItem(item, source));
      state.newItems = newItems;
      info.innerHTML = '';
    });
  };

  const update = () => {
    if (state.sources.length === 0) return;
    const feeds = state.sources.map(source => getRSSFeed(source));
    Promise.all(feeds).then(docs => docs.map((document) => {
      const items = document.querySelectorAll('item');
      const source = document.querySelector('channel title');
      const newItems = Array.from(items)
        .map(item => new RSSItem(item, source))
        .filter(item => item.pubDate > state.lastUpdate);
      state.newItems = newItems;
      return null;
    }));
  };

  setInterval(update, 5000);

  WatchJS.watch(state, 'inputStatus', () => {

    const inputStatusHandlers = {
      valid() {
        addButton.disabled = false;
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        addButton.classList.remove('btn-secondary', 'btn-danger');
        addButton.classList.add('btn-success');
      },
      invalid() {
        addButton.disabled = true;
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        addButton.classList.remove('btn-secondary', 'btn-success');
        addButton.classList.add('btn-danger');
      },
      empty() {
        addButton.disabled = true;
        input.value = '';
        input.classList.remove('is-valid');
        addButton.classList.remove('btn-success');
        addButton.classList.add('btn-secondary');
      }
    };
    inputStatusHandlers[state.inputStatus]();
  });

  input.addEventListener('change', () => {
    state.input = input.value;
    state.inputStatus = validator.isURL(state.input) && !state.sources.includes(state.input) ? 'valid' : 'invalid';
    // alert(state.inputStatus);
  });

  addButton.addEventListener('click', () => {
    info.innerHTML = 'Загрузка...';
    addNewSource(state.input);
    state.inputStatus = 'empty';

  });
};
