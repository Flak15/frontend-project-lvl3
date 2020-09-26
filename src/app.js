/* eslint no-param-reassign: ["error", { "props": false }] */

import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import initView from './view';

const parseRss = (data) => {
  const xmlDoc = (new DOMParser()).parseFromString(data, 'application/xml');
  const items = xmlDoc.querySelectorAll('item');
  const posts = Array.from(items).map(item => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').innerHTML,
    pubDate: new Date(item.querySelector('pubDate').innerHTML),
    id: _.uniqueId(),
  }));
  return {
    title: xmlDoc.querySelector('channel title').textContent,
    lastPubDate: _.maxBy(posts, post => post.pubDate).pubDate,
    posts,
  };
};

const getRssFeed = url => axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then(res => res.data);

const getSchema = sources => yup.object()
  .shape({ url: yup.string().url().notOneOf(sources.map(source => source.url)).required() });

export const addCloseBtnListeners = (closeButtons, state, watchedState) => {
  closeButtons.forEach((closeBtn) => {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const btn = e.target.closest('.close');
      watchedState.sources = state.sources.filter(source => source.id !== btn.id);
      watchedState.posts = state.posts.filter(post => post.sourceId !== btn.id);
    });
  });
};

const app = () => {
  const state = {
    sources: [],
    posts: [],
    urlForm: {
      errors: [],
      inputValue: '',
      inputState: 'idle',
    },
  };

  const elements = {
    input: document.querySelector('#basic-url'),
    button: document.querySelector('#add'),
    mountContainer: document.querySelector('#mount'),
    feedBackContainer: document.querySelector('#invalid-feedback'),
    form: document.querySelector('#rssInputAddressForm'),
    sourceList: document.querySelector('#source-list'),
  };

  const watchedState = initView(state, elements);

  const updatePosts = () => {
    if (state.sources.length === 0) {
      setTimeout(() => updatePosts(), 5000);
      return;
    }
    const newPostsPromises = state.sources.map(source => getRssFeed(source.url)
      .then((rssString) => {
        const parsedRss = parseRss(rssString);
        const newPosts = parsedRss.posts
          .filter(post => post.pubDate > source.updateDate)
          .map(post => ({ ...post, sourceId: source.id }));
        source.updateDate = parsedRss.lastPubDate;
        return newPosts;
      }).catch(e => console.log('Error while updating posts: ', e)));
    Promise.all(newPostsPromises).then((postsLists) => {
      postsLists.forEach((newPosts) => {
        watchedState.posts.push(...newPosts);
      });
    }).then(() => setTimeout(() => updatePosts(), 5000));
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.urlForm.inputState !== 'valid') {
      return;
    }
    const newUrl = state.urlForm.inputValue;
    watchedState.urlForm.inputState = 'loading';
    getRssFeed(newUrl).then((rawRss) => {
      const parsedRss = parseRss(rawRss);
      const newSource = {
        id: _.uniqueId(),
        url: newUrl,
        name: parsedRss.title,
        updateDate: parsedRss.lastPubDate,
      };
      watchedState.sources.push(newSource);
      const newPosts = parsedRss.posts.map(post => ({ ...post, sourceId: newSource.id }));
      watchedState.posts.push(...newPosts);
      watchedState.urlForm.inputState = 'idle';
    }).catch((error) => {
      watchedState.urlForm.inputState = 'idle';
      console.log('Error while adding new rss: ', error);
    });
  });

  elements.input.addEventListener('input', (event) => {
    event.preventDefault();
    watchedState.urlForm.inputValue = event.target.value;
    getSchema(state.sources).validate({ url: event.target.value })
      .then(() => {
        watchedState.urlForm.errors = [];
        watchedState.urlForm.inputState = 'valid';
      })
      .catch((err) => {
        watchedState.urlForm.errors = err.errors;
        watchedState.urlForm.inputState = 'invalid';
      });
  });

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => updatePosts(), 5000);
  });
};

export default app;
