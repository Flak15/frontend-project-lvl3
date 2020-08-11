import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';

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
	const getRSSFeed = url => axios.get(`https://cors-anywhere.herokuapp.com/${url}`).then(res => res.data);
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

			}
		},
		inputValue() {},
		urls(value, prevValue) {
			const newUrlId = _.xor(_.keys(value), _.keys(prevValue));

		},
		errors(value) {
			elements.feedBackContainer.innerHTML = value.join(', ');
		},
		schema() {}
	};



	const getSchema = () => yup.object().shape({ url: yup.string().url().notOneOf(state.urls).required() });
	const watchedState = onChange(state, (path, value, prevValue) => {
		watcherSelector[path](value, prevValue);
	});
	elements.form.addEventListener('submit', (e) => {
		e.preventDefault();
		
		if (state.inputState === 'valid') {
			watchedState.urls.push({ [_.uniqueId()]: state.inputValue });
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
