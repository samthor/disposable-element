
import * as lit from 'lit';
import { DisposableElement } from './disposable-element';


export interface DisposableInnerInterface {

  readonly host: DisposableElement;

  /**
   * As per `lit`.
   */
  requestUpdate(name?: string, oldValue?: unknown, options?: lit.PropertyDeclarations): void;

  /**
   * As per `lit`.
   */
  shouldUpdate(changedProperties: lit.PropertyValues): boolean;

  /**
   * Controls whether `dispose` should be called based on changed values. This is passed the previous values in
   * the parameter, just like `shouldUpdate`.
   */
  shouldDispose(changedProperties: lit.PropertyValues): boolean;

  /**
   * Immediately dispose of this inner. It should not be used after this call.
   */
  dispose(): void;

  /**
   * As per `lit`.
   */
  render(): unknown;

}


export type CleanupType = (fn: () => void) => void;