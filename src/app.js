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
	};
	const elements = {
		input: document.querySelector('#basic-url'),
		button: document.querySelector('#add'),
		mountContainer: document.querySelector('#mount'),
		infoContainer: document.querySelector('#info'),
		form: document.querySelector('#rssInputAddressForm'),
	};
	const getSchema = () => yup.object().shape({ url: yup.string().url().notOneOf(state.urls).required() });
	const watchedState = onChange(state, (path, value, prevValue) => {
		if (path === 'inputState') {
			elements.infoContainer.innerHtml = state.inputState;
		}
	});
	elements.form.addEventListener('submit', (e) => {
		e.preventDefault();
		if (state.inputState === 'valid') {
			watchedState.urls.push(watchedState.inputValue);
			watchedState.schema = getSchema();
			// alert(watchedState.inputValue);
			watchedState.inputState = 'idle';
		}
		
		
	});
	elements.input.addEventListener('input', (e) => {
		e.preventDefault();
		watchedState.inputValue = e.target.value;
		state.schema.isValid({ url: e.target.value }).then((valid) => {
			if (valid) {
				watchedState.inputState = 'valid';
			} else {
				watchedState.inputState = 'invalid';
			}
		})
	});
};
