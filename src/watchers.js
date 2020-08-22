import { state, elements} from './app';
import closeBtnListener from "./app";
import {renderPosts} from './app'

const selectWatcher = (path, value, prevValue, watchers) => {
	if (path === 'inputState') {
		watchers[path](value);
	} else if (path === 'sources') {
		watchers[path](value, closeBtnListener);
	} else if (path === 'errors') {
		watchers[path](value);
	} else if (path === 'posts') {
		watchers[path](value);
	}
};

export default (path, value, prevValue) => {
	const watchers = {
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
				elements.input.disabled = false;
				elements.button.disabled = false;
			} else if (value === 'loading') {
				elements.input.classList.remove('is-valid');
				elements.input.disabled = true;
				elements.button.disabled = true;
			} else {
				throw new Error('Unknown state: ', value);
			}
		},
		sources(value, closeBtnListener) {
			elements.sourceList.innerHTML = '';
			value.forEach((source) => {
				const div = document.createElement('div');
				div.classList.add('mb-3');
				div.innerHTML = `
					<button type="button" class="close" aria-label="Close" id="${source.id}">
						<span aria-hidden="true">&times;</span>
					</button>
					<div>${source.name}</div>`;
				elements.sourceList.appendChild(div);
			});
			document.querySelectorAll('.close').forEach(closeBtnListener);
		},
		errors(value) {
			elements.feedBackContainer.innerHTML = value.join(', ');
		},
		posts() {
			renderPosts(state);
		},
	};
	return selectWatcher(path, value, prevValue, watchers);
}