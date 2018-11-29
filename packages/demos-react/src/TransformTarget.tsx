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
  buildTransformString,
} from 'material-motion';

export type TransformTargetArgs = Partial<{
  position: 'absolute' | 'fixed' | 'relative' | 'static' | 'sticky',
  touchAction: 'auto' | 'none' | 'pan-x' | 'pan-left' | 'pan-right' | 'pan-y'
              | 'pan-up' | 'pan-down' | 'pinch-zoom' | 'manipulation'
              | 'inherit' | 'initial' | 'unset',
  translate: Point2D,
  origin: Point2D,
  rotate: number,
  scale: number,
  opacity: number,
  style: undefined | { [key: string]: string | number },
  children: React.ReactNode | undefined,
  domRef(ref: Element | null): void,
  className: string,
}>;

/**
 * Applies translate, rotate, and scale in the order specified by the CSS
 * Transforms 2 spec.  Passes through other props to inline style - similar to
 * jsxstyle, but without the stylesheet hoisting.
 *
 * https://drafts.csswg.org/css-transforms-2/
 */
export function TransformTarget({
  translate = {
    x: 0,
    y: 0,
  },
  origin = {
    x: 0,
    y: 0,
  },
  rotate = 0,
  scale = 1,
  opacity = 1,
  className = '',
  domRef,
  position = 'static',
  touchAction,
  children,
  style = {},
  ...propsPassthrough
}: TransformTargetArgs): React.ReactElement<any> {
  return (
    <div
      className = { className }
      ref = { domRef }
      style = {
        {
          ...propsPassthrough,
          transform: buildTransformString({ translate, rotate, scale }),
          transformOrigin: `${ origin.x }px ${ origin.y }px`,
          opacity,
          position,
          touchAction,
          ...style,
        }
      }
    >
      { children }
    </div>
  );
}
export default TransformTarget;
