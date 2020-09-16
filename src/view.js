
export default () => {
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.inputState !== 'valid') {
      return;
    }
    const newUrl = state.inputValue;
    watchedState.inputState = 'loading';
    getRssFeed(newUrl).then((rawRss) => {
      const parsedRss = parse(rawRss);
      const newSource = {
        id: _.uniqueId(),
        url: newUrl,
        name: parsedRss.title,
        updateDate: parsedRss.lastPubDate,
      };
      watchedState.sources = [...state.sources, newSource];
      const newPosts = parsedRss.posts;
      newPosts.forEach(post => _.set(post, 'sourceId', newSource.id));
      watchedState.posts = [...state.posts, ...newPosts];
      watchedState.inputState = 'idle';
    }).catch((error) => {
      watchedState.inputState = 'idle';
      console.log('Error while adding new rss: ', error);
    });
  });
  
  elements.input.addEventListener('input', (event) => {
    event.preventDefault();
    watchedState.inputValue = event.target.value;
    getSchema(state.sources).validate({ url: event.target.value })
      .then(() => {
        watchedState.errors = [];
        watchedState.inputState = 'valid';
      })
      .catch((err) => {
        watchedState.errors = err.errors;
        watchedState.inputState = 'invalid';
      });
  });
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => updatePosts(), 5000);
  });
}
