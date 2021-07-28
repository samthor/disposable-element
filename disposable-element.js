import { LitElement } from "lit";
import * as lit from 'lit';


/** @type {DisposableElement?} */
let globalCtorHost = null;


/**
 * Used to hide the immediate refresh symbol on {@link DisposableElement} so it can only be called
 * via the inner's `dispose` method.
 */
const refreshSymbol = Symbol('refresh');


export class DisposableInner {

  /** @type {DisposableElement} */
  #host;

  /**
   * We need this ctor to create initial getters.
   *
   * @param {(fn: () => void) => void} cleanup not required but satisfies TS
   */
  constructor(cleanup = () => { }) {
    // Steal the global host that's set just during construction.
    if (!globalCtorHost) {
      throw new Error(`could not ctor DisposableInner, no global host`);
    }
    const host = globalCtorHost;
    this.#host = host;

    /** @type {{[key: string]: lit.PropertyDeclaration}} */
    // @ts-ignore
    const properties = { ...this.constructor['properties'] };

    /** @type {PropertyDescriptorMap} */
    const define = {};

    for (const [name, def] of Object.entries(properties)) {
      // TODO: what does noAccessor mean here?
      // We're ignoring it, but the user might expect something...

      define[name] = {
        get() {
          // @ts-ignore
          return host[name];
        },
        set(v) {
          // @ts-ignore
          host[name] = v;
        },
        configurable: false,  // prevents accidental override
        enumerable: true,
      };
    }

    Object.defineProperties(this, define);
  }

  get host() {
    return this.#host;
  }

  /**
   * @param {string=} name
   * @param {unknown=} oldValue
   * @param {lit.PropertyDeclaration=} options
   */
  requestUpdate(name, oldValue, options) {
    this.#host.requestUpdate(name, oldValue, options);
  }

  /**
   * @param {lit.PropertyValues} changedProperties
   * @return {boolean}
   */
  shouldUpdate(changedProperties) {
    return true;
  }

  /**
   * @param {lit.PropertyValues} changedProperties
   * @return {boolean}
   */
  shouldDispose(changedProperties) {
    return false;
  }

  /**
   * Immediately dispose of this inner. It should not be used after this call.
   */
  dispose() {
    this.#host[refreshSymbol]();
  }

  /**
   * @return {unknown}
   */
  render() {
    throw new Error(`inner must implement render()`);
  }
}


class DisposableElement extends LitElement {
  #cleanup = () => { };
  #ctor;

  /** @type {DisposableInner?} */
  #inner = null;

  /**
   * @param {typeof DisposableInner} ctor
   * @param {{[name: string]: any}} defaultProps
   */
  constructor(ctor, defaultProps) {
    super();
    this.#ctor = ctor;
    Object.assign(this, defaultProps);
  }

  /**
   * Immediately dispose of this element's inner, and force it to be recreated.
   */
  [refreshSymbol]() {
    if (this.#inner !== null) {
      this.#cleanup();
      this.#cleanup = () => { };
      this.#inner = null;
    }

    if (!this.isConnected) {
      return;
    }

    /** @type {(() => void)[]} */
    const cleanupTasks = [];

    /** @type {(fn: () => void) => void} */
    const cleanup = (fn) => void cleanupTasks.push(fn);

    try {
      globalCtorHost = this;
      this.#inner = new this.#ctor(cleanup);
    } finally {
      globalCtorHost = null;
    }

    this.#cleanup = () => cleanupTasks.forEach((fn) => fn());
  }

  connectedCallback() {
    super.connectedCallback();

    // If we had an inner, we're being moved somewhere, so don't refresh.
    if (this.#inner === null) {
      this[refreshSymbol]();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Only delete if we're not being attached somewhere else.
    if (!this.isConnected) {
      this[refreshSymbol]();
    }
  }

  /**
   * @param {lit.PropertyValues} changedProperties
   */
  shouldUpdate(changedProperties) {
    if (this.#inner === null) {
      return false;
    }

    // Only refresh if we've updated at least once.
    if (this.hasUpdated && this.#inner.shouldDispose(changedProperties)) {
      this[refreshSymbol]();
      return true;
    }

    return this.#inner.shouldUpdate(changedProperties);
  }


  render() {
    const i = /** @type {DisposableInner} */ (this.#inner);
    return i.render();
  }
}


/**
 * @template T
 * @param {typeof DisposableInner} ctor
 * @param {(T & {[name: string]: any})=} defaultProps
 * @return {{ new(): HTMLElement & T }}
 */
export function disposableElement(ctor, defaultProps) {

  /** @type {{[key: string]: lit.PropertyDeclaration}} */
  // @ts-ignore
  const properties = { ...ctor.properties };

  // Ensure accessors on the outer element, because the user can't actually create them.
  for (const prop in properties) {
    const options = properties[prop];
    if (options.noAccessor) {
      const { noAccessor: _, ...update } = options;
      properties[prop] = update;
    }
  }

  // @ts-ignore
  const styles = ctor.styles;

  // We promise that this constructor will have the properties of "defaultProps" when it's done.
  const out = /** @type {unknown} */ (class extends DisposableElement {
    static properties = properties;
    static styles = styles;

    constructor() {
      super(ctor, defaultProps ?? {});
    }
  });

  return /** @type {({ new(): HTMLElement & T })} */ (out);
}

