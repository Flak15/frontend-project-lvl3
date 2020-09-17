/* eslint no-param-reassign: "error" */

import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

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

export const initView = (watchedState, state, elements) => {
  const updatePosts = () => {
    if (state.sources.length === 0) {
      setTimeout(() => updatePosts(), 5000);
      return;
    }
    const newPostPromises = state.sources.map(source => getRssFeed(source.url).then((rssString) => {
      const parsedRss = parseRss(rssString);
      const newPosts = parsedRss.posts.filter(post => post.pubDate > source.updateDate);
      newPosts.forEach(post => _.set(post, 'sourceId', source.id));
      source.updateDate = parsedRss.lastPubDate;
      return newPosts;
    }).catch(e => console.log('error: ', e)));
    Promise.all(newPostPromises).then((postsArrays) => {
      postsArrays.forEach((newPosts) => {
        watchedState.posts = [...state.posts, ...newPosts];
      });
    }).then(() => setTimeout(() => updatePosts(), 5000))
      .catch(err => console.log('Error while updating posts: ', err));
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.inputState !== 'valid') {
      return;
    }
    const newUrl = state.inputValue;
    watchedState.inputState = 'loading';
    getRssFeed(newUrl).then((rawRss) => {
      const parsedRss = parseRss(rawRss);
      const newSource = {
        id: _.uniqueId(),
        url: newUrl,
        name: parsedRss.title,
        updateDate: parsedRss.lastPubDate,
      };
      watchedState.sources = [...state.sources, newSource];
      const newPosts = parsedRss.posts;
      newPosts.forEach(post => _.set(post, 'sourceId', newSource.id));
      watchedState.posts = [...state.posts, ...newPosts];
      watchedState.inputState = 'idle';
    }).catch((error) => {
      watchedState.inputState = 'idle';
      console.log('Error while adding new rss: ', error);
    });
  });

  elements.input.addEventListener('input', (event) => {
    event.preventDefault();
    watchedState.inputValue = event.target.value;
    getSchema(state.sources).validate({ url: event.target.value })
      .then(() => {
        watchedState.errors = [];
        watchedState.inputState = 'valid';
      })
      .catch((err) => {
        watchedState.errors = err.errors;
        watchedState.inputState = 'invalid';
      });
  });
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => updatePosts(), 5000);
  });
};
