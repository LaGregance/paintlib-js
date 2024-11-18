import { Component } from './component';
import { PaintLib } from '../paintlib';
import { useState } from '../utils/use-state';

export class TicknessPicker extends Component<'div'> {
  constructor(private paintlib: PaintLib) {
    super('div');
  }

  init() {
    this.element.className = 'tickness-picker';
    const ticknessComponents = new Map<number, HTMLElement>();

    for (const tickness of this.paintlib.getAvailableTickness()) {
      const btn = document.createElement('div');
      btn.className = 'tickness-item';
      btn.innerHTML = `<span>${tickness}</span><div style="background-color: black; height: ${tickness}px; width: 100px;"></div>`;
      btn.onclick = () => {
        this.paintlib.uiStore.setState((old) => ({ options: { ...old.options, tickness } }));
      };

      ticknessComponents.set(tickness, btn);
      this.element.appendChild(btn);
    }

    useState(
      this.paintlib.uiStore,
      (store) => store.options.tickness,
      (activeTickness) => {
        for (const tickness of ticknessComponents.keys()) {
          const compo = ticknessComponents.get(tickness);
          compo.style.border = activeTickness === tickness ? '1px solid black' : 'none';
        }
      },
    );
  }
}
