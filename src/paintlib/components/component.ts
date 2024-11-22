export abstract class Component<K extends keyof HTMLElementTagNameMap> {
  public readonly element: HTMLElementTagNameMap[K];
  private defaultVisibility: string;

  constructor(tagName: K) {
    this.element = document.createElement(tagName);
  }

  abstract init(): void;

  add(child: Component<any>) {
    this.element.appendChild(child.element);
    child.init();
  }

  setVisible(visible: boolean) {
    if (this.element.style.display !== 'none') {
      this.defaultVisibility = this.element.style.display;
    }

    if (visible) {
      if (this.defaultVisibility) {
        this.element.style.display = this.defaultVisibility;
      } else {
        this.element.style.removeProperty('display');
      }
    } else {
      this.element.style.display = 'none';
    }
  }

  isVisible() {
    return this.element.style.display !== 'none';
  }
}
