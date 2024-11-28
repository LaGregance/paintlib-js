import { Component } from '../component';

export class IconButton extends Component<'button'> {
  constructor(
    private onClick: () => any,
    private image: string,
  ) {
    super('button');
  }

  init() {
    this.element.className = 'paintlib-menu-button';
    this.element.onclick = () => {
      this.onClick();
    };
    this.element.innerHTML = this.image;
  }

  setDisable(disable: boolean) {
    if (disable) {
      this.element.classList.add('disable');
    } else {
      this.element.classList.remove('disable');
    }
  }
}
