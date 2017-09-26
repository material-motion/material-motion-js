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
  Dict,
  Observable,
  ObservableWithMotionOperators,
  OpacityStyleStreams,
  Point2D,
  ScaleStyleStreams,
  TranslateStyleStreams,
  combineLatest,
} from 'material-motion';

export type StyleDict = {
  opacity?: number,
  touchAction?: string,
  transform?: string,
  willChange?: string,
};

export function combineStyleStreams(styleStreams: Partial<OpacityStyleStreams & ScaleStyleStreams & TranslateStyleStreams>): ObservableWithMotionOperators<StyleDict> {
  return combineLatest(
    stripStreamSuffices(styleStreams as Dict<Observable<any>>),
    { waitForAllValues: false }
  )._debounce()._map(
    ({ opacity = 1, scale = 1, translate = { x: 0, y: 0 }, borderRadius = '', willChange = '', ...passthrough }) => (
      {
        ...passthrough,
        borderRadius: Array.isArray(borderRadius)
          ? borderRadius.map(appendPixels).join(' ' )
          : borderRadius,
        opacity,
        transform: buildTransformString({ translate, scale }),
        willChange,
      }
    )
  );
}
export default combineStyleStreams;

export function buildTransformString({ translate = { x: 0, y: 0 }, rotate = 0, scale = 1 }: Partial<{ translate: Point2D, rotate: number, scale: number }>): string {
  return `
    translate(${ appendPixels(translate.x) }, ${ appendPixels(translate.y) })
    rotate(${ appendRadians(rotate) })
    scale(${ scale })
  `;
}

function applySuffix(value: number | string, suffix: string = ''): string {
  if (typeof value === 'string') {
    return value;
  }

  return value + suffix;
}

// Poor-man's currying
function appendPixels(value: number): string {
  return applySuffix(value, 'px');
}

function appendRadians(value: number): string {
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
