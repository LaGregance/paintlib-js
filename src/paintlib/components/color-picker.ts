import { Component } from './component';
import { PaintLib } from '../paintlib';
import { useState } from '../utils/use-state';
import { UIStore } from '../store/ui-store';

export class ColorPicker extends Component<'div'> {
  constructor(
    private paintlib: PaintLib,
    private getColor: (store: UIStore) => string,
    private setColor: (color: string) => void,
  ) {
    super('div');
  }

  init() {
    this.element.className = 'color-picker';
    const colorComponents = new Map<string, SVGSVGElement>();

    for (const color of this.paintlib.getPalette()) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      // svg.setAttribute('xmlns', 'http://www.w3.org/2000/');
      svg.setAttribute('viewBox', '0 0 34 34');
      svg.setAttribute('height', '34px');
      svg.setAttribute('width', '34px');

      svg.classList.add('hoverable');
      svg.innerHTML = `
          <ellipse class="selector-circle" cx="17" cy="17" rx="16" ry="16" stroke-width="2" stroke-opacity="0" fill-opacity="0" stroke="#000000" />
          <ellipse cx="17" cy="17" rx="13" ry="13" stroke-width="0" fill="${color}" />`;

      svg.onclick = () => {
        this.setColor(color);
      };
      colorComponents.set(color, svg);
      this.element.appendChild(svg);
    }

    useState(this.paintlib.uiStore, this.getColor, (activeColor) => {
      for (const color of colorComponents.keys()) {
        const compo = colorComponents.get(color);
        compo.querySelector('.selector-circle').setAttribute('stroke-opacity', color === activeColor ? '100%' : '0');
      }
    });
  }
}
