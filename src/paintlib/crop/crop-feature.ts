import { Control, InteractiveFabricObject, Path, Point, TBBox, TMat2D, Transform } from 'fabric';
import { PaintLib } from '../paintlib';
import { renderControl } from '../utils/improve-default-control';
import { TransformCorner } from '../utils/transform-corner';

export class CropFeature {
  private path: Path;
  private cropSection: TBBox;

  constructor(private paintlib: PaintLib) {
    const canvasWidth = paintlib.canvas.width;
    const canvasHeight = paintlib.canvas.height;

    this.cropSection = {
      left: canvasWidth / 4,
      top: canvasHeight / 4,
      width: canvasWidth / 2,
      height: canvasHeight / 2,
    };

    this.path = new Path('', {
      fill: '#000000',
      opacity: 0.4,
      fillRule: 'evenodd',
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
    });
    this.path.controls = {};

    this.paintlib.canvas.add(this.path);
    this.calcPath();

    let originalEventInfo: { point: Point; cropSection: TBBox } = undefined;
    let lastTransform: Transform = undefined;
    const handler = (eventData: Event, transform: Transform, eventX: number, eventY: number) => {
      if (transform.action === 'moveCrop') {
        if (lastTransform !== transform) {
          originalEventInfo = { point: new Point(eventX, eventY), cropSection: { ...this.cropSection } };
        }
        lastTransform = transform;

        const delta = new Point(eventX - originalEventInfo.point.x, eventY - originalEventInfo.point.y);

        this.cropSection.width = originalEventInfo.cropSection.width + delta.x;
        this.cropSection.height = originalEventInfo.cropSection.height + delta.y;
        this.calcPath();
      }
      return false;
    };

    const positionHandlerFactory = (corner: TransformCorner) => {
      return () => {
        const pos = new Point(this.cropSection.left, this.cropSection.top);

        if (corner.horizontal === 'm') {
          pos.x += this.cropSection.width / 2;
        } else if (corner.horizontal === 'r') {
          pos.x += this.cropSection.width;
        }

        if (corner.vertical === 'm') {
          pos.y += this.cropSection.height / 2;
        } else if (corner.vertical === 'b') {
          pos.y += this.cropSection.height;
        }

        return pos;
      };
    };

    const controls: Record<string, Control> = {};
    for (const vertical of ['t', 'm', 'b']) {
      for (const horizontal of ['l', 'm', 'r']) {
        if (vertical === 'm' && horizontal === 'm') {
          continue;
        }

        controls[vertical + horizontal] = new Control({
          positionHandler: positionHandlerFactory(TransformCorner.parse(vertical + horizontal)),
          cursorStyle: 'pointer',
          actionHandler: handler,
          actionName: 'moveCrop',
          render: renderControl,
        });
      }
    }

    this.path.controls = controls;
  }

  private buildAbsoluteLinePath(startX: number, startY: number, size: number, type: 'h' | 'v') {
    if (type === 'h') {
      return `M ${startX} ${startY - 0.5} h ${size} v 1 h-${size} Z`;
    } else {
      return `M ${startX - 0.5} ${startY} v ${size} h 1 v-${size} Z`;
    }
  }

