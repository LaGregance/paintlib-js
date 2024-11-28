import { TBBox } from 'fabric';

export const xor = (a: boolean, b: boolean) => {
  return (a || b) && !(a && b);
};

export const px = (value: number) => {
  return `${value}px`;
};

export const setCssProperty = (style: any, field: string, property: string, defaultValue: any) => {
  let rawValue: any;

  if (style[field]) {
    rawValue = style[field];
  } else {
    style[field] = defaultValue;
    rawValue = defaultValue;
  }

  if (typeof rawValue === 'number') {
    document.documentElement.style.setProperty(property, rawValue + 'px');
  } else if (typeof rawValue === 'string') {
    document.documentElement.style.setProperty(property, rawValue);
  } else {
    throw new Error(`Invalid style property value: ${rawValue}`);
  }
};

export const getUrlExtension = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
};

export const boxEqual = (a: TBBox, b: TBBox) => {
  if (a === b) {
    return true;
  } else if (!a || !b) {
    return false;
  } else {
    return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;
  }
};
