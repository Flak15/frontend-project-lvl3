const parseXMLTextElement = el => Array.from(el.childNodes).map(child => child.nodeValue).join('');

export default class RSSItem {
  constructor(xmlItem, source) {
    this.source = source.innerHTML;
    this.title = parseXMLTextElement(xmlItem.querySelector('title'));
    this.description = parseXMLTextElement(xmlItem.querySelector('description'));
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
        <p>${this.pubDate.toDateString()}</p>
        <p>Источник: ${this.source}</p>
        <a class="btn btn-primary btn-lg" href="${this.link}" role="button">Learn more</a>
        <a class="btn btn-info btn-lg" href="${this.link}" role="button" id="description">Show more</a>
      </div>`;
    return jumbotron;
  }
}
