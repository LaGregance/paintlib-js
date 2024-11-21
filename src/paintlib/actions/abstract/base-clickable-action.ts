import { PaintLib } from '../../paintlib';
import { BaseAction, UIActionType } from './base-action';

export abstract class BaseClickableAction extends BaseAction {
  constructor(
    public readonly paintlib: PaintLib,
    public readonly type: UIActionType,
  ) {
    super(paintlib, type, 'clickable');
  }

  onSelected() {}
  onDeselected() {}
  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
