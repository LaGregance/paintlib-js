import { Component } from '../component';
import { View } from '../view';

export abstract class MenuButton extends Component<'div'> {
  protected button: HTMLButtonElement;

  constructor(private image: string) {
    super('div');
  }

  protected abstract buildMenu(menu: View): void;

  init() {
    this.button = document.createElement('button');
    this.button.className = 'paintlib-menu-button';
    this.button.innerHTML = this.image;

    const menu = new View('option-floating-menu display-none');
    this.buildMenu(menu);

    const cancelEvent = (event: MouseEvent) => {
      menu.element.classList.add('display-none');
      document.removeEventListener('click', cancelEvent);
      event.stopPropagation();
      this.button.classList.remove('selected');
    };

    menu.element.onclick = (event) => {
      // Avoid trigger cancelEvent when clicking on the menu itself
      event.stopPropagation();
    };

    this.button.onclick = (event) => {
      if (menu.element.classList.contains('display-none')) {
        const anchor = this.button.getBoundingClientRect();
        menu.element.style.top = anchor.bottom + 'px';
        menu.element.classList.remove('display-none');

        requestAnimationFrame(() => {
          // If we don't requestAnimationFrame, the cancelEvent is triggered directly
          document.addEventListener('click', cancelEvent);
          this.button.classList.add('selected');
        });
      } else {
        cancelEvent(event);
      }
    };

    this.element.appendChild(this.button);
    this.add(menu);
  }
}
