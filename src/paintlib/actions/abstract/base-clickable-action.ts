import { PaintLib } from '../../paintlib';
import { BaseAction } from './base-action';
import { PaintActionType } from '../../config/paint-action-type';

export abstract class BaseClickableAction extends BaseAction {
  constructor(
    public readonly paintlib: PaintLib,
    public readonly type: PaintActionType,
  ) {
    super(paintlib, type, 'clickable');
  }

  onSelected() {}
  onDeselected() {}
  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
