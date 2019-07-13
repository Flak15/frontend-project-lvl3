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
  };

  const addButton = document.querySelector('#add');
  const container = document.querySelector('#mount');
  const input = document.querySelector('#basic-url');
  const info = document.querySelector('#info');
  WatchJS.watch(state, 'items', () => {
    const { items } = state;
    items.map(item => container.append(item.render()));
  });

  const request = (url) => {
    axios.get(url).then((res) => {
      info.innerHTML = '';
      const parser = new DOMParser();
      const document = parser.parseFromString(res.data, 'application/xml');
      const items = document.querySelectorAll('item');
      const source = document.querySelector('channel title');
      const newItems = Array.from(items).map(item => new RSSItem(item, source));
      state.items = [...state.items, ...newItems].sort((a, b) =>  b.pubDate - a.pubDate);
    });
  };

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
    request(`https://cors-anywhere.herokuapp.com/${state.input}`);
    state.sources = [...state.sources, state.input];
    input.value = '';
    input.classList.remove('is-valid');
    addButton.classList.remove('btn-success');
    addButton.classList.add('btn-secondary');
  });

  // $(document).on('mouseover', '.descr', (e) => alert(e.target.closest('div').querySelector('.lead').innerHTML));
};
