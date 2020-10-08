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
  combineLatest,
} from '../combineLatest';

import {
  Dict,
  Dimensions,
  MaybeReactive,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
  Shadow,
  StyleStreams,
} from '../types';

export type PrimitiveStyleDict = Partial<{
  opacity: number,
  translate: Partial<Point2D>,
  rotate: number,
  scale: number,
  transformOrigin: Partial<Point2D>,
  dimensions: Partial<Dimensions>,
  boxShadow: Partial<Shadow>

  // Explicitly pass through the styles that `combineStyleStreams` needs.
  //
  // Can't `& CSS.Properties` because that causes conflicts for the shape of
  // `transformOrigin`.  See #250.
  borderRadius: CSS.Properties['borderRadius'],
  willChange: CSS.Properties['willChange'],
  width: CSS.Properties['width'],
  height: CSS.Properties['height'],
}>;

// TODO(#250): Merge StyleStreams and csstype
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
      boxShadow = '',
      transformOrigin = { x: 0, y: 0 },
      dimensions = {},
      ...passthrough
    }) => (
      {
        ...passthrough,
        borderRadius: Array.isArray(borderRadius)
          ? borderRadius.map(appendPixels).join(' ' )
          : borderRadius,
        boxShadow: typeof boxShadow === 'string'
          ? boxShadow
          : [boxShadow.x || 0, boxShadow.y || 0, boxShadow.blur || 0, boxShadow.spread || 0].map(appendPixels).join(' ' ),
        opacity: typeof opacity === 'number'
          ? Number(opacity.toFixed(3))
          : opacity,
        transform: buildTransformString({ translate, rotate, scale }),
        transformOrigin: `${ appendPixels(transformOrigin.x) } ${ appendPixels(transformOrigin.y) }`,
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
