// import Modal from './Modal';
import _ from 'lodash';

const parseXMLTextElement = el => Array.from(el.childNodes).map(child => child.nodeValue).join('');

export default class RSSItem {
  constructor(xmlItem, source) {
    this.source = source.innerHTML;
    this.title = parseXMLTextElement(xmlItem.querySelector('title'));
    this.description = parseXMLTextElement(xmlItem.querySelector('description'));
    this.link = xmlItem.querySelector('link').innerHTML;
    this.pubDate = new Date(xmlItem.querySelector('pubDate').innerHTML);
    this.id = _.uniqueId();
  }

  getModal() {
    return `
    <div>
      <button type="button" class="btn btn-secondary btn-lg" data-toggle="modal" data-target="#modal_${this.id}">
        Подробнее
      </button>

      <div class="modal fade" id="modal_${this.id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalLabel">${this.title}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              ${this.description || 'Без описания'}
            </div>
            <div class="modal-footer">
              <a class="btn btn-primary" href="${this.link}" role="button">Читать в источнике</a>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  render() {
    const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декбря'];
    const card = document.createElement('div');
    card.classList.add('card');
    // const modal = new Modal(this);
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${this.title}</h5>
        <hr class="my-4">
        <p class="card-text">${this.pubDate.getDate()} ${monthNames[this.pubDate.getMonth()]} ${this.pubDate.getFullYear()}</p>
        <p class="card-text">Источник: ${this.source}</p>
        ${this.getModal(this)}
      </div>`;

    return card;
  }
}
