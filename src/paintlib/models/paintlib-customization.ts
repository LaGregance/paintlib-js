import { PaintActionType } from './paint-action-type';
import { PaintLib } from '../paintlib';

export type PaintlibCustomization = {
  /**
   * Define available colors in color picker
   */
  palette?: string[];

  /**
   * Define available tickness in picker
   */
  tickness?: number[];

  /**
   * Define available actions. Pro tips: use PaintActionBuilder to build the array.
   *
   * Default: All
   */
  actions?: PaintActionType[];

  /**
   * When false, the options bar (for color, tickness picker) is always visible
   */
  proactivelyShowOptions?: boolean;

  /**
   * When true, there will be tooltip when button are hover (you can customize the text in the "label" field)
   */
  enableTooltip?: boolean;

  /**
   * When true, the clear button will also erase the image
   */
  clearEraseImage?: boolean;

  /**
   * Override the behavior of the specified action (only work for click action).
   * Return true if the behavior is well override, else return false to execute the default action.
   *
   * @param paintlib
   */
  onActionOverride?: (action: PaintActionType, paintlib: PaintLib) => boolean | Promise<boolean>;

  /**
   * Customize the style of the UI
   */
  style?: {
    menuColor?: string;
    iconColor?: string;
    backgroundColor?: string;
    buttonSize?: number;
    iconSize?: number;
    buttonGap?: number;
    groupGap?: number;
    tooltipBackgroundColor?: string;
    tooltipColor?: string;
    tooltipFontFamily?: string;
  };

  /**
   * Customize texts
   */
  labels?: {
    tooltip?: {
      [key in PaintActionType]?: string;
    };
  };
};
