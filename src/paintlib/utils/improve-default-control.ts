import { createRotateControls } from './rotate-control';

export const renderControl = (ctx: CanvasRenderingContext2D, left: number, top: number) => {
  const size = 6;
  ctx.fillStyle = '#1e90ff';
  ctx.beginPath();
  ctx.arc(left, top, size, 0, Math.PI * 2, false);
  ctx.fill();
};

export const improveDefaultControl = (controls: any) => {
  delete controls.mtr;

  Object.values(controls).forEach((control: any) => {
    control.render = renderControl;
  });
  controls.resize = createRotateControls();
};
