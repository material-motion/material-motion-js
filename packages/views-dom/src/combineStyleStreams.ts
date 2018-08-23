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

import * as CSS from 'csstype';

import {
  Dict,
  Dimensions,
  MaybeReactive,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
  StyleStreams,
  combineLatest,
} from 'material-motion';

export type PrimitiveStyleDict = Partial<{
  opacity: number,
  translate: Partial<Point2D>,
  rotate: number,
  scale: number,
  dimensions: Partial<Dimensions>,
}> & CSS.Properties;

export function combineStyleStreams(styleStreams: Partial<StyleStreams>): ObservableWithMotionOperators<CSS.Properties> {
  return combineLatest<PrimitiveStyleDict, MaybeReactive<PrimitiveStyleDict>>(
    stripStreamSuffices(styleStreams as StyleStreams) as MaybeReactive<PrimitiveStyleDict>,
    { waitForAllValues: false }
  )._debounce()._map({
    transform: ({
      willChange = '',
      opacity = 1,
      translate = { x: 0, y: 0 },
      rotate = 0,
      scale = 1,
      borderRadius = '',
      dimensions = {},
      ...passthrough
    }) => (
      {
        ...passthrough,
        borderRadius: Array.isArray(borderRadius)
          ? borderRadius.map(appendPixels).join(' ' )
          : borderRadius,
        opacity: typeof opacity === 'number'
          ? Number(opacity.toFixed(3))
          : opacity,
        transform: buildTransformString({ translate, rotate, scale }),
        width: appendPixels(dimensions.width || passthrough.width),
        height: appendPixels(dimensions.height || passthrough.height),
        willChange,
      }
    )
  });
}
export default combineStyleStreams;

export function buildTransformString({
  translate: { x: translateX = 0, y: translateY = 0 } = {},
  rotate = 0,
  scale = 1,
}: Partial<{ translate: Partial<Point2D>, rotate: number, scale: number }>): string {
  return `
    translate(${ appendPixels(translateX) }, ${ appendPixels(translateY) })
    rotate(${ appendRadians(rotate) })
    scale(${ scale })
  `;
}

export function applySuffix(value: number | string | undefined, suffix: string = ''): string | undefined {
  if (typeof value === 'number') {
    return value + suffix;
  }

  return value;
}

// Poor-man's currying
export function appendPixels(value: number | string | undefined): string | undefined {
  return applySuffix(value, 'px');
}

export function appendRadians(value: number | string | undefined): string | undefined {
  return applySuffix(value, 'rad');
}

function stripStreamSuffices(dictWithSufficies: Dict<Observable<any>>): Dict<Observable<any>> {
  const result: Dict<Observable<any>> = {};

  Object.keys(dictWithSufficies).forEach(
    key => {
      result[key.replace('$', '')] = dictWithSufficies[key];
    }
  );

  return result;
}
