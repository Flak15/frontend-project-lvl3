import _ from 'lodash';
import axios from 'axios';

export const parseRss = (data) => {
  const xmlDoc = (new DOMParser()).parseFromString(data, 'application/xml');
  const items = xmlDoc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').innerHTML,
    pubDate: new Date(item.querySelector('pubDate').innerHTML),
    id: _.uniqueId(),
  }));
  return {
    title: xmlDoc.querySelector('channel title').textContent,
    posts,
  };
};

export const getRssFeed = (url) => axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then((res) => res.data);