  private calcPath() {
    const canvasWidth = this.paintlib.canvas.width;
    const canvasHeight = this.paintlib.canvas.height;
    const updatedPath = new Path(
      [
        // Outer rect
        `M 0 0 h ${canvasWidth} v ${canvasHeight} h -${canvasWidth} Z`,
        // Inner rect
        `M ${this.cropSection.left} ${this.cropSection.top} v ${this.cropSection.height} h ${this.cropSection.width} v -${this.cropSection.height} Z`,
        // First vertical line
        this.buildAbsoluteLinePath(
          this.cropSection.left + this.cropSection.width / 3,
          this.cropSection.top,
          this.cropSection.height,
          'v',
        ),
        // First second vertical line
        this.buildAbsoluteLinePath(
          this.cropSection.left + (2 * this.cropSection.width) / 3,
          this.cropSection.top,
          this.cropSection.height,
          'v',
        ),
        // First horizontal line (in 3 section to avoid overlap vertical line)
        this.buildAbsoluteLinePath(
          this.cropSection.left,
          this.cropSection.top + this.cropSection.height / 3,
          this.cropSection.width / 3 - 0.5,
          'h',
        ),
        this.buildAbsoluteLinePath(
          this.cropSection.left + this.cropSection.width / 3 + 0.5,
          this.cropSection.top + this.cropSection.height / 3,
          this.cropSection.width / 3 - 1,
          'h',
        ),
        this.buildAbsoluteLinePath(
          this.cropSection.left + (2 * this.cropSection.width) / 3 + 0.5,
          this.cropSection.top + this.cropSection.height / 3,
          this.cropSection.width / 3 - 0.5,
          'h',
        ),
        // Second horizontal line (in 3 section to avoid overlap vertical line)
        this.buildAbsoluteLinePath(
          this.cropSection.left,
          this.cropSection.top + (2 * this.cropSection.height) / 3,
          this.cropSection.width / 3 - 0.5,
          'h',
        ),
        this.buildAbsoluteLinePath(
          this.cropSection.left + this.cropSection.width / 3 + 0.5,
          this.cropSection.top + (2 * this.cropSection.height) / 3,
          this.cropSection.width / 3 - 1,
          'h',
        ),
        this.buildAbsoluteLinePath(
          this.cropSection.left + (2 * this.cropSection.width) / 3 + 0.5,
          this.cropSection.top + (2 * this.cropSection.height) / 3,
          this.cropSection.width / 3 - 0.5,
          'h',
        ),
      ].join(' '),
    );

    this.path.set({
      path: updatedPath.path,
      width: updatedPath.width,
      height: updatedPath.height,
      pathOffset: updatedPath.pathOffset,
      top: 0,
      left: 0,
    });
    this.path.setCoords();
    this.paintlib.canvas.renderAll();
  }

  /*private topRect: Rect;
  private bottomRect: Rect;
  private leftRect: Rect;
  private rightRect: Rect;

  private group: Group;
  private cropSection: TBBox;

  constructor(private paintlib: PaintLib) {
    const canvasWidth = paintlib.canvas.width;
    const canvasHeight = paintlib.canvas.height;

    this.cropSection = {
      left: canvasWidth / 4,
      top: canvasHeight / 4,
      width: canvasWidth / 2,
      height: canvasHeight / 2,
    };

    this.topRect = new Rect();
    this.bottomRect = new Rect();
    this.leftRect = new Rect();
    this.rightRect = new Rect();
    // this.group = new Group([this.topRect, this.bottomRect, this.leftRect, this.rightRect]);
    // this.paintlib.canvas.add(this.group);
    this.paintlib.canvas.add(this.topRect);
    this.paintlib.canvas.add(this.bottomRect);
    this.paintlib.canvas.add(this.leftRect);
    this.paintlib.canvas.add(this.rightRect);
    this.calcRects();
  }

  private calcRects() {
    const canvasWidth = this.paintlib.canvas.width;
    const canvasHeight = this.paintlib.canvas.height;

    const overlayColor = '#00000055';

    this.topRect.set({
      top: 0,
      left: 0,
      width: canvasWidth,
      height: this.cropSection.top,
      fill: overlayColor,
      strokeWidth: 0,
    });
    this.bottomRect.set({
      top: this.cropSection.top + this.cropSection.height,
      left: 0,
      width: canvasWidth,
      height: canvasHeight - this.cropSection.top - this.cropSection.height,
      fill: overlayColor,
      strokeWidth: 0,
    });
    this.leftRect.set({
      top: this.cropSection.top,
      left: 0,
      width: this.cropSection.left,
      height: this.cropSection.height,
      fill: overlayColor,
      strokeWidth: 0,
    });
    this.rightRect.set({
      top: this.cropSection.top,
      left: this.cropSection.left + this.cropSection.width,
      width: canvasWidth - this.cropSection.left - this.cropSection.width,
      height: this.cropSection.height,
      fill: overlayColor,
      strokeWidth: 0,
    });
    this.paintlib.canvas.renderAll();
  }*/
}
