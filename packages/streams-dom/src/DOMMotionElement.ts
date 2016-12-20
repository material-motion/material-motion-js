/** @license
 *  Copyright 2016 - present The Material Motion Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not
 *  use this file except in compliance with the License. You may obtain a copy
 *  of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *  License for the specific language governing permissions and limitations
 *  under the License.
 */

import {
  IndefiniteObservable,
  Observer,
} from 'indefinite-observable';

export type DOMMotionElementArgs = {
  domNode: Element,
};

export class DOMMotionElement {
  _domNode: Element;

  constructor({ domNode }: DOMMotionElementArgs) {
    this._domNode = domNode;
  }

  getEvent$(eventType: string) {
    return new IndefiniteObservable(
      (observer: Observer<UIEvent>) => {
        this._domNode.addEventListener(eventType, observer.next);

        return () => {
          this._domNode.removeEventListener(eventType, observer.next);
        }
      }
    )
  }
}

export function createMotionElementFromDOMNode(domNode: Element): DOMMotionElement {
  return new DOMMotionElement({ domNode });
}
