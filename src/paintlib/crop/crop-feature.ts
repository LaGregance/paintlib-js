import { Control, Path, Point, TBBox, TPointerEventInfo, Transform } from 'fabric';
import { PaintLib } from '../paintlib';
import { renderControl } from '../utils/improve-default-control';
import { TransformCorner } from '../utils/transform-corner';
import { boxEqual } from '../utils/utils';

export class CropFeature {
  private path: Path;
  private cropSection: TBBox;

  private moveInitialInfo?: { point: Point; cropSection: TBBox };

  constructor(
    private paintlib: PaintLib,
    defaultCrop?: TBBox,
  ) {
    const canvasWidth = paintlib.canvas.width;
    const canvasHeight = paintlib.canvas.height;

    this.cropSection = defaultCrop || {
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
      hoverCursor: 'default',
      moveCursor: 'default',
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

        const corner = TransformCorner.parse(transform.corner);
        const delta = new Point(eventX - originalEventInfo.point.x, eventY - originalEventInfo.point.y);
        this.cropSection = corner.transformLayout(originalEventInfo.cropSection, delta);

        const canvasWidth = paintlib.canvas.width;
        const canvasHeight = paintlib.canvas.height;
        if (this.cropSection.top < 0) {
          this.cropSection.height += this.cropSection.top;
          this.cropSection.top = 0;
        }
        if (this.cropSection.top + this.cropSection.height > canvasHeight) {
          this.cropSection.height = canvasHeight - this.cropSection.top;
        }

        if (this.cropSection.left < 0) {
          this.cropSection.width += this.cropSection.left;
          this.cropSection.left = 0;
        }
        if (this.cropSection.left + this.cropSection.width > canvasWidth) {
          this.cropSection.width = canvasWidth - this.cropSection.left;
        }

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

    this.paintlib.canvas.on('mouse:down', this.onPointerDown);
    this.paintlib.canvas.on('mouse:move', this.onPointerMove);
    this.paintlib.canvas.on('mouse:up', this.onPointerUp);
  }

  full() {
    const canvasWidth = this.paintlib.canvas.width;
    const canvasHeight = this.paintlib.canvas.height;
    this.cropSection = { left: 0, top: 0, width: canvasWidth, height: canvasHeight };
    this.calcPath();
  }

  save(): TBBox {
    // Convert cropSection to relative image position
    const topLeftPoint = this.paintlib.getRealPosFromCanvas(new Point(this.cropSection.left, this.cropSection.top));
    const bottomRightPoint = this.paintlib.getRealPosFromCanvas(
      new Point(this.cropSection.left + this.cropSection.width, this.cropSection.top + this.cropSection.height),
    );
    const realCrop: TBBox = {
      left: Math.min(topLeftPoint.x, bottomRightPoint.x),
      top: Math.min(topLeftPoint.y, bottomRightPoint.y),
      width: Math.abs(topLeftPoint.x - bottomRightPoint.x),
      height: Math.abs(topLeftPoint.y - bottomRightPoint.y),
    };

    this.destroy();

    const canvasWidth = this.paintlib.canvas.width;
    const canvasHeight = this.paintlib.canvas.height;
    return boxEqual(realCrop, { left: 0, top: 0, width: canvasWidth, height: canvasHeight }) ? undefined : realCrop;
  }

  cancel() {
    this.destroy();
  }

  private destroy() {
    this.paintlib.canvas.off('mouse:down', this.onPointerDown);
    this.paintlib.canvas.off('mouse:move', this.onPointerMove);
    this.paintlib.canvas.off('mouse:up', this.onPointerUp);
    document.querySelectorAll('canvas').forEach((el) => {
      el.style.removeProperty('cursor');
    });
    this.paintlib.canvas.remove(this.path);
  }

  private isPointOnCropSection(point: Point) {
    const SAFE_DELTA = 5;
    return (
      point.x >= this.cropSection.left + SAFE_DELTA &&
      point.x <= this.cropSection.left + this.cropSection.width - 2 * SAFE_DELTA &&
      point.y >= this.cropSection.top + SAFE_DELTA &&
      point.y <= this.cropSection.top + this.cropSection.height - 2 * SAFE_DELTA
    );
  }

  private onPointerDown = (event: TPointerEventInfo) => {
    if (this.isPointOnCropSection(event.scenePoint)) {
      this.moveInitialInfo = { point: event.scenePoint, cropSection: { ...this.cropSection } };
    }
  };

  private onPointerMove = (event: TPointerEventInfo) => {
    if (this.moveInitialInfo) {
      const canvasWidth = this.paintlib.canvas.width;
      const canvasHeight = this.paintlib.canvas.height;

      const delta = new Point(
        event.scenePoint.x - this.moveInitialInfo.point.x,
        event.scenePoint.y - this.moveInitialInfo.point.y,
      );

      this.cropSection.left = this.moveInitialInfo.cropSection.left + delta.x;
      if (this.cropSection.left < 0) {
        this.cropSection.left = 0;
      }
      if (this.cropSection.left + this.cropSection.width > canvasWidth) {
        this.cropSection.left = canvasWidth - this.cropSection.width;
      }

      this.cropSection.top = this.moveInitialInfo.cropSection.top + delta.y;
      if (this.cropSection.top < 0) {
        this.cropSection.top = 0;
      }
      if (this.cropSection.top + this.cropSection.height > canvasHeight) {
        this.cropSection.top = canvasHeight - this.cropSection.height;
      }
      this.calcPath();
    } else {
      if (this.isPointOnCropSection(event.scenePoint)) {
        document.querySelectorAll('canvas').forEach((el) => {
          el.style.cursor = 'pointer';
        });
      } else {
        document.querySelectorAll('canvas').forEach((el) => {
          el.style.removeProperty('cursor');
        });
      }
    }
  };

  private onPointerUp = () => {
    this.moveInitialInfo = undefined;
    document.querySelectorAll('canvas').forEach((el) => {
      el.style.removeProperty('cursor');
    });
  };

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

    if (!this.paintlib.canvas.getActiveObject()) {
      setTimeout(() => {
        this.paintlib.canvas.setActiveObject(this.path);
        this.paintlib.canvas.renderAll();
      });
    }
  }
}
