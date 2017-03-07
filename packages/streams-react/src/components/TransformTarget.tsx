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

import * as React from 'react';

import {
  Point2D,
} from 'material-motion-streams';

export type TransformTargetArgs = {
  position: 'absolute' | 'fixed' | 'relative' | 'static' | 'sticky',
  touchAction: 'auto' | 'none' | 'pan-x' | 'pan-left' | 'pan-right' | 'pan-y'
              | 'pan-up' | 'pan-down' | 'pinch-zoom' | 'manipulation'
              | 'inherit' | 'initial' | 'unset',
  translate: Point2D,
  rotate: number,
  scale: number,
  opacity: number,
  style: undefined | { [key: string]: string | number },
  children: React.ReactNode | undefined,
  domRef(ref: Element): void,
};

/**
 * Applies translate, rotate, and scale in the order specified by the CSS
 * Transforms 2 spec.  Also supports position and opacity.
 *
 * https://drafts.csswg.org/css-transforms-2/
 */
export default function TransformTarget({
  position = 'static',
  translate = {
    x: 0,
    y: 0,
  },
  rotate = 0,
  scale = 1,
  opacity = 1,
  touchAction,
  children,
  domRef,
  ...propsPassthrough
}: TransformTargetArgs): React.ReactElement<any> {
  return (
    <div
      className = 'transform-target'
      ref = { domRef }
      // We manually need to pass touch-action to both CSS and DOM attributes to
      // support the Pointer Events Polyfill
      is touch-action = { touchAction }
      style = {
        {
          ...propsPassthrough,
          touchAction,
          position,
          transform: `
            translate(${ applySuffix(translate.x || 0, 'px') }, ${ applySuffix(translate.y || 0, 'px') })
            rotate(${ applySuffix(rotate, 'rad') })
            scale(${ scale })
          `,
          opacity,
        }
      }
    >
      { children }
    </div>
  );
}

function applySuffix(value: number | string, suffix?: string): string {
  if (typeof value === 'string') {
    return value;
  }

  return value + suffix;
}
