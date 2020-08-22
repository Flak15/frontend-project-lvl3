import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import ru from './locales/ru';
import getWatcher from './watchers';
/** 
 * 1. Add internationalization - DONE
 * 2. Add sources list with deletion -DONE
 * 3. Fix layout
 * 4. Error proccessing
 * 5. Add waiting circe while 'loading'
 * 6. Pictures in posts
 * */ 
const getRssFeed = url => axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then(res => res.data);
const parseRss = rawRssString => (new DOMParser()).parseFromString(rawRssString, 'application/xml');
const parseItem = (xmlItem, sourceId) => ({
	sourceId,
	title: xmlItem.querySelector('title').textContent,
	description: xmlItem.querySelector('description').textContent,
	link: xmlItem.querySelector('link').innerHTML,
	pubDate: new Date(xmlItem.querySelector('pubDate').innerHTML),
	id: _.uniqueId(),
});
const getRssItems = (xmlDoc, sourceId) => {
	const items = xmlDoc.querySelectorAll('item');
	return Array.from(items).map(item => parseItem(item, sourceId));
};
export const renderPosts = (state) => {
	elements.mountContainer.innerHTML = '';
	const {posts} = state;
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
		elements.mountContainer.appendChild(div);
	});
};

const getNewPosts = (xmlDoc, source) => {
	const items = xmlDoc.querySelectorAll('item');
	const newItems = Array.from(items).map((xmlItem) => {
		const pubDate = new Date(xmlItem.querySelector('pubDate').textContent);
		if (pubDate > source.updateDate) {
			return {
				sourceId: source.id,
				title: xmlItem.querySelector('title').textContent,
				description: xmlItem.querySelector('description').textContent,
				link: xmlItem.querySelector('link').innerHTML,
				pubDate,
				id: _.uniqueId(),
			};
		}
		return '';
	});
	return _.compact(newItems);
};
const getSchema = sources => yup.object()
	.shape({ url: yup.string().url().notOneOf(sources.map(source => source.url)).required() });
const updatePosts = (state) => {
	console.log('Update', new Date());
	if (state.sources.length === 0) {
		setTimeout(updatePosts, 5000);
		return;
	}
	const newPostPromises = state.sources.map(source => getRssFeed(source.url)
		.then((rssString) => {
			const xmlDoc = parseRss(rssString);
			const newPosts = getNewPosts(xmlDoc, source);
			watchedState.sources.find(src => src.id === source.id).updateDate = new Date();
			return newPosts;
		}).catch(e => console.log('error: ', e)));
	Promise.all(newPostPromises).then((postsArrays) => {
		postsArrays.forEach((newPosts) => {
			watchedState.posts = _.union(state.posts, newPosts);
		});
	}).then(() => setTimeout(() => updatePosts(state), 5000));
};
export const closeBtnListener = (closeBtn) => {
	closeBtn.addEventListener('click', (e) => {
		const btn = e.target.closest('.close');
		watchedState.sources = state.sources.filter(source => source.id !== btn.id);
		watchedState.posts = state.posts.filter(post => post.sourceId !== btn.id);
		watchedState.schema = getSchema(state.sources);
	});
};
export default () => {
	 const state = {
		inputValue: '',
		inputState: 'idle',
		sources: [],
		posts: [],
		schema: yup.object().shape({ url: yup.string().url().required() }),
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
		debug: true,
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
	const watchedState = onChange(state, getWatcher);
	elements.form.addEventListener('submit', (e) => {
		e.preventDefault();
		if (state.inputState === 'valid') {
			const newUrl = state.inputValue;
			const newSource = { id: _.uniqueId(), url: newUrl };
			watchedState.inputState = 'loading';
			getRssFeed(newUrl).then((rawRss) => {
				const xmlDoc = parseRss(rawRss);
				newSource.name = xmlDoc.querySelector('channel title').textContent;
				newSource.updateDate = new Date();
				watchedState.sources = [...state.sources, newSource];
				watchedState.schema = getSchema(state.sources);
				const newPosts = getRssItems(xmlDoc, newSource.id);
				watchedState.posts = [...state.posts, ...newPosts];
				watchedState.inputState = 'idle';
			}).catch((error) => {
				watchedState.inputState = 'idle';
				console.log('error: ', error);
			});
		}
	});
	elements.input.addEventListener('input', (event) => {
		event.preventDefault();
		watchedState.inputValue = event.target.value;
		state.schema.validate({ url: event.target.value })
			.then(() => {
				watchedState.errors = [];
				watchedState.inputState = 'valid';
			})
			.catch((err) => {
				watchedState.errors = err.errors;
				watchedState.inputState = 'invalid';
			});
	});
	window.addEventListener('DOMContentLoaded', (event) => {
		setTimeout(() => updatePosts(state), 5000);
	});
	
};
