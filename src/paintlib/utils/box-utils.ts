import { Point, TBBox, util } from 'fabric';

export const getBoxFromPoints = (a: Point, b: Point): TBBox => ({
  left: Math.min(a.x, b.x),
  top: Math.min(a.y, b.y),
  width: Math.abs(a.x - b.x),
  height: Math.abs(a.y - b.y),
});

/**
 * Rotate a box
 *
 * @param box
 * @param rotation in deg (modulo of 90)
 */
export const rotateBox = (box: TBBox, rotation: number): TBBox => {
  if (rotation % 90 !== 0) {
    throw new Error('Can only rotate box by a modulo of 90 deg');
  }
  const topRight = new Point(box.left, box.top);
  const bottomRight = new Point(box.width, box.height).rotate(util.degreesToRadians(rotation));
  return getBoxFromPoints(topRight, topRight.add(bottomRight));
};
