import RectangleSVG from '../svgs/rectangle.svg';
import ElipseSVG from '../svgs/ellipse.svg';
import CursorSVG from '../svgs/cursor.svg';
import EraserSVG from '../svgs/eraser.svg';
import TextSVG from '../svgs/text.svg';
import DrawSVG from '../svgs/draw.svg';
import LineSVG from '../svgs/line.svg';
import ArrowSVG from '../svgs/arrow.svg';
import ForegroundColorSVG from '../svgs/foreground-color.svg';
import BackgroundColorSVG from '../svgs/background-color.svg';
import ThicknessSVG from '../svgs/thickness.svg';
import { ActionButton } from './buttons/action-button';
import { Component } from './component';
import { RectAction } from '../actions/rect-action';
import { CircleAction } from '../actions/circle-action';
import { SelectAction } from '../actions/select-action';
import { PaintLib } from '../paintlib';
import { EraseAction } from '../actions/erase-action';
import { ActionGroup } from './action-group';
import { DrawAction } from '../actions/draw-action';
import { View } from './view';
import { ColorPickerButton } from './buttons/color-picker-button';
import { TicknessPickerButton } from './buttons/tickness-picker-button';
import { TextAction } from '../actions/text-action';
import { ArrowAction } from '../actions/arrow-action';
import { LineAction } from '../actions/line-action';

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
    const arrow = new ActionButton(this.paintlib, () => new ArrowAction(this.paintlib), ArrowSVG);
    const line = new ActionButton(this.paintlib, () => new LineAction(this.paintlib), LineSVG);
    const text = new ActionButton(this.paintlib, () => new TextAction(this.paintlib), TextSVG);
    const draw = new ActionButton(this.paintlib, () => new DrawAction(this.paintlib), DrawSVG);

    actionsView.add(new ActionGroup([select, erase]));
    actionsView.add(new ActionGroup([rectangle, circle, line, arrow]));
    actionsView.add(new ActionGroup([text, draw]));
    this.add(actionsView);

    const optionsView = new View('paintlib-menu-line');

    const fgColor = new ColorPickerButton(
      this.paintlib,
      (state) => state.options.fgColor,
      (color) => {
        this.paintlib.uiStore.setState((old) => ({
          options: { ...old.options, fgColor: color },
        }));
      },
      false,
      ForegroundColorSVG,
    );
    const bgColor = new ColorPickerButton(
      this.paintlib,
      (state) => state.options.bgColor,
      (color) => {
        this.paintlib.uiStore.setState((old) => ({
          options: { ...old.options, bgColor: color },
        }));
      },
      true,
      BackgroundColorSVG,
    );
    const tickness = new TicknessPickerButton(this.paintlib, ThicknessSVG);

    optionsView.add(new ActionGroup([fgColor, bgColor, tickness]));
    this.add(optionsView);
  }
}
