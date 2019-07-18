import _ from 'lodash';

export default class Modal {
  constructor(item) {
    this.description = item.description || 'Без описания';
    this.title = item.title;
    this.link = item.link;
    this.id = _.uniqueId();
  }

  render() {
    const modal = document.createElement('div');
    modal.innerHTML = `
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
              ${this.description}
            </div>
            <div class="modal-footer">
              <a class="btn btn-primary" href="${this.link}" role="button">Читать в источнике</a>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    return modal;
  }
}
