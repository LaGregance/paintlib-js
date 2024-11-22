import { PaintObject } from '../objects/abstract/paint-object';
import { PaintRect } from '../objects/paint-rect';
import RectangleSVG from '../svgs/rectangle.svg';
import { PaintEllipse } from '../objects/paint-ellipse';
import EllipseSVG from '../svgs/ellipse.svg';
import { PaintArrow } from '../objects/paint-arrow';
import { PaintLine } from '../objects/paint-line';
import ArrowSVG from '../svgs/arrow.svg';
import LineSVG from '../svgs/line.svg';
import { PaintText } from '../objects/paint-text';
import TextSVG from '../svgs/text.svg';
import { PaintDraw } from '../objects/paint-draw';
import DrawSVG from '../svgs/draw.svg';
import { DrawAction } from '../actions/draw-action';
import { PaintLib } from '../paintlib';
import { CreateObjectAction } from '../actions/create-object-action';
import { UIActionType } from './ui-action-type';
import { DrawingOption } from './drawing-option';
import { PaintObjectJson } from '../objects/abstract/paint-object-json';

export type PaintObjectClass = new () => PaintObject<any>;

export type PaintObjectMetadata = {
  action: UIActionType;
  clazz: PaintObjectClass;
  icon: string;
  allowedOptions?: DrawingOption[];
};

export abstract class ObjectRegistry {
  private static allObjectActions: UIActionType[];
  private static mapActionToMeta = new Map<UIActionType, PaintObjectMetadata>();
  private static mapClazzToMeta = new Map<string, PaintObjectMetadata>();

  private static readonly configs: PaintObjectMetadata[] = [
    {
      action: UIActionType.RECT,
      clazz: PaintRect,
      icon: RectangleSVG,
      allowedOptions: [DrawingOption.FG_COLOR, DrawingOption.BG_COLOR, DrawingOption.TICKNESS],
    },
    {
      action: UIActionType.ELLIPSE,
      clazz: PaintEllipse,
      icon: EllipseSVG,
      allowedOptions: [DrawingOption.FG_COLOR, DrawingOption.BG_COLOR, DrawingOption.TICKNESS],
    },
    {
      action: UIActionType.ARROW,
      clazz: PaintArrow,
      icon: ArrowSVG,
      allowedOptions: [DrawingOption.FG_COLOR, DrawingOption.TICKNESS],
    },
    {
      action: UIActionType.LINE,
      clazz: PaintLine,
      icon: LineSVG,
      allowedOptions: [DrawingOption.FG_COLOR, DrawingOption.TICKNESS],
    },
    {
      action: UIActionType.TEXT,
      clazz: PaintText,
      icon: TextSVG,
      allowedOptions: [DrawingOption.FG_COLOR],
    },
    {
      action: UIActionType.DRAW,
      clazz: PaintDraw,
      icon: DrawSVG,
      allowedOptions: [DrawingOption.FG_COLOR, DrawingOption.TICKNESS],
    },
  ];

  private static init() {
    if (this.allObjectActions) {
      return;
    }

    this.allObjectActions = [];
    for (const meta of this.configs) {
      this.allObjectActions.push(meta.action);
      this.mapActionToMeta.set(meta.action, meta);
      this.mapClazzToMeta.set(meta.clazz.name, meta);
    }
  }

  public static createAction(type: UIActionType, paintlib: PaintLib) {
    ObjectRegistry.init();

    const meta = this.mapActionToMeta.get(type);
    if (!meta) {
      throw new Error(`Unable to create action: ${type}`);
    }

    if (type === UIActionType.DRAW) {
      return new DrawAction(paintlib);
    } else {
      return new CreateObjectAction(paintlib, type, meta.clazz);
    }
  }

  public static getAllObjectActions() {
    ObjectRegistry.init();
    return this.allObjectActions;
  }

  public static getObjectMeta(actionOrClass: UIActionType | PaintObjectClass | string) {
    ObjectRegistry.init();

    if (typeof actionOrClass === 'function') {
      return this.mapClazzToMeta.get(actionOrClass.name);
    } else if (Object.values(UIActionType).includes(actionOrClass as any)) {
      return this.mapActionToMeta.get(actionOrClass as any);
    } else {
      return this.mapClazzToMeta.get(actionOrClass);
    }
  }

  /**
   * Restore the object from a JSON object (obtained from serialize function)
   * @param paintlib
   * @param data
   */
  public static restoreObject(paintlib: PaintLib, data: PaintObjectJson) {
    const meta = this.getObjectMeta(data.type);

    if (!meta) {
      return;
    }

    const object = new meta.clazz();
    object.restoreObject(data);
    paintlib.add(object);
    return object;
  }
}