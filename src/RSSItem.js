export default class RSSItem {
  constructor(xmlItem) {
    this.title = xmlItem.querySelector('title').innerHTML;
    this.description = xmlItem.querySelector('description').innerHTML;
    this.link = xmlItem.querySelector('link').innerHTML;
    this.pubDate = new Date(xmlItem.querySelector('pubDate').innerHTML);
  }


  render() {
    const jumbotron = document.createElement('div');
    jumbotron.classList.add('jumbotron');
    jumbotron.innerHTML = `<div class="jumbotron">
        <h1 class="display-4">${this.title}</h1>
        <p class="lead">${this.description}</p>
        <hr class="my-4">
        <p>${(this.pubDate.toDateString())}</p>
        <a class="btn btn-primary btn-lg" href="${this.link}" role="button">Learn more</a>
      </div>`;
    return jumbotron;
  }
}
