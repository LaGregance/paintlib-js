import { Component } from './component';
import { PaintLib } from '../paintlib';
import { useState } from '../utils/use-state';
import { UIStore } from '../store/ui-store';

export class ColorPicker extends Component<'div'> {
  constructor(
    private paintlib: PaintLib,
    private getColor: (store: UIStore) => string,
    private setColor: (color: string) => void,
    private allowTransparent: boolean,
  ) {
    super('div');
  }

  init() {
    this.element.className = 'color-picker';
    const colorComponents = new Map<string, SVGSVGElement>();

    if (this.allowTransparent) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 34 34');
      svg.setAttribute('height', '34px');
      svg.setAttribute('width', '34px');

      svg.classList.add('hoverable');
      svg.innerHTML = `
          <ellipse class="selector-circle" cx="17" cy="17" rx="16" ry="16" stroke-width="2" stroke-opacity="0" fill-opacity="0" stroke="#000000" />
          <ellipse cx="17" cy="17" rx="13" ry="13" stroke-width="0" fill="#ffffff" />
          <line x1="7.8076" y1="7.8076" x2="26.1923" y2="26.1923" stroke="#000000" />
          <line x1="26.1923" y1="7.8076" x2="7.8076" y2="26.1923" stroke="#000000" />`;

      svg.onclick = () => {
        this.setColor('transparent');
      };
      colorComponents.set('transparent', svg);
      this.element.appendChild(svg);
    }

    for (const color of this.paintlib.getPalette()) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
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
