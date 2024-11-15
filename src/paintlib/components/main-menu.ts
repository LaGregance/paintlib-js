import RectangleSVG from '../svgs/rectangle.svg';
import ElipseSVG from '../svgs/elipse.svg';
import CursorSVG from '../svgs/cursor.svg';
import { ActionButton } from './action-button';
import { StoreApi } from 'zustand/vanilla';
import { UIStore } from '../store/ui-store';
import { Component } from './component';
import { Canvas } from 'fabric';
import { RectAction } from '../actions/rect-action';
import { CircleAction } from '../actions/circle-action';
import { SelectAction } from '../actions/select-action';

export class MainMenu extends Component<'div'> {
  constructor(
    private canvas: () => Canvas,
    private uiStore: StoreApi<UIStore>,
  ) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-menu';

    const select = new ActionButton(this.uiStore, () => new SelectAction(this.canvas()), CursorSVG);
    const rectangle = new ActionButton(this.uiStore, () => new RectAction(this.canvas()), RectangleSVG);
    const circle = new ActionButton(this.uiStore, () => new CircleAction(this.canvas()), ElipseSVG);

    this.add(select);
    this.add(rectangle);
    this.add(circle);
  }
}
