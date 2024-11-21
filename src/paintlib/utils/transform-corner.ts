import { TBBox } from 'fabric';

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

  getTransformOffset(angle: number, deltaX: number, deltaY: number): TBBox {
    const transform: TBBox = { left: 0, top: 0, width: 0, height: 0 };

    if (this.horizontal === 'l') {
      // We move the left point: adjust x,y & width
      transform.width -= deltaX;

      transform.left += Math.cos(angle) * deltaX;
      transform.top += Math.sin(angle) * deltaX;
    } else if (this.horizontal === 'r') {
      // We move the right point: adjust width
      transform.width += deltaX;
    }

    if (this.vertical === 't') {
      // We move the top point: adjust x,y & height
      transform.height -= deltaY;

      transform.left -= Math.cos(angle) * deltaY;
      transform.top += Math.sin(angle) * deltaY;
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
