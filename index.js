import { TestDisposableElement } from './elements/test-disposable.js';


const changeBarElement = /** @type {HTMLButtonElement} */ (document.getElementById('changeBar'));

// TODO: this type is basically wrong
const changeDisposableElement = /** @type {TestDisposableElement} */ (document.getElementById('changeDisposable'));


changeBarElement.addEventListener('click', (event) => {
  changeDisposableElement.bar = 'value-' + Math.random();
});
