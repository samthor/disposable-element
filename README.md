If you happen to be here, [see the post](https://whistlr.info/2021/disposable-web-components/).
This is a hopefully interesting idea, but not fully polished yet.

# Usage

Install via NPM, if you dare.
ESM only for now.
This has lit 2.0.0+ as a peer dependency.

```js
import { DisposableInner, disposableElement } from 'disposable-element';

class DemoInner extends DisposableInner {
  static properties = {
    something: { type: String },
  };

  /**
   * @param {(arg: () => void) => void} cleanup
   */
  constructor(cleanup) {
    super();
    const unsub = subscribeToSomething(this.something, this.#update);
    cleanup(unsub);
  }

  /**
   * @param {lit.PropertyValues} properties
   */
  shouldDispose(properties) {
    return properties.has('something');
  }

  /**
   * @param {any} snapshot
   */
  #update = (snapshot) => {
    // do something with database result
    this._data = snapshot;
  };

  render() {
    return html`<!-- render something -->`;
  }
}

/**
 * @typedef {InstanceType<typeof DemoElement>}
 */
export const DemoElement = disposableElement(DemoInner, { something: '' });
customElements.define('demo-something', DemoElement);
```

The awkward `@typedef` above is because classes in TS are both _values_ and _types_ (see [Twitter](https://twitter.com/nhardy96/status/1419596619519979528)), and the helper method `disposableElement` only returns the _value_.

It's possible to create the `DemoElement` by directly subclassing, too:

```js
export class DemoElement extends DisposableElement {
  constructor() {
    super(DemoInner, { chat: '' });
  }
}
```

&hellip;the idea is that you shouldn't really be interacting with the implementation `DemoElement`, though.
The second arg, in both cases, are the default values for your `properties` (and it's also used to type the class).

# TODOs

* Render inside `DisposableInner` will bind its event listeners to the outer element:

```js
class MyDisposable extends DisposableInner {

  render() {
    return html`<button @click=${this.click}></button>`;
  }

  click() {
    // "this" will be incorrect, and point to outer element
  }

}
```

* State isn't cleared between inner instances - should it be? State could represent database result, maybe extend `properties` to have an extra flag...

* No TS version
