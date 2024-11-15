import { BaseAction, UIActionType } from './base-action';
import { TPointerEvent, TPointerEventInfo } from 'fabric';

export class ShapeAction extends BaseAction {
  constructor(type: UIActionType) {
    super(type);
  }

  onMouseDown(event: TPointerEventInfo<TPointerEvent>): void {
    console.log('onMouseDown: ', this.type);
  }

  onMouseMove(event: TPointerEventInfo<TPointerEvent>): void {
    console.log('onMouseMove: ', this.type);
  }

  onMouseUp(event: TPointerEventInfo<TPointerEvent>): void {
    console.log('onMouseUp: ', this.type);
  }
}
