import { PaintLib } from '../../paintlib';
import { View } from '../view';
import { MenuButton } from './menu-button';
import { TicknessPicker } from '../tickness-picker';

export class TicknessPickerButton extends MenuButton {
  constructor(paintlib: PaintLib, image: string) {
    super(paintlib, image, '5px');
  }

  protected buildMenu(menu: View) {
    menu.add(new TicknessPicker(this.paintlib));
  }
}
