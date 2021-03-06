import { DisposableElement, disposableElement, DisposableInner } from "../../disposable-element";
import * as lit from 'lit';
import { html } from "lit";


/**
 * @param {string} id
 * @param {(arg: string) => void} callback
 */
const onPretendSnapshot = (id, callback) => {

  let interval = 0;
  let timeout = window.setTimeout(() => {
    callback(`Some initial data for ${id}: ${Math.random()}`);
    interval = window.setInterval(() => {
      callback(`Some updated data for ${id}: ${Math.random()}`);
    }, 2500);
  }, 500);

  return () => {
    window.clearTimeout(timeout);
    window.clearInterval(interval);
  };
};



class ChatInner extends DisposableInner {
  static properties = {
    chat: { type: String },
    _data: { type: String, state: true },
  };

  /**
   * @param {(arg: () => void) => void} cleanup
   */
  constructor(cleanup) {
    super();

    // This isn't TS, we need to pretend this.chat exists. The super() call creates the getter and
    // setter for us.
    /** @type {string} */
    this.chat;

    if (this.chat) {
      const unsub = onPretendSnapshot(this.chat, this.#update);
      cleanup(unsub);
    }

    // FIXME: need to clear state (stored between instances)
    this._data = '';
  }

  /**
   * @param {lit.PropertyValues} properties
   */
  shouldDispose(properties) {
    return properties.has('chat');
  }

  /**
   * @param {any} snapshot
   */
  #update = (snapshot) => {
    // do something with database result
    this._data = snapshot;
  };

  render() {
    return html`
      <h1>Chat: "${this.chat}"</h1>
      <p>${this._data}</p>
    `;
  }
}

/**
 * @typedef {InstanceType<typeof ChatElement>}
 */
export const ChatElement = disposableElement(ChatInner, { chat: '' });
customElements.define('chat-view', ChatElement);


export class ChatElement2 extends DisposableElement {
  constructor() {
    super(ChatInner, { chat: '' });
  }
}
customElements.define('chat-view2', ChatElement2);
