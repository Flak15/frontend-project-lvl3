/* eslint no-param-reassign: ["error", { "props": false }] */

import * as yup from 'yup';
import _ from 'lodash';

import i18next from 'i18next';
import { ru as dateRu } from 'date-fns/locale';
import { formatRelative } from 'date-fns';
import ru from './locales/ru';
import initView from './view';
import { parseRss, getRssFeed } from './util';

const getLangLocale = (language) => {
  if (language === 'ru') {
    return dateRu;
  }
  return null;
};

const getSchema = (feeds) => yup.object()
  .shape({
    url: yup
      .string()
      .url()
      .notOneOf(feeds.map((feed) => feed.url))
      .required(),
  });

export const addListenersToRemoveFeedBtns = (removeFeedBtns, state, watchedState) => {
  removeFeedBtns.forEach((removeFeedBtn) => {
    removeFeedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const btn = e.target.closest('.close');
      watchedState.feeds = state.feeds.filter((feed) => feed.id !== btn.id);
      watchedState.posts = state.posts.filter((post) => post.feedId !== btn.id);
    });
  });
};

const app = () => {
  const state = {
    feeds: [],
    posts: [],
    urlForm: {
      errors: [],
      inputValue: '',
      formState: 'idle',
    },
  };

  const elements = {
    input: document.querySelector('#basic-url'),
    button: document.querySelector('#add'),
    mountContainer: document.querySelector('#mount'),
    feedBackContainer: document.querySelector('#invalid-feedback'),
    form: document.querySelector('#rssInputAddressForm'),
    feedList: document.querySelector('#feed-list'),
  };

  i18next.init({
    lng: 'ru',
    resources: { ru },
    interpolation: {
      format(value, format, lng) {
        if (value instanceof Date) {
          return formatRelative(value, new Date(), { locale: getLangLocale(lng) });
        }
        return value;
      },
    },
  }); //then?

  const watchedState = initView(state, elements, i18next);

  const updatePosts = () => {
    if (state.feeds.length === 0) {
      setTimeout(() => updatePosts(), 5000);
      return;
    }
    const newPostsPromises = state.feeds.map((feed) => getRssFeed(feed.url)
      .then((rssString) => {
        const parsedRss = parseRss(rssString);
        const newPosts = parsedRss.posts
          .filter((post) => post.pubDate > feed.updateDate)
          .map((post) => ({ ...post, feedId: feed.id }));
        const lastPost = _.maxBy(parsedRss.posts, (post) => post.pubDate);
        feed.updateDate = lastPost.pubDate;
        return newPosts;
      }).catch((e) => console.log('Error while updating posts: ', e)));
    Promise.all(newPostsPromises).then((postsLists) => {
      postsLists.forEach((newPosts) => {
        watchedState.posts.push(...newPosts);
      });
    }).then(() => setTimeout(() => updatePosts(), 5000));
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.urlForm.formState !== 'valid') {
      return;
    }
    const newUrl = state.urlForm.inputValue;
    watchedState.urlForm.formState = 'loading';
    getRssFeed(newUrl).then((rawRss) => {
      const parsedRss = parseRss(rawRss);
      const lastPost = _.maxBy(parsedRss.posts, (post) => post.pubDate);
      const newFeed = {
        id: _.uniqueId(),
        url: newUrl,
        name: parsedRss.title,
        updateDate: lastPost.pubDate,
      };
      watchedState.feeds.push(newFeed);
      const newPosts = parsedRss.posts.map((post) => ({ ...post, feedId: newFeed.id }));
      watchedState.posts.push(...newPosts);
      watchedState.urlForm.formState = 'idle';
    }).catch((error) => {
      watchedState.urlForm.formState = 'idle';
      console.log('Error while adding new rss: ', error);
    });
  });

  elements.input.addEventListener('input', (event) => {
    event.preventDefault();
    watchedState.urlForm.inputValue = event.target.value;
    getSchema(state.feeds).validate({ url: event.target.value })
      .then(() => {
        watchedState.urlForm.errors = [];
        watchedState.urlForm.formState = 'valid';
      })
      .catch((err) => {
        watchedState.urlForm.errors = err.errors;
        watchedState.urlForm.formState = 'invalid';
      });
  });

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => updatePosts(), 5000);
  });
};

export default app;
