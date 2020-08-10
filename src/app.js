import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';

export default () => {
	const state = {
		inputValue: '',
		inputState: 'idle',
		urls: [],
		schema:  yup.object().shape({ url: yup.string().url().required() }),
		errors: []
	};
	const elements = {
		input: document.querySelector('#basic-url'),
		button: document.querySelector('#add'),
		mountContainer: document.querySelector('#mount'),
		feedBackContainer: document.querySelector('#invalid-feedback'),
		form: document.querySelector('#rssInputAddressForm'),
	};
	const watcherSelector = {
		inputState(value) {
			elements.feedBackContainer.innerHTML = value;
			if (value === 'invalid') {
				elements.feedBackContainer.innerHTML = state.errors.join(', ');
			}
		},
		inputValue() {},
		urls() {

		},
		inputState() {

		},
		errors() {

		},
		schema() {

		}
	};

	const getSchema = () => yup.object().shape({ url: yup.string().url().notOneOf(state.urls).required() });
	const watchedState = onChange(state, (path, value, prevValue) => {
		console.log(path);
		watcherSelector[path](value, prevValue);
	});
	elements.form.addEventListener('submit', (e) => {
		e.preventDefault();
		if (state.inputState === 'valid') {
			watchedState.urls.push(watchedState.inputValue);
			watchedState.schema = getSchema();
			watchedState.inputState = 'idle';
		}
	});
	elements.input.addEventListener('input', (e) => {
		e.preventDefault();
		watchedState.inputValue = e.target.value;
		state.schema.validate({ url: e.target.value })
			.then(() => watchedState.inputState = 'valid')
			.catch(err => {
				watchedState.errors = err.errors;
				watchedState.inputState = 'invalid';
				
				
			});

	});
};
