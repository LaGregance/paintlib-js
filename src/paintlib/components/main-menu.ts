import RectangleSVG from '../svgs/rectangle.svg';
import ElipseSVG from '../svgs/elipse.svg';
import CursorSVG from '../svgs/cursor.svg';
import { ActionButton } from './action-button';
import { Component } from './component';
import { RectAction } from '../actions/rect-action';
import { CircleAction } from '../actions/circle-action';
import { SelectAction } from '../actions/select-action';
import { PaintLib } from '../paintlib';

export class MainMenu extends Component<'div'> {
  constructor(private paintlib: PaintLib) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-menu';

    const select = new ActionButton(this.paintlib, () => new SelectAction(this.paintlib), CursorSVG);
    const rectangle = new ActionButton(this.paintlib, () => new RectAction(this.paintlib), RectangleSVG);
    const circle = new ActionButton(this.paintlib, () => new CircleAction(this.paintlib), ElipseSVG);

    this.add(select);
    this.add(rectangle);
    this.add(circle);
  }
}
