import { PaintLib } from '../../paintlib';
import { ColorPicker } from '../color-picker';
import { View } from '../view';
import { MenuButton } from './menu-button';
import { UIStore } from '../../store/ui-store';
import { useState } from '../../utils/use-state';

export class ColorPickerButton extends MenuButton {
  constructor(
    paintlib: PaintLib,
    private getColor: (store: UIStore) => string,
    private setColor: (color: string) => void,
    private allowTransparent: boolean,
    image: string,
  ) {
    super(paintlib, image, '5px');
  }

  protected buildMenu(menu: View) {
    menu.add(new ColorPicker(this.paintlib, this.getColor, this.setColor, this.allowTransparent));
  }

  init() {
    super.init();

    useState(this.paintlib.uiStore, this.getColor, (activeColor) => {
      this.element.querySelector('rect').setAttribute('opacity', activeColor === 'transparent' ? '0%' : '100%');
      this.element.style.color = activeColor;
    });
  }
}
