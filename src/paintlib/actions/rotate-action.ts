import { UIActionType } from './abstract/base-action';
import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { util } from 'fabric';

export class RotateAction extends BaseClickableAction {
  constructor(
    paintlib: PaintLib,
    private direction: 'left' | 'right',
  ) {
    super(paintlib, direction == 'left' ? UIActionType.ROTATE_LEFT : UIActionType.ROTATE_RIGHT);
  }

  onClick() {
    console.log('Rotate ', this.direction);
    this.paintlib.rotate(this.direction);
    /*const canvas = this.paintlib.canvas;
    const width = canvas.width;
    const height = canvas.height;
    canvas.setDimensions({ width: height, height: width });

    const radians = util.degreesToRadians(90);

    // Get the canvas context
    const ctx = canvas.getContext();

    // Save the current state
    ctx.save();

    // Translate to the center of the canvas
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.translate(centerX, centerY);

    // Rotate the context
    ctx.rotate(radians);

    // Translate back
    ctx.translate(-centerX, -centerY);

    // Clear the canvas and re-render objects
    canvas.clearContext(ctx);
    canvas.renderAll();

    // Restore the original state
    ctx.restore();*/
  }
}
