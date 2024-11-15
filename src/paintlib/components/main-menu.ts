import RectangleSVG from '../svgs/rectangle.svg';
import ElipseSVG from '../svgs/elipse.svg';
import { ToolButton } from './tool-button';
import { StoreApi } from 'zustand/vanilla';
import { UIStore } from '../store/ui-store';
import { UIActionType } from '../actions/base-action';
import { Component } from './component';

export class MainMenu extends Component<'div'> {
  constructor(private uiStore: StoreApi<UIStore>) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-menu';

    const rectangle = new ToolButton(this.uiStore, UIActionType.SQUARE, RectangleSVG);
    const circle = new ToolButton(this.uiStore, UIActionType.CIRCLE, ElipseSVG);

    this.add(rectangle);
    this.add(circle);
  }
}
