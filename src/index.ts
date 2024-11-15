import './styles.css';
import { PaintLib } from './paintlib/paintlib';

export async function init(container: HTMLElement) {
  const paintlib = new PaintLib(container);
  await paintlib.loadImage();
  paintlib.createText();
}

const container = document.getElementById('root');
if (container) {
  init(container);
}
