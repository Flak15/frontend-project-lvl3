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
    info: 'empty',
  };

  const inputForm = document.querySelector('#rssInputAddressForm');
  const buttonAddSource = document.querySelector('#add');
  const container = document.querySelector('#mount');
  const input = document.querySelector('#basic-url');
  const info = document.querySelector('#info');
  const parser = new DOMParser();

  const getRSSFeed = url => axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then(res => res.data);

  const parseRSS = rssString => parser.parseFromString(rssString, 'application/xml');

  const getRSSItems = (xmlDoc) => {
    const items = xmlDoc.querySelectorAll('item');
    const source = xmlDoc.querySelector('channel title');
    return Array.from(items).map(item => new RSSItem(item, source));
  };

  const updateItems = () => {
    if (state.sources.length === 0) return;
    const feeds = state.sources.map(source => getRSSFeed(source));
    Promise.all(feeds).then((rssFeeds) => {
      rssFeeds.forEach((rss) => {
        const xmlDoc = parseRSS(rss);
        state.newItems = getRSSItems(xmlDoc).filter(item => item.pubDate > state.lastUpdate);
      });
    }).then(() => setTimeout(updateItems, 5000));
  };

  const addNewSource = (url) => {
    state.sources = [...state.sources, url];
    getRSSFeed(url).then((rss) => {
      const xmlDoc = parseRSS(rss);
      const newItems = getRSSItems(xmlDoc);
      state.newItems = newItems;
      state.info = 'empty';
    }).then(() => setTimeout(updateItems, 5000));
  };

  input.addEventListener('change', () => {https://github.com/Flak15/frontend-project-lvl3.git
    state.inputValue = input.value;
    if (validator.isURL(state.inputValue) && !state.sources.includes(state.inputValue)) {
      state.inputStatus = 'valid';
      state.info = 'empty';
    } else {
      state.inputStatus = 'invalid';
      state.info = 'wrongURL';
    }
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.info = 'loading';
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

  WatchJS.watch(state, 'info', () => {
    const infoStatusHandlers = {
      wrongURL() {
        info.innerHTML = 'Некорректный адрес RSS';
      },
      loading() {
        info.innerHTML = 'Загрузка...';
      },
      empty() {
        info.innerHTML = '';
      },
    };
    infoStatusHandlers[state.info]();
  });
};
