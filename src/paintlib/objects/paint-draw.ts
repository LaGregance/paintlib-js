import { Path, Point } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { PaintObjectJson } from '../models/paint-object-json';
import { PaintLib } from '../paintlib';
import { GlobalTransformProps } from '../models/global-transform-props';

export class PaintDraw extends PaintObject<Path> {
  instantiate(point: Point, globalTransform?: GlobalTransformProps, data?: PaintObjectJson) {
    this.fabricObject = new Path(data.extras.path, data.extras);
  }

  attach(paintlib: PaintLib, obj: Path) {
    this.fabricObject = obj;

    this.options = {
      fgColor: obj.stroke as string,
      bgColor: obj.fill as string,
      tickness: obj.strokeWidth,
    };

    const pos = paintlib.getRealPosFromCanvas(new Point(this.fabricObject.left, this.fabricObject.top));
    const globalTransform = paintlib.getTransform();
    const scale = 1 / globalTransform.scale;
    this.setTransform({
      rotation: -globalTransform.rotation,
      scaleX: scale,
      scaleY: scale,
    });
    this.updateLayout(
      {
        left: pos.x,
        top: pos.y,
        width: this.fabricObject.width,
        height: this.fabricObject.height,
      },
      new Point(1, 1),
    );
    this.update(paintlib);
  }

  render() {
    this.fabricObject.set({
      stroke: this.options.fgColor,
      fill: this.options.bgColor,
      strokeWidth: this.options.tickness,
    });
  }

  serializeExtras(): any {
    return {
      path: this.fabricObject.path,
      strokeDashArray: this.fabricObject.strokeDashArray,
      strokeDashOffset: this.fabricObject.strokeDashOffset,
      strokeLineCap: this.fabricObject.strokeLineCap,
      strokeLineJoin: this.fabricObject.strokeLineJoin,
      strokeMiterLimit: this.fabricObject.strokeMiterLimit,
      strokeUniform: this.fabricObject.strokeUniform,
    };
  }
}
