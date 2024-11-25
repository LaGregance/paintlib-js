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

  static parseFromVector(vector: Point, point: 'start' | 'end'): TransformCorner {
    let vertical: VerticalPlace;
    let horizontal: HorizontalPlace;

    if (point === 'start') {
      vertical = vector.y > 0 ? 't' : 'b';
      horizontal = vector.x > 0 ? 'l' : 'r';
    } else {
      vertical = vector.y > 0 ? 'b' : 't';
      horizontal = vector.x > 0 ? 'r' : 'l';
    }

    return new TransformCorner(vertical, horizontal);
  }

  constructor(
    public readonly vertical: VerticalPlace,
    public readonly horizontal: HorizontalPlace,
  ) {}

  getTransformOffset(angle: number, deltaX: number, deltaY: number, scaleX: number, scaleY: number): TBBox {
    const transform: TBBox = { left: 0, top: 0, width: 0, height: 0 };

    if (this.horizontal === 'l') {
      // We move the left point: adjust x,y & width
      transform.width -= deltaX;

      transform.left += Math.cos(angle) * deltaX * scaleX;
      transform.top += Math.sin(angle) * deltaX * scaleY;
    } else if (this.horizontal === 'r') {
      // We move the right point: adjust width
      transform.width += deltaX;
    }

    if (this.vertical === 't') {
      // We move the top point: adjust x,y & height
      transform.height -= deltaY;

      transform.left += Math.cos(angle + Math.PI / 2) * deltaY * scaleX;
      transform.top += Math.sin(angle + Math.PI / 2) * deltaY * scaleY;
    } else if (this.vertical === 'b') {
      // We move the bottom point: adjust height
      transform.height += deltaY;
    }

    return transform;
  }

  toString() {
    return this.vertical + this.horizontal;
  }
}
