import { View } from '../view';
import { MenuButton } from './menu-button';
import { ActionGroup } from '../action-group';
import { ActionButton } from './action-button';

export class ShowMoreActionButton extends MenuButton {
  constructor(
    private buttons: ActionButton[],
    image: string,
  ) {
    super(image, '0', '#222831');
  }

  protected buildMenu(menu: View) {
    menu.add(new ActionGroup(this.buttons));
    this.buttons.forEach((child) => {
      const onClick = child.element.onclick as (event: MouseEvent) => void;
      child.element.onclick = (event: MouseEvent) => {
        onClick(event);
        this.hideMenu();
      };
    });
  }

  init() {
    super.init();

    /*useState(this.paintlib.uiStore, this.getColor, (activeColor) => {
      this.element.querySelector('rect').setAttribute('opacity', activeColor === 'transparent' ? '0%' : '100%');
      this.element.style.color = activeColor;
    });*/
  }
}
