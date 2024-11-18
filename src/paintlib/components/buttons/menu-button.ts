import { Component } from '../component';
import { View } from '../view';

export abstract class MenuButton extends Component<'div'> {
  constructor(private image: string) {
    super('div');
  }

  protected abstract buildMenu(menu: View): void;

  init() {
    const button = document.createElement('button');
    button.className = 'paintlib-menu-button';
    button.innerHTML = this.image;

    const menu = new View('option-floating-menu display-none');
    this.buildMenu(menu);

    const cancelEvent = (event: MouseEvent) => {
      menu.element.classList.add('display-none');
      document.removeEventListener('click', cancelEvent);
      event.stopPropagation();
    };

    menu.element.onclick = (event) => {
      // Avoid trigger cancelEvent when clicking on the menu itself
      event.stopPropagation();
    };

    button.onclick = (event) => {
      if (menu.element.classList.contains('display-none')) {
        const anchor = button.getBoundingClientRect();
        menu.element.style.top = anchor.bottom + 'px';
        menu.element.classList.remove('display-none');

        requestAnimationFrame(() => {
          // If we don't requestAnimationFrame, the cancelEvent is triggered directly
          document.addEventListener('click', cancelEvent);
        });
      } else {
        cancelEvent(event);
      }
    };

    this.element.appendChild(button);
    this.add(menu);
  }
}
