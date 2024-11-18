import { Component } from './component';
import { PaintLib } from '../paintlib';
import { ColorPicker } from './color-picker';
import { View } from './view';

export class OptionButton extends Component<'div'> {
  constructor(
    private paintlib: PaintLib,
    private image: string,
  ) {
    super('div');
  }

  init() {
    const button = document.createElement('button');
    button.className = 'paintlib-menu-button';
    button.innerHTML = this.image;

    const menu = new View('option-floating-menu display-none');
    menu.add(
      new ColorPicker(
        this.paintlib,
        (state) => state.options.fgColor,
        (color) => {
          this.paintlib.uiStore.setState((old) => ({
            options: { ...old.options, fgColor: color },
          }));
        },
      ),
    );

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
      // Open color dialog
      if (menu.element.classList.contains('display-none')) {
        const anchor = button.getBoundingClientRect();
        menu.element.style.top = anchor.bottom + 'px';
        menu.element.classList.remove('display-none');
        event.stopPropagation();

        document.addEventListener('click', cancelEvent);
      } else {
        cancelEvent(event);
      }
    };

    this.element.appendChild(button);
    this.add(menu);
  }
}
