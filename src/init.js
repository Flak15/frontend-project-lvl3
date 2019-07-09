import WatchJS from 'melanke-watchjs';
import RSSItem from './RSSItem';

export default () => {
  const state = {
    inputValue: '',
    sources: [],
    items: []
  };

  //const button = document.querySelector('#butt');
  const addButton = document.querySelector('#add');
  const container = document.querySelector('#mount');
  const input = document.querySelector('#basic-url');
  WatchJS.watch(state, 'items', () => state.items.map(item => container.append(item.render())) );

  const request = async (url) => {
    const res = await axios.get(url);
    const parser = new DOMParser();
    const document = parser.parseFromString(res.data, 'application/xml');
    const items = document.querySelectorAll('item');
    const newItems = Array.from(items).map(item => new RSSItem(item));
    state.items = [...state.items, ...newItems].sort((a, b) => a.pubDate < b.pubDate);
  }

  input.addEventListener('change', () =>  {
    state.input = input.value;
    state.valid = validator.isURL(state.input) && !state.sources.includes(state.input);
    addButton.disabled = !state.valid;
    if (state.valid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    } else {
      addButton.disabled = true;
      input.classList.remove('is-valid');
      input.classList.add('is-invalid')};
  });

  addButton.addEventListener('click', () => {
    if (state.valid) {
      request(`https://cors-anywhere.herokuapp.com/${state.input}`);
      state.sources = [...state.sources, state.input];
      input.value = '';
    } else {
      alert('wrong URL');
    }
  });
}
