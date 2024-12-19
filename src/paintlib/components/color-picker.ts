import { Component } from './component';
import { PaintLib } from '../paintlib';
import { useState } from '../utils/use-state';
import { UIStore } from '../store/ui-store';

export class ColorPicker extends Component<'div'> {
  static shadowIndex = 0;

  constructor(
    private paintlib: PaintLib,
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
  ) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-color-picker';
    const colorComponents = new Map<string, SVGSVGElement>();

    if (this.allowTransparent) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 34 34');
      svg.setAttribute('height', '34px');
      svg.setAttribute('width', '34px');

      svg.style.cursor = 'pointer';
      svg.innerHTML = `
          <ellipse class="paintlib-selector-circle" cx="17" cy="17" rx="16" ry="16" stroke-width="2" stroke-opacity="0" fill-opacity="0" stroke="#000000" />
          <ellipse cx="17" cy="17" rx="13" ry="13" stroke-width="0" fill="#ffffff" filter="url(#shadow1)" />
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

      svg.style.cursor = 'pointer';
      svg.innerHTML = `
          <defs>
            <filter id="shadow-${ColorPicker.shadowIndex}" width="17" height="17">
              <feDropShadow dx="0.5" dy="0.5" stdDeviation="1" flood-opacity="0.5"/>
            </filter>
          </defs>
          <ellipse class="paintlib-selector-circle" cx="17" cy="17" rx="16" ry="16" stroke-width="2" stroke-opacity="0" fill-opacity="0" stroke="#000000" />
          <ellipse cx="17" cy="17" rx="13" ry="13" stroke-width="0" fill="${color}" filter="url(#shadow-${ColorPicker.shadowIndex++})" />`;

      svg.onclick = () => {
        this.setColor(color);
      };
      colorComponents.set(color, svg);
      this.element.appendChild(svg);
    }

    const updateValue = (value: string) => {
      for (const color of colorComponents.keys()) {
        const compo = colorComponents.get(color);
        compo.querySelector('.paintlib-selector-circle').setAttribute('stroke-opacity', color === value ? '100%' : '0');
      }
    };

    useState(this.paintlib.uiStore, this.activeColor, (activeColor) => {
      updateValue(activeColor || this.getColor(this.paintlib.uiStore.getState()));
    });
    useState(this.paintlib.uiStore, this.getColor, updateValue);
  }
}
