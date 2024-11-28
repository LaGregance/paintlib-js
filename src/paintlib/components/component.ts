export abstract class Component<K extends keyof HTMLElementTagNameMap> {
  public readonly element: HTMLElementTagNameMap[K];
  private defaultVisibility: string;
  protected children: Component<any>[];

  constructor(tagName: K) {
    this.element = document.createElement(tagName);
    this.children = [];
  }

  abstract init(): void;

  add(child: Component<any>) {
    this.children.push(child);
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
