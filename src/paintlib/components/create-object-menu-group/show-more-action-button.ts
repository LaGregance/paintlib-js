import { View } from '../view';
import { MenuButton } from '../buttons/menu-button';
import MoreMenuSVG from '../../svgs/more-menu.svg';

export class ShowMoreActionButton extends MenuButton {
  constructor(private builder: (menu: View) => void) {
    super(MoreMenuSVG, '0', '#222831');
  }

  protected buildMenu(menu: View) {
    this.builder(menu);
  }

  init() {
    super.init();
  }
}
