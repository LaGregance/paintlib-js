import { Component } from './component';
import { PaintLib } from '../paintlib';
import { useState } from '../utils/use-state';

export class TicknessPicker extends Component<'div'> {
  constructor(private paintlib: PaintLib) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-tickness-picker';
    const ticknessComponents = new Map<number, HTMLElement>();
    const availableTickness = this.paintlib.getAvailableTickness();

    for (const tickness of availableTickness) {
      const btn = document.createElement('div');
      btn.className = 'paintlib-tickness-item';
      btn.innerHTML = `<span>${tickness}</span><div style="background-color: black; height: ${tickness}px; width: 100px;"></div>`;
      btn.onclick = () => {
        this.paintlib.uiStore.setState((old) => ({ options: { ...old.options, tickness } }));
      };

      ticknessComponents.set(tickness, btn);
      this.element.appendChild(btn);
    }

    const updateValue = (value: number) => {
      for (const tickness of ticknessComponents.keys()) {
        const compo = ticknessComponents.get(tickness);
        compo.style.border = value === tickness ? '1px solid black' : 'none';
      }
    };

    useState(
      this.paintlib.uiStore,
      (store) => store.selectedObject,
      (selectedObject) => {
        updateValue(selectedObject?.getOptions()?.tickness || this.paintlib.uiStore.getState().options.tickness);
      },
    );

    useState(this.paintlib.uiStore, (store) => store.options.tickness, updateValue);
  }
}
