/* eslint no-param-reassign: "error" */

import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru';
import { initView, addCloseBtnListeners } from './view';

export const renderPosts = (state, elements) => {
  const { mountContainer: container } = elements;
  const { posts } = state;
  container.innerHTML = '';
  posts.sort((a, b) => b.pubDate - a.pubDate).forEach((post) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.classList.add('mb-3');
    div.innerHTML = `
      <div class="card-body">
        <h5 class="card-title"><a href="${post.link}">${post.title}</a></h5>
        <hr class="my-4">
        <p class="card-text">${post.description}</p>
        ${post.img ? 'img' : ''}
        <p class="card-text">${i18next.t('date', { date: post.pubDate, language: i18next.language })}</p>
        <p class="card-text">${i18next.t('source')}: ${state.sources.find(source => source.id === post.sourceId).name}</p>
      </div>`;
    container.appendChild(div);
  });
};

const app = () => {
  const state = {
    inputValue: '',
    inputState: 'idle',
    sources: [],
    posts: [],
    errors: [],
  };
  const elements = {
    input: document.querySelector('#basic-url'),
    button: document.querySelector('#add'),
    mountContainer: document.querySelector('#mount'),
    feedBackContainer: document.querySelector('#invalid-feedback'),
    form: document.querySelector('#rssInputAddressForm'),
    sourceList: document.querySelector('#source-list'),
  };
  i18next.init({
    lng: 'ru',
    resources: { ru },
    interpolation: {
      format(value, format) {
        if (value instanceof Date) {
          return new Intl.DateTimeFormat(format, {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(value);
        }
        return value;
      },
    },
  });
  const watchedState = onChange(state, (path, value) => {
    const {
      input, button, feedBackContainer, sourceList,
    } = elements;
    if (path === 'inputState') {
      if (value === 'valid') {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        button.disabled = false;
      } else if (value === 'invalid') {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        button.disabled = true;
      } else if (value === 'idle') {
        input.classList.remove('is-valid');
        input.value = '';
        input.disabled = false;
        button.disabled = false;
      } else if (value === 'loading') {
        input.classList.remove('is-valid');
        input.disabled = true;
        button.disabled = true;
      } else {
        throw new Error('Unknown state: ', value);
      }
    } else if (path === 'sources') {
      sourceList.innerHTML = '';
      value.forEach((source) => {
        const sourceElement = document.createElement('div');
        sourceElement.classList.add('mb-3');
        sourceElement.innerHTML = `
          <button type="button" class="close" aria-label="Close" id="${source.id}">
            <span aria-hidden="true">&times;</span>
          </button>
          <div>${source.name}</div>`;
        sourceList.appendChild(sourceElement);
      });
      const closeButtons = document.querySelectorAll('button.close');
      addCloseBtnListeners(closeButtons, state, watchedState);

      // renderSourceList(value, sourceList, watchedState);
    } else if (path === 'errors') {
      feedBackContainer.innerHTML = value.join(', ');
    } else if (path === 'posts') {
      renderPosts(state, elements);
    }
  });

  initView(watchedState, state, elements);
};

export default app;
