import { Point, TBBox } from 'fabric';

export const getStartPoint = (layout: TBBox, vector: Point, scale = 1) => {
  if (vector.x >= 0 && vector.y >= 0) {
    return new Point(layout.left, layout.top);
  } else if (vector.x >= 0 && vector.y < 0) {
    return new Point(layout.left, layout.top + layout.height * scale);
  } else if (vector.x < 0 && vector.y >= 0) {
    return new Point(layout.left + layout.width * scale, layout.top);
  } else {
    // x < 0 && y < 0
    return new Point(layout.left + layout.width * scale, layout.top + layout.height * scale);
  }
};

export const getEndPoint = (layout: TBBox, vector: Point, scale = 1) => {
  if (vector.x >= 0 && vector.y >= 0) {
    return new Point(layout.left + layout.width * scale, layout.top + layout.height * scale);
  } else if (vector.x >= 0 && vector.y < 0) {
    return new Point(layout.left + layout.width * scale, layout.top);
  } else if (vector.x < 0 && vector.y >= 0) {
    return new Point(layout.left, layout.top + layout.height * scale);
  } else {
    // x < 0 && y < 0
    return new Point(layout.left, layout.top);
  }
};
