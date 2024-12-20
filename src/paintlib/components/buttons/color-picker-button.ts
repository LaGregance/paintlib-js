import { PaintLib } from '../../paintlib';
import { ColorPicker } from '../color-picker';
import { View } from '../view';
import { MenuButton } from './menu-button';
import { UIStore } from '../../store/ui-store';
import { useState } from '../../utils/use-state';

export class ColorPickerButton extends MenuButton {
  constructor(
    paintlib: PaintLib,
    /**
     * Represent the color of the active object
     */
    private activeColor: (store: UIStore) => string,
    /**
     * Represent the actual color of the option field
     */
    private getColor: (store: UIStore) => string,
    private setColor: (color: string) => void,
    private allowTransparent: boolean,
    image: string,
  ) {
    super(paintlib, image, '5px');
  }

  protected buildMenu(menu: View) {
    menu.add(new ColorPicker(this.paintlib, this.activeColor, this.getColor, this.setColor, this.allowTransparent));
  }

  init() {
    super.init();

    useState(this.paintlib.uiStore, this.activeColor, (activeColor) => {
      const color = activeColor || this.getColor(this.paintlib.uiStore.getState());
      const el = this.element.querySelector('.paintlib-picker-color');
      el.setAttribute('fill', color);
      el.setAttribute('opacity', color === 'transparent' ? '0%' : '100%');
    });

    useState(this.paintlib.uiStore, this.getColor, (activeColor) => {
      const el = this.element.querySelector('.paintlib-picker-color');
      el.setAttribute('fill', activeColor);
      el.setAttribute('opacity', activeColor === 'transparent' ? '0%' : '100%');
    });
  }

  setImage(image: string) {
    super.setImage(image);

    const state = this.paintlib.uiStore.getState();
    const color = this.activeColor(state) || this.getColor(state);
    const el = this.element.querySelector('.paintlib-picker-color');
    el.setAttribute('fill', color);
    el.setAttribute('opacity', color === 'transparent' ? '0%' : '100%');
  }
}
