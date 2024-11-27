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

  /**
   * This function take the actual layout & vector of an object and return the new layout & vector after resizing the
   * object using given rotation, delta and scale. Used for resizing using object Controls.
   *
   * @param layout
   * @param vector
   * @param rotation
   * @param delta
   * @param scale
   */
  transformLayoutVector(layout: TBBox, vector: Point, rotation: number, delta: Point, scale: Point): [TBBox, Point] {
    layout = { ...layout };

    if (this.horizontal === 'l') {
      // We move the left point: adjust x & width
      layout.width -= delta.x;

      layout.left += Math.cos(rotation) * delta.x * scale.x;
      layout.top += Math.sin(rotation) * delta.x * scale.y;
    } else if (this.horizontal === 'r') {
      // We move the right point: adjust width
      layout.width += delta.x;
    }

    if (this.vertical === 't') {
      // We move the top point: adjust x,y & height
      layout.height -= delta.y;

      layout.left += Math.cos(rotation + Math.PI / 2) * delta.y * scale.x;
      layout.top += Math.sin(rotation + Math.PI / 2) * delta.y * scale.y;
    } else if (this.vertical === 'b') {
      // We move the bottom point: adjust height
      layout.height += delta.y;
    }

    if (layout.width < 0) {
      vector = vector.multiply(new Point(-1, 1));
      layout.width = -layout.width;

      layout.left -= Math.cos(rotation) * layout.width * scale.x;
      layout.top -= Math.sin(rotation) * layout.width * scale.y;
    }
    if (layout.height < 0) {
      vector = vector.multiply(new Point(1, -1));
      layout.height = -layout.height;

      layout.left -= Math.cos(rotation + Math.PI / 2) * layout.height * scale.x;
      layout.top -= Math.sin(rotation + Math.PI / 2) * layout.height * scale.y;
    }

    return [layout, vector];
  }

  toString() {
    return this.vertical + this.horizontal;
  }
}
