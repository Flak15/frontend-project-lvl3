import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';

export default () => {
	const state = {
		inputValue: '',
		inputState: 'idle',
		urls: [], // { id: (num), url: (URL), updateDate: (DATE) }
		posts: [], // { sourseId: (num), id: (num), title: (string), description: (string), link: (URL), pubDate: (DATE) }
		schema: yup.object().shape({ url: yup.string().url().required() }),
		errors: []
	};
	const elements = {
		input: document.querySelector('#basic-url'),
		button: document.querySelector('#add'),
		mountContainer: document.querySelector('#mount'),
		feedBackContainer: document.querySelector('#invalid-feedback'),
		form: document.querySelector('#rssInputAddressForm'),
	};

	const getRssFeed = url => axios.get(`https://cors-anywhere.herokuapp.com/${url}`, { origin: '' }).then(res => res.data);
	
	const parseRss = rawRssString => (new DOMParser).parseFromString(rawRssString, 'application/xml');
	const parseXMLTextElement = element => Array.from(element.childNodes).map(child => child.nodeValue).join('');
	const getRssItems = (xmlDoc, sourceId) => {
		const items = xmlDoc.querySelectorAll('item');
		return Array.from(items).map(item => parseItem(item, sourceId));
	};
	const  parseItem = (xmlItem, sourceId) => {
		return {
			sourceId,
			title: parseXMLTextElement(xmlItem.querySelector('title')),
			description: parseXMLTextElement(xmlItem.querySelector('description')),
			link: xmlItem.querySelector('link').innerHTML,
			pubDate: new Date(xmlItem.querySelector('pubDate').innerHTML),
			id: _.uniqueId(),
		}
	};
	const watcherSelector = {
		inputState(value) {
			if (value === 'valid') {
				elements.input.classList.remove('is-invalid');
				elements.input.classList.add('is-valid');
				elements.button.disabled = false;
			} else if (value === 'invalid') {
				elements.input.classList.add('is-invalid');
				elements.input.classList.remove('is-valid');
				elements.button.disabled = true;
			} else if (value === 'idle') {
				elements.input.classList.remove('is-valid');
				elements.input.value = '';
			} else {
				throw new Error('Unknown state: ', value);
			}
		},
		inputValue() {},
		urls(value, prevValue) {
			const [newSource] = _.xor(value, prevValue);
			getRssFeed(newSource.url).then((rawRss) => {
				const xmlDoc = parseRss(rawRss);
				newSource.name = xmlDoc.querySelector('channel title').innerHTML;
				newSource.lastUpdate = new Date();
				const newPosts = getRssItems(xmlDoc, newSource.id);
				watchedState.posts = [...state.posts, ...newPosts];
			});
		},
		errors(value) {
			elements.feedBackContainer.innerHTML = value.join(', ');
		},
		schema() {},
		posts(value) {
			renderPosts(value);
		},
	};
	const renderPosts = (posts) => {
		elements.mountContainer.innerHTML = '';
		posts.sort((a,b) => b.pubDate - a.pubDate).forEach((post) => {
			const div = document.createElement('div');
			div.classList.add('card');
			div.classList.add('mb-3');
			div.innerHTML = `
				<div class="card-body">
					<h5 class="card-title"><a href="${post.link}">${post.title}</a></h5>
					<hr class="my-4">
					<p class="card-text">${post.pubDate}</p>
					<p class="card-text">Источник: ${state.urls.find(source => source.id === post.sourceId).name}</p>
				</div>`;
			elements.mountContainer.appendChild(div);
		});
	};
	const updatePosts = () => {
		state.urls.forEach(source => {
			getRssFeed(source.url).then((rawRss) => {
				const xmlDoc = parseRss(rawRss);
				
				
				// const newPosts = getRssItems(xmlDoc, source.id);

				// watchedState.posts = [...state.posts, ...newPosts];
			});
		})
	};
	//<p class="card-text">${format(post.pubDate, 'dd MMMM yyyy', { locale: ru })}</p>
//${this.getModal(this)}


	const getSchema = () => yup.object()
		.shape({ url: yup.string().url().notOneOf(state.urls.map(source => source.url)).required() });
	const watchedState = onChange(state, (path, value, prevValue) => {
		watcherSelector[path](value, prevValue);
	});
	elements.form.addEventListener('submit', (e) => {
		e.preventDefault();
		
		if (state.inputState === 'valid') {
			watchedState.urls.push({ id: _.uniqueId(), url: state.inputValue });
			watchedState.schema = getSchema();
			watchedState.inputState = 'idle';
			
		}
	});
	elements.input.addEventListener('input', (e) => {
		e.preventDefault();
		watchedState.inputValue = e.target.value;
		state.schema.validate({ url: e.target.value })
			.then(() => {
				watchedState.errors = [];
				watchedState.inputState = 'valid';
			})
			.catch(err => {
				watchedState.errors = err.errors;
				watchedState.inputState = 'invalid';
			});

	});
};
