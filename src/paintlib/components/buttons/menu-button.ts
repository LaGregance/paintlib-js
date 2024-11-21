import { Component } from '../component';
import { View } from '../view';

export abstract class MenuButton extends Component<'div'> {
  protected button: HTMLButtonElement;
  protected menu: View;

  constructor(
    private image: string,
    private padding: string,
    private bgColor: string = '#ffffffB4',
  ) {
    super('div');
  }

  protected abstract buildMenu(menu: View): void;

  init() {
    this.button = document.createElement('button');
    this.button.className = 'paintlib-menu-button';
    this.button.innerHTML = this.image;

    this.menu = new View('option-floating-menu display-none');
    this.menu.element.style.padding = this.padding;
    this.menu.element.style.backgroundColor = this.bgColor;
    this.buildMenu(this.menu);

    this.menu.element.onclick = (event) => {
      // Avoid trigger cancelEvent when clicking on the menu itself
      event.stopPropagation();
    };

    this.button.onclick = (event) => {
      if (this.menu.element.classList.contains('display-none')) {
        const anchor = this.button.getBoundingClientRect();
        this.menu.element.style.top = anchor.bottom + 'px';
        this.menu.element.classList.remove('display-none');

        requestAnimationFrame(() => {
          // If we don't requestAnimationFrame, the cancelEvent is triggered directly
          document.addEventListener('click', this.hideMenu);
          this.button.classList.add('selected');
        });
      } else {
        this.hideMenu(event);
      }
    };

    this.element.appendChild(this.button);
    this.add(this.menu);
  }

  hideMenu = (event?: MouseEvent) => {
    // Arrow function to bind this
    this.menu.element.classList.add('display-none');
    document.removeEventListener('click', this.hideMenu);
    event?.stopPropagation();
    this.button.classList.remove('selected');
  };

  setImage(image: string) {
    this.image = image;
    this.button.innerHTML = image;
  }
}
