import { html, css } from 'lit';
import * as lit from 'lit';
import { disposableElement, DisposableInner } from '../disposable-element';


let renders = 0;


export class TestDisposableInner extends DisposableInner {

  /**
   * @param {(fn: () => void) => void} cleanup
   */
  constructor(cleanup) {
    super();

    console.debug('disposable create', this);
    cleanup(() => console.debug('disposable gone', this));

    // This works fine.
    if (this.foo === undefined) {
      /** @type {string} */
      this.foo = 'fooWasUndefinedLol';
    }

    // This can assert types without setting them.
    /** @type {string} */
    this.foo;

    /** @type {string} */
    this.bar;

    /** @type {number} */
    this._blah = Math.random();
  }

  static properties = {
    foo: { type: String, reflect: true },
    bar: { type: String },
    _blah: { type: Number, state: true },
  };

  static styles = css`
h1 {
  font: inherit;
  font-weight: 400;
  padding: 8px;
  background: #eee;
  margin: 0;
}
p {
  margin: 0;
  padding: 8px;
  background: #666;
  color: white;
}
span {
  color: blue;
}
  `;

  /**
   * @param {lit.PropertyValues} changedProperties
   */
  shouldDispose(changedProperties) {

    if (changedProperties.has('bar')) {
      console.debug('got shouldDispose', changedProperties.get('bar'), this.bar);
    }
    return changedProperties.has('bar');
  }

  render() {
    return html`
<h1>Disposable <span>Element</span></h1>
<p>foo=${this.foo} blah=${this._blah} renders=${renders} <button @click=${this.#clickRender}>Update</button></p>
    `;
  }

  /**
   * @param {Event} event
   */
  #clickRender = (event) => {
    // FIXME: if this is a regular method (not a private one), the "this" is the element,
    // not the inner :\
    console.info('render clicked', event, this);
    ++renders;
    this.requestUpdate();

    const h1 = this.host.renderRoot.querySelector('h1');
    console.info('h1 is', h1);
  };

}


const TestDisposableElement = disposableElement(TestDisposableInner, {
  foo: 'defaultValueFromArg',
  bar: 'whoKnows'
});
customElements.define('test-disposable', TestDisposableElement);