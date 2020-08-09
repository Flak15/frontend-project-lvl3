import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';

export default () => {
	const state = {
		inputValue: '',
		urls: [],
		schema:  yup.object().shape({ url: yup.string().url().notOneOf(state.urls).required() }),
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

	});
	elements.form.addEventListener('submit', (e) => {
		e.preventDefault();
		// alert(watchedState.inputValue);
		getSchema().isValid({ url: state.inputValue })
			.then((valid) => {
				alert('Is valid: ' + valid);
				if (valid) {
					watchedState.urls.push(watchedState.inputValue);
					console.log(watchedState.urls);
				}
			});
	});
	elements.input.addEventListener('input', (e) => {
		e.preventDefault();
		watchedState.inputValue = e.target.value;
		state.schema 
	});
};
