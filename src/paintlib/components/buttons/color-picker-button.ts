import { PaintLib } from '../../paintlib';
import { ColorPicker } from '../color-picker';
import { View } from '../view';
import { MenuButton } from './menu-button';
import { UIStore } from '../../store/ui-store';
import { useState } from '../../utils/use-state';

export class ColorPickerButton extends MenuButton {
  constructor(
    private paintlib: PaintLib,
    private getColor: (store: UIStore) => string,
    private setColor: (color: string) => void,
    image: string,
  ) {
    super(image);
  }

  protected buildMenu(menu: View) {
    menu.add(new ColorPicker(this.paintlib, this.getColor, this.setColor));

    useState(this.paintlib.uiStore, this.getColor, (activeColor) => {
      this.element.style.color = activeColor;
    });
  }
}
