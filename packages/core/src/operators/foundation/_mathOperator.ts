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
  isDefined,
  isDimensions,
  isPoint2D,
} from '../../typeGuards';

import {
  Constructor,
  Dimensions,
  MathOperation,
  MotionReactiveMappable,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
} from '../../types';

import {
  _ReactiveMapOptions,
} from './_reactiveMap';

export type _MathOperatorArgs<U> = _ReactiveMapOptions & {
  operation: MathOperation,
  value$: U | Observable<U>,
};

export interface MotionMathOperable<T> {
  _mathOperator<U extends T & (number | Point2D | Dimensions)>(kwargs: _MathOperatorArgs<U>): ObservableWithMotionOperators<U>;
}

export function withMathOperator<T, S extends Constructor<MotionReactiveMappable<T>>>(superclass: S): S & Constructor<MotionMathOperable<T>> {
  return class extends superclass implements MotionMathOperable<T> {
    /**
     * Applies the operation to each dimension and emits the result.
     */
    _mathOperator<U extends T & (number | Point2D | Dimensions)>({ operation, value$, ...reactiveMapOptions }: _MathOperatorArgs<U>): ObservableWithMotionOperators<U> {
      return (this as any as MotionReactiveMappable<U>)._reactiveMap({
        transform: ({ upstream, value }) => {
          if (isPoint2D(upstream)) {
            return {
              x: operation(upstream.x, isDefined(value) ? (value as Point2D).x: undefined!),
              y: operation(upstream.y, isDefined(value) ? (value as Point2D).y: undefined!),
            } as U;

          // This block is just copy/pasted from the isPoint2D block.  It may
          // eventually be worth making this smart enough to handle arbitrarily-
          // shaped objects, but for now, we can cover most cases with just
          // these two shapes.
          } else if (isDimensions(upstream)) {
            return {
              width: operation(upstream.width, isDefined(value) ? (value as Point2D).width: undefined!),
              height: operation(upstream.height, isDefined(value) ? (value as Point2D).height: undefined!),
            } as U;

          } else {
            return operation(upstream as number, value as number) as U;
          }
        },
        inputs: {
          value: value$,
        },
        ...reactiveMapOptions
      });
    }
  };
}
