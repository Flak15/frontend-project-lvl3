import { renderPosts, getSchema } from './app';

const closeBtnListener = (closeBtn, state, watchedState) => {
  closeBtn.addEventListener('click', (e) => {
    const btn = e.target.closest('.close');
    watchedState.sources = state.sources.filter(source => source.id !== btn.id);
    watchedState.posts = state.posts.filter(post => post.sourceId !== btn.id);
    watchedState.schema = getSchema(state.sources);
  });
};

export default (path, value, elements, state, watchedState) => {
  const {
    input, button, feedBackContainer, sourceList,
  } = elements;
  if (path === 'inputState') {
    if (value === 'valid') {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      button.disabled = false;
    } else if (value === 'invalid') {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      button.disabled = true;
    } else if (value === 'idle') {
      input.classList.remove('is-valid');
      input.value = '';
      input.disabled = false;
      button.disabled = false;
    } else if (value === 'loading') {
      input.classList.remove('is-valid');
      input.disabled = true;
      button.disabled = true;
    } else {
      throw new Error('Unknown state: ', value);
    }
  } else if (path === 'sources') {
    sourceList.innerHTML = '';
    value.forEach((source) => {
      const sourceElement = document.createElement('div');
      sourceElement.classList.add('mb-3');
      sourceElement.innerHTML = `
        <button type="button" class="close" aria-label="Close" id="${source.id}">
          <span aria-hidden="true">&times;</span>
        </button>
        <div>${source.name}</div>`;
      sourceList.appendChild(sourceElement);
    });
    document.querySelectorAll('button.close').forEach(closeBtn => closeBtnListener(closeBtn, state, watchedState));
  } else if (path === 'errors') {
    feedBackContainer.innerHTML = value.join(', ');
  } else if (path === 'posts') {
    renderPosts(state, elements);
  }
};
