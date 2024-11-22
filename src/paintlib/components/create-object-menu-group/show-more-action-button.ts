import { View } from '../view';
import { MenuButton } from '../buttons/menu-button';
import MoreMenuSVG from '../../svgs/more-menu.svg';
import { PaintLib } from '../../paintlib';

export class ShowMoreActionButton extends MenuButton {
  constructor(
    paintlib: PaintLib,
    private builder: (menu: View) => void,
  ) {
    super(paintlib, MoreMenuSVG, '0', '#222831');
  }

  protected buildMenu(menu: View) {
    this.builder(menu);
  }

  init() {
    super.init();
  }
}
