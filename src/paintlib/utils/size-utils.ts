import { Size } from '../models/size';

export function calculateImageScaleToFitViewport(viewport: Size, image: Size) {
  // Calculate the scale factors for both width and height
  const scaleX = viewport.width / image.width;
  const scaleY = viewport.height / image.height;
  const scale = Math.min(scaleX, scaleY);

  // The scale factor to fit the image in the viewport, maintaining aspect ratio
  return {
    scale,
    width: image.width * scale,
    height: image.height * scale,
  };
}
