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

export const getUrlFileType = (urlOrPath: string) => {
  const mapType = (type: string) => {
    if (type === 'jpg') return 'jpeg';
    else return type;
  };

  try {
    // Check for data URLs
    const dataUrlRegex = /^data:([\w/+-]+);/;
    const matchDataUrl = urlOrPath.match(dataUrlRegex);
    if (matchDataUrl) {
      // Extract the MIME type and return the subtype as the extension
      const mimeType = matchDataUrl[1];
      return mapType(mimeType.split('/')[1]);
    }

    // General file or URL path
    const filePathRegex = /\.([a-zA-Z0-9]+)(?=\?|#|$)/;
    const matchFilePath = urlOrPath.match(filePathRegex);
    if (matchFilePath) {
      return mapType(matchFilePath[1]);
    }

    // If no extension is found, return null
    return null;
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

export const hasParent = (element: HTMLElement, parent: HTMLElement) => {
  let it = element;
  while (it) {
    if (it === parent) {
      return true;
    }
    it = it.parentElement;
  }
  return false;
};
