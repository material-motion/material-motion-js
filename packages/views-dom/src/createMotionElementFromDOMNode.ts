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
  MotionElement,
  MotionObservable,
  MotionObserver,
  Point2D,
} from 'material-motion';

export default function createMotionElementFromDOMNode(domNode: Element): MotionElement {
  return {
    // This is a `MotionObservable` because that's where our operators live
    // right now.  Since it doesn't use `observer.state`, it could be replaced
    // with a simpler Observable if we had one.
    getEvent$(eventType: string) {
      return new MotionObservable(
        (observer: MotionObserver<UIEvent>) => {
          domNode.addEventListener(eventType, observer.next);

          return () => {
            domNode.removeEventListener(eventType, observer.next);
          };
        }
      );
    },

    scrollPosition: {
      read():Point2D {
        return {
          x: domNode.scrollLeft,
          y: domNode.scrollTop,
        };
      },

      write({ x, y }:Partial<Point2D>): void {
        if (x !== undefined) {
          domNode.scrollLeft = x;
        }

        if (y !== undefined) {
          domNode.scrollTop = y;
        }
      },
    }
  };
}
