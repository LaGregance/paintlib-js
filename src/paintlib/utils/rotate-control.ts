import { Control, controlsUtils } from 'fabric';

export const createRotateControls = () => {
  return new Control({
    x: 0,
    y: -0.5,
    offsetX: 0,
    offsetY: -30,
    cursorStyle: 'pointer',
    actionHandler: controlsUtils.rotationWithSnapping,
    actionName: 'rotate',
    render: (ctx, left, top) => {
      const size = 24;

      ctx.save();
      ctx.translate(left, top);

      const path = new Path2D(
        'M 11 22 q -1.25 -0.125 -2.4 -0.6125 T 6.4 20.1 l 1.4 -1.45 q 0.725 0.525 1.5375 0.85 t 1.6625 0.45 v 2.05 Z m 2 0 v -2.05 q 2.6 -0.375 4.3 -2.3375 T 19 13.05 q 0 -2.925 -2.0375 -4.9625 T 12 6.05 h -0.2 l 1.6 1.6 l -1.4 1.4 l -4 -4 l 4 -4 l 1.4 1.45 l -1.55 1.55 h 0.15 q 1.875 0 3.5125 0.7125 t 2.85 1.925 q 1.2125 1.2125 1.925 2.85 T 21 13.05 q 0 3.425 -2.275 5.9625 T 13 22 Z M 4.95 18.65 q -0.8 -1.05 -1.2875 -2.2 T 3.05 14.05 h 2.05 q 0.125 0.85 0.45 1.6625 t 0.85 1.5375 l -1.45 1.4 Z m -1.9 -6.6 q 0.15 -1.275 0.625 -2.45 t 1.275 -2.15 l 1.45 1.4 q -0.525 0.725 -0.85 1.5375 T 5.1 12.05 h -2.05 Z',
      );
      ctx.fillStyle = '#1e90ff'; // Icon color
      ctx.translate(-size / 2, -size / 2);
      ctx.scale(size / 24, size / 24); // Scale the SVG
      ctx.fill(path);

      ctx.restore();
    },
  });
};
