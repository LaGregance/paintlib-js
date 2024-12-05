import { Size } from '../models/size';

export function calculateCanvasSizeToFitViewport(viewport: Size, image: Size) {
  // Calculate the scale factors for both width and height
  const scaleX = viewport.width / image.width;
  const scaleY = viewport.height / image.height;
  const scale = Math.min(scaleX, scaleY);

  return {
    width: image.width * scale,
    height: image.height * scale,
  };
}
