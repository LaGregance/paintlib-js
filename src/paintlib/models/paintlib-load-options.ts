export type PaintlibLoadOptions = {
  /**
   * Image URL or dataURL to load
   */
  image?: string;

  /**
   * When loading an image, should we use the real size of the image or the viewport size.
   * In every case the image will fit the viewport but when drawing the same scale as the image will be applied to the object.
   * if you use 'real' size.
   *
   * Default: viewport
   */
  imageSizeMode?: 'real' | 'viewport';

  /**
   * When saving an image, should we use the real size of the image or the viewport size.
   *
   * Default: real
   */
  imageSaveMode?: 'real' | 'viewport';

  /**
   * Format to use when saving, default to png.
   */
  format?: 'png' | 'jpeg';

  /**
   * Restore data from a previous edition
   */
  restoreData?: string;

  /**
   * In case of freedrawing, set the height of the canvas. Default to viewport height.
   * In every case the image will fit the viewport but when drawing the same scale will be applied to the object.
   * Incompatible with image/imageSizeMode.
   */
  height?: number;

  /**
   * In case of freedrawing, set the width of the canvas. Default to viewport width.
   * Incompatible with image/imageSizeMode.
   */
  width?: number;
};
