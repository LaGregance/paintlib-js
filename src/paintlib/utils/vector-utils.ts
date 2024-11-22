import { Point, TBBox } from 'fabric';

export const getStartPoint = (layout: TBBox, vector: Point) => {
  if (vector.x >= 0 && vector.y >= 0) {
    return new Point(layout.left, layout.top);
  } else if (vector.x >= 0 && vector.y < 0) {
    return new Point(layout.left, layout.top + layout.height);
  } else if (vector.x < 0 && vector.y >= 0) {
    return new Point(layout.left + layout.width, layout.top);
  } else {
    // x < 0 && y < 0
    return new Point(layout.left + layout.width, layout.top + layout.height);
  }
};

export const getEndPoint = (layout: TBBox, vector: Point) => {
  if (vector.x >= 0 && vector.y >= 0) {
    return new Point(layout.left + layout.width, layout.top + layout.height);
  } else if (vector.x >= 0 && vector.y < 0) {
    return new Point(layout.left + layout.width, layout.top);
  } else if (vector.x < 0 && vector.y >= 0) {
    return new Point(layout.left, layout.top + layout.height);
  } else {
    // x < 0 && y < 0
    return new Point(layout.left, layout.top);
  }
};
