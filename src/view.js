import onChange from 'on-change';

/* eslint-disable no-param-reassign */
const addListenersToRemoveFeedBtns = (removeFeedBtns, state, watchedState) => {
  removeFeedBtns.forEach((removeFeedBtn) => {
    removeFeedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const btn = e.target.closest('.close');
      watchedState.feeds = state.feeds.filter((feed) => feed.id !== btn.id);
      watchedState.posts = state.posts.filter((post) => post.feedId !== btn.id);
    });
  });
};
/* eslint-enable no-param-reassign */

const renderPosts = (state, elements, i18next) => {
  const { mountContainer: container } = elements;
  const { posts } = state;
  container.innerHTML = '';
  posts.sort((a, b) => b.pubDate - a.pubDate).forEach((post) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.classList.add('mb-3');
    div.innerHTML = `
      <div class="card-body">
        <h5 class="card-title"><a href="${post.link}">${post.title}</a></h5>
        <hr class="my-4">
        <p class="card-text">${post.description}</p>
        <p class="card-text">${i18next.t('date', { date: post.pubDate })}</p>
        <p class="card-text">${i18next.t('feed')}: ${state.feeds.find((feed) => feed.id === post.feedId).name}</p>
      </div>`;
    container.appendChild(div);
  });
};

export default (state, elements, i18next) => {
  const watchedState = onChange(state, (path, value) => {
    const {
      input, button, feedBackContainer, feedList,
    } = elements;
    if (path === 'urlForm.formState') {
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
    } else if (path === 'feeds') {
      feedList.innerHTML = '';
      value.forEach((feed) => {
        const feedElement = document.createElement('div');
        feedElement.classList.add('mb-3');
        feedElement.innerHTML = `
          <button type="button" class="close" aria-label="Close" id="${feed.id}">
            <span aria-hidden="true">&times;</span>
          </button>
          <div>${feed.name}</div>`;
        feedList.appendChild(feedElement);
      });
      const removeFeedBtns = document.querySelectorAll('button.close');
      addListenersToRemoveFeedBtns(removeFeedBtns, state, watchedState);
    } else if (path === 'urlForm.errors') {
      feedBackContainer.innerHTML = value.join(', ');
    } else if (path.includes('posts')) {
      renderPosts(state, elements, i18next);
    }
  });

  return watchedState;
};
