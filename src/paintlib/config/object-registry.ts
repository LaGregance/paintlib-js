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

export type PaintObjectClass = new () => PaintObject<any>;

export type PaintObjectMetadata = {
  action: UIActionType;
  clazz: PaintObjectClass;
  icon: string;
};

export abstract class ObjectRegistry {
  private static allObjectActions: UIActionType[];
  private static mapActionToMeta = new Map<UIActionType, PaintObjectMetadata>();
  private static mapClazzToMeta = new Map<PaintObjectClass, PaintObjectMetadata>();

  private static readonly configs: PaintObjectMetadata[] = [
    { action: UIActionType.RECT, clazz: PaintRect, icon: RectangleSVG },
    { action: UIActionType.ELLIPSE, clazz: PaintEllipse, icon: EllipseSVG },
    { action: UIActionType.ARROW, clazz: PaintArrow, icon: ArrowSVG },
    { action: UIActionType.LINE, clazz: PaintLine, icon: LineSVG },
    { action: UIActionType.TEXT, clazz: PaintText, icon: TextSVG },
    { action: UIActionType.DRAW, clazz: PaintDraw, icon: DrawSVG },
  ];

  private static init() {
    if (this.allObjectActions) {
      return;
    }

    this.allObjectActions = [];
    for (const meta of this.configs) {
      this.allObjectActions.push(meta.action);
      this.mapActionToMeta.set(meta.action, meta);
      this.mapClazzToMeta.set(meta.clazz, meta);
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

  public static getObjectMeta(actionOrClass: UIActionType | PaintObjectClass) {
    ObjectRegistry.init();

    if (typeof actionOrClass === 'function') {
      return this.mapClazzToMeta.get(actionOrClass);
    } else {
      return this.mapActionToMeta.get(actionOrClass);
    }
  }
}
