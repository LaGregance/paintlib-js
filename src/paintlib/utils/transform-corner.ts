import { Point, TBBox } from 'fabric';

export type VerticalPlace = 't' | 'm' | 'b';
export type HorizontalPlace = 'l' | 'm' | 'r';

export class TransformCorner {
  static parse(corner: string): TransformCorner {
    if (corner.length !== 2) {
      throw new Error(`Bad corner format ${corner}`);
    }
    if (!['t', 'm', 'b'].includes(corner.charAt(0)) || !['l', 'm', 'r'].includes(corner.charAt(1))) {
      throw new Error(`Bad corner format ${corner}`);
    }

    return new TransformCorner(corner.charAt(0) as any, corner.charAt(1) as any);
  }

  constructor(
    public readonly vertical: VerticalPlace,
    public readonly horizontal: HorizontalPlace,
  ) {}

  private static oppositeHz(hz: HorizontalPlace): HorizontalPlace {
    if (hz === 'l') return 'r';
    else if (hz === 'r') return 'l';
    else return hz;
  }

  private static oppositeVert(vert: VerticalPlace): VerticalPlace {
    if (vert === 't') return 'b';
    else if (vert === 'b') return 't';
    else return vert;
  }

  getOpposite(mode: 'horizontal' | 'vertical' | 'diagonal' = 'diagonal'): TransformCorner {
    let oppositeVertical = this.vertical;
    let oppositeHorizontal = this.horizontal;

    if (mode === 'horizontal') {
      oppositeHorizontal = TransformCorner.oppositeHz(oppositeHorizontal);
    } else if (mode === 'vertical') {
      oppositeVertical = TransformCorner.oppositeVert(oppositeVertical);
    } else {
      oppositeHorizontal = TransformCorner.oppositeHz(oppositeHorizontal);
      oppositeVertical = TransformCorner.oppositeVert(oppositeVertical);
    }

    return new TransformCorner(oppositeVertical, oppositeHorizontal);
  }

  getPointInBox(layout: TBBox): Point {
    let x = layout.left;
    let y = layout.top;

    if (this.horizontal === 'm') {
      x += layout.width / 2;
    } else if (this.horizontal === 'r') {
      x += layout.width;
    }

    if (this.vertical === 'm') {
      y += layout.height / 2;
    } else if (this.vertical === 'b') {
      y += layout.height;
    }

    return new Point(x, y);
  }

  getTransformWidth(box: TBBox, eventX: number) {
    if (this.horizontal === 'm') {
      return box.width;
    } else {
      return this.horizontal === 'r' ? eventX - box.left : box.left + box.width - eventX;
    }
  }

  getTransformHeight(box: TBBox, eventY: number) {
    if (this.vertical === 'm') {
      return box.height;
    } else {
      return this.vertical === 'b' ? eventY - box.top : box.top + box.height - eventY;
    }
  }

  getTransformOffset(box: TBBox, eventX: number, eventY: number): TBBox {
    const transform: TBBox = { left: 0, top: 0, width: 0, height: 0 };

    if (this.horizontal === 'l') {
      // We move the left point: adjust x
      const deltaX = box.left - eventX;
      transform.left -= deltaX;
      transform.width += deltaX;
    } else if (this.horizontal === 'r') {
      // We move the right point: adjust width
      const deltaX = eventX - (box.left + box.width);
      transform.width += deltaX;
    }

    if (this.vertical === 't') {
      // We move the top point: adjust y
      const deltaY = box.top - eventY;
      transform.top -= deltaY;
      transform.height += deltaY;
    } else if (this.vertical === 'b') {
      // We move the right point: adjust height
      const deltaY = eventY - (box.top + box.height);
      transform.height += deltaY;
    }

    return transform;
  }

  toString() {
    return this.vertical + this.horizontal;
  }
}
