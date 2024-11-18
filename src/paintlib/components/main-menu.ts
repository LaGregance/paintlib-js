import RectangleSVG from '../svgs/rectangle.svg';
import ElipseSVG from '../svgs/elipse.svg';
import CursorSVG from '../svgs/cursor.svg';
import EraserSVG from '../svgs/eraser.svg';
import DrawSVG from '../svgs/draw.svg';
import ForegroundColorSVG from '../svgs/foreground-color.svg';
import { ActionButton } from './action-button';
import { Component } from './component';
import { RectAction } from '../actions/rect-action';
import { CircleAction } from '../actions/circle-action';
import { SelectAction } from '../actions/select-action';
import { PaintLib } from '../paintlib';
import { EraseAction } from '../actions/erase-action';
import { ActionGroup } from './action-group';
import { DrawAction } from '../actions/draw-action';
import { View } from './view';
import { OptionButton } from './option-button';

export class MainMenu extends Component<'div'> {
  constructor(private paintlib: PaintLib) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-menu';

    const actionsView = new View('paintlib-menu-line');

    const select = new ActionButton(this.paintlib, () => new SelectAction(this.paintlib), CursorSVG);
    const erase = new ActionButton(this.paintlib, () => new EraseAction(this.paintlib), EraserSVG);
    const rectangle = new ActionButton(this.paintlib, () => new RectAction(this.paintlib), RectangleSVG);
    const circle = new ActionButton(this.paintlib, () => new CircleAction(this.paintlib), ElipseSVG);
    const draw = new ActionButton(this.paintlib, () => new DrawAction(this.paintlib), DrawSVG);

    actionsView.add(new ActionGroup([select, erase]));
    actionsView.add(new ActionGroup([rectangle, circle]));
    actionsView.add(new ActionGroup([draw]));
    this.add(actionsView);

    const optionsView = new View('paintlib-menu-line');

    const fgColor = new OptionButton(this.paintlib, ForegroundColorSVG);

    optionsView.add(new ActionGroup([fgColor]));
    this.add(optionsView);
  }
}
