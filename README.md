If you happen to be here, [see the post](https://whistlr.info/2021/disposable-web-components/).

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
