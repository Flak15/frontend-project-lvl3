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
    inputStatus: 'empty',
  };

  const buttonAddSource = document.querySelector('#add');
  const container = document.querySelector('#mount');
  const input = document.querySelector('#basic-url');
  const info = document.querySelector('#info');

  const getRSSFeed = url => axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then((res) => {
    const parser = new DOMParser();
    return parser.parseFromString(res.data, 'application/xml');
  });

  const getItems = (xmlDoc) => {
    const items = xmlDoc.querySelectorAll('item');
    const source = xmlDoc.querySelector('channel title');
    return Array.from(items).map(item => new RSSItem(item, source));
  };

  const addNewSource = (url) => {
    state.sources = [...state.sources, url];
    getRSSFeed(url).then((document) => {
      const newItems = getItems(document);
      state.newItems = newItems;
      info.innerHTML = '';
    });
  };

  const updateItems = () => {
    if (state.sources.length === 0) return;
    const feeds = state.sources.map(source => getRSSFeed(source));
    Promise.all(feeds).then(docs => docs.map((document) => {
      const newItems = getItems(document).filter(item => item.pubDate > state.lastUpdate);
      state.newItems = newItems;
      return null;
    }));
  };

  input.addEventListener('change', () => {
    state.inputValue = input.value;
    state.inputStatus = validator.isURL(state.inputValue) && !state.sources.includes(state.inputValue) ? 'valid' : 'invalid';
  });

  buttonAddSource.addEventListener('click', () => {
    info.innerHTML = 'Загрузка...';
    addNewSource(state.inputValue);
    state.inputStatus = 'empty';
  });

  WatchJS.watch(state, 'newItems', () => {
    const { items, newItems } = state;
    newItems.slice().sort((a, b) => a.pubDate - b.pubDate)
      .map(item => container.prepend(item.render()));
    state.items = [...newItems, ...items];
    state.lastUpdate = state.items[0].pubDate;
  });

  WatchJS.watch(state, 'inputStatus', () => {
    const inputStatusHandlers = {
      valid() {
        buttonAddSource.disabled = false;
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        buttonAddSource.classList.remove('btn-secondary', 'btn-danger');
        buttonAddSource.classList.add('btn-success');
      },
      invalid() {
        buttonAddSource.disabled = true;
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        buttonAddSource.classList.remove('btn-secondary', 'btn-success');
        buttonAddSource.classList.add('btn-danger');
      },
      empty() {
        buttonAddSource.disabled = true;
        input.value = '';
        input.classList.remove('is-valid');
        buttonAddSource.classList.remove('btn-success');
        buttonAddSource.classList.add('btn-secondary');
      },
    };
    inputStatusHandlers[state.inputStatus]();
  });

  setInterval(updateItems, 5000);
};
