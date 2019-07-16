import WatchJS from 'melanke-watchjs';
import validator from 'validator';
import axios from 'axios';
import $ from 'jquery';
import RSSItem from './RSSItem';

export default () => {
  const state = {
    inputValue: '',
    sources: [],
    items: [],
    newItems:[],
    lastUpdate: 0,
  };

  const addButton = document.querySelector('#add');
  const container = document.querySelector('#mount');
  const input = document.querySelector('#basic-url');
  const info = document.querySelector('#info');

  WatchJS.watch(state, 'newItems', () => {
    const { items, newItems } = state;
    newItems.slice().sort((a, b) => a.pubDate - b.pubDate).map(item => container.prepend(item.render()));
    state.items = [...newItems, ...items];
    state.lastUpdate = state.items[0].pubDate;
  });

  const getRSSFeed = url => {
    return axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then((res) => {
      const parser = new DOMParser();
      return parser.parseFromString(res.data, 'application/xml');
    })
  };

  const addNewSource = (url) => {
    state.sources = [...state.sources, url];
    

    axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then((res) => {
      const parser = new DOMParser();
      const document = parser.parseFromString(res.data, 'application/xml');
      info.innerHTML = '';
      const items = document.querySelectorAll('item');
      const source = document.querySelector('channel title');
      const newItems = Array.from(items).map(item => new RSSItem(item, source));
      state.newItems = newItems;
    });
  };

  const update = () => {
    if (state.sources.length === 0) return;
    const url = state.sources[0];
    axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then((res) => {
      const parser = new DOMParser();
      const document = parser.parseFromString(res.data, 'application/xml');
      const items = document.querySelectorAll('item');
      const source = document.querySelector('channel title');
      source.innerHTML = 'new';
      const newItems = Array.from(items)
        .map(item => new RSSItem(item, source))
        .filter(item => item.pubDate > state.lastUpdate);
      state.newItems = newItems;
    });
  };



  //alert(getRSSFeed('http://lorem-rss.herokuapp.com/feed?unit=second&interval=4'));

  setInterval(update, 5000);

  input.addEventListener('change', () => {
    state.input = input.value;
    state.valid = validator.isURL(state.input) && !state.sources.includes(state.input);
    addButton.disabled = !state.valid;
    if (state.valid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      addButton.classList.remove('btn-secondary', 'btn-danger');
      addButton.classList.add('btn-success');
    } else {
      addButton.disabled = true;
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      addButton.classList.remove('btn-secondary', 'btn-success');
      addButton.classList.add('btn-danger');
    }
  });

  addButton.addEventListener('click', () => {
    info.innerHTML = 'Загрузка...';
    addNewSource(state.input);
    input.value = '';
    input.classList.remove('is-valid');
    addButton.classList.remove('btn-success');
    addButton.classList.add('btn-secondary');
  });

};
