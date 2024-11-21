import RectangleSVG from '../svgs/rectangle.svg';
import EllipseSVG from '../svgs/ellipse.svg';
import CursorSVG from '../svgs/cursor.svg';
import TrashSVG from '../svgs/trash.svg';
import TextSVG from '../svgs/text.svg';
import DrawSVG from '../svgs/draw.svg';
import LineSVG from '../svgs/line.svg';
import ArrowSVG from '../svgs/arrow.svg';
import ForegroundColorSVG from '../svgs/foreground-color.svg';
import BackgroundColorSVG from '../svgs/background-color.svg';
import ThicknessSVG from '../svgs/thickness.svg';
import { ActionButton } from './buttons/action-button';
import { Component } from './component';
import { SelectAction } from '../actions/select-action';
import { PaintLib } from '../paintlib';
import { TrashAction } from '../actions/trash-action';
import { ActionGroup } from './action-group';
import { DrawAction } from '../actions/draw-action';
import { View } from './view';
import { ColorPickerButton } from './buttons/color-picker-button';
import { TicknessPickerButton } from './buttons/tickness-picker-button';
import { CreateObjectAction } from '../actions/create-object-action';
import { UIActionType } from '../actions/abstract/base-action';
import { PaintEllipse } from '../objects/paint-ellipse';
import { PaintRect } from '../objects/paint-rect';
import { PaintText } from '../objects/paint-text';
import { PaintLine } from '../objects/paint-line';
import { PaintArrow } from '../objects/paint-arrow';
import { FabricObject, TEvent, TPointerEvent } from 'fabric';

export class MainMenu extends Component<'div'> {
  private trash: ActionButton;

  constructor(private paintlib: PaintLib) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-menu';

    const actionsView = new View('paintlib-menu-line');

    const select = new ActionButton(this.paintlib, () => new SelectAction(this.paintlib), CursorSVG);
    this.trash = new ActionButton(this.paintlib, () => new TrashAction(this.paintlib), TrashSVG);
    const rectangle = new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.RECT, PaintRect), RectangleSVG);
    const ellipse = new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.ELLIPSE, PaintEllipse), EllipseSVG);
    const arrow = new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.ARROW, PaintArrow), ArrowSVG);
    const line = new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.LINE, PaintLine), LineSVG);
    const text = new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.TEXT, PaintText), TextSVG);
    const draw = new ActionButton(this.paintlib, () => new DrawAction(this.paintlib), DrawSVG);

    actionsView.add(new ActionGroup([select, this.trash]));
    actionsView.add(new ActionGroup([rectangle, ellipse, line, arrow, text, draw]));
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

  setupEvent() {
    // Event for enable / disable trash
    const selectionEvent = (event: Partial<TEvent<TPointerEvent>> & { selected: FabricObject[]; deselected: FabricObject[] }) => {
      this.trash.setDisable((event.selected?.length ?? 0) <= 0);
    };

    this.paintlib.canvas.on('selection:created', selectionEvent);
    this.paintlib.canvas.on('selection:updated', selectionEvent);
    this.paintlib.canvas.on('selection:cleared', selectionEvent);

    this.trash.setDisable(!this.paintlib.canvas.getActiveObject());
  }
}
