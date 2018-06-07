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

import { default as jss, StyleSheet } from 'jss';

import {
  Row,
  Col,
  Block,
} from 'jsxstyle';

import Bezier = require('bezier-js');

import {
  Axis,
  BezierControlPoints,
  Draggable,
  MotionObservable,
  MotionProperty,
  Observer,
  ObservableWithMotionOperators,
  Point2D,
  State,
  ThresholdRegion,
  TranslateStyleStreams,
  allOf,
  anyOf,
  combineLatest,
  createProperty,
  getFrame$,
  getVelocity$,
  not,
  subscribe,
  when,
} from 'material-motion';

import {
  combineStyleStreams,
  getPointerEventStreamsFromElement,
} from 'material-motion-views-dom';

// These must be explicitly typed because they have a fixed length.
export const MATERIAL_STANDARD_EASING: BezierControlPoints = [{ x: .4, y: 0 }, { x: .2, y: 1 }];
export const MATERIAL_SHARP_EASING: BezierControlPoints = [{ x: .4, y: 0 }, { x: .6, y: 1 }];


// Basically a spring, but using an easing curve to do the interpolation.
//
// If this works, we should break the Spring interface out into an Interpolator
// interface, implement it here, and adjust Tossable to accept an interpolator
// rather than specifically a spring.
class Point2DEasedInterpolator {
  readonly destination$: MotionProperty<Point2D> = createProperty<Point2D>({
    initialValue: { x: 0, y: 0 },
  });

  get destination(): Point2D {
    return this.destination$.read();
  }

  set destination(value: Point2D) {
    this.destination$.write(value);
  }

  readonly initialValue$: MotionProperty<Point2D> = createProperty<Point2D>({
    initialValue: { x: 0, y: 0 },
  });

  get initialValue(): Point2D {
    return this.initialValue$.read();
  }

  set initialValue(value: Point2D) {
    this.initialValue$.write(value);
  }

  readonly initialVelocity$: MotionProperty<Point2D> = createProperty<Point2D>({
    initialValue: { x: 0, y: 0 },
  });

  get initialVelocity(): Point2D {
    return this.initialVelocity$.read();
  }

  set initialVelocity(value: Point2D) {
    this.initialVelocity$.write(value);
  }

  readonly easing$: MotionProperty<BezierControlPoints> = createProperty<BezierControlPoints>({
    initialValue: MATERIAL_STANDARD_EASING,
  });

  get easing(): BezierControlPoints {
    return this.easing$.read();
  }

  set easing(value: BezierControlPoints) {
    this.easing$.write(value);
  }

  readonly duration$: MotionProperty<number> = createProperty<number>({
    initialValue: 500,
  });

  get duration(): number {
    return this.duration$.read();
  }

  set duration(value: number) {
    this.duration$.write(value);
  }

  readonly enabled$: MotionProperty<boolean> = createProperty<boolean>({
    initialValue: true,
  });

  get enabled(): boolean {
    return this.enabled$.read();
  }

  set enabled(value: boolean) {
    this.enabled$.write(value);
  }

  readonly state$: MotionProperty<State> = createProperty<State>({
    initialValue: State.AT_REST,
  });

  get state(): State {
    return this.state$.read();
  }

  readonly value$: ObservableWithMotionOperators<Point2D>;

  constructor() {
      // This is multicast, which means its existence keeps a rAF constantly
      // happening in the background.  I wonder if it should have some
      // subscription counting, to keep needless scheduling from happening when
      // nothing is downstream.
      const frame$ = getFrame$();

      const startingTimestamp$ = allOf([
        this.enabled$,
        // should include
        // not(this.destination$.isAnyOf([this.initialValue$])),
        // but that's useless because point equality is done by reference, not
        // value
        anyOf([
          when(this.enabled$),
          this.duration$,
          this.initialValue$,
          this.initialVelocity$,
          this.destination$,
        ])
      ]).rewriteTo({
        onlyEmitWithUpstream: true,
        value$: frame$,
      }).dedupe();

      const bezier$ = this.easing$._map({
        transform: (easing) => new Bezier(easing)
      });

      const progress$ = frame$.subtractedBy(startingTimestamp$).dividedBy(this.duration$).clampTo({max$: 1}).dedupe()._reactiveMap({
        onlyEmitWithUpstream: true,
        inputs: {
          bezier: bezier$,
        },
        transform: ({ upstream, bezier }) => bezier.compute(upstream)
      }).pluck('y');


      // mathOperator doesn't support multiplying a point by a number (yet)
      const progress2D$ = combineLatest({
        x: progress$,
        y: progress$,
      })._debounce({ pulse$: progress$ });

      // Not sure why TS is inferring these are numbers, even when explicitly
      // casting the generic to Point2D
      const distance$ = this.destination$.subtractedBy<Point2D>(this.initialValue$);

      this.value$ = this.enabled$.rewrite({
        mapping: {
          true: this.initialValue$.addedBy(progress2D$.multipliedBy(distance$))
        }
      });
    }
  };
}

// This is a fork of Tossable to see if interpolating between velocity and a
// bezier is an acceptable alternative to using a spring.  If so, it will be
// refactored into its own interaction.
class BezierTossableExperiment {
  readonly state$: MotionProperty<State> = createProperty<State>({
    initialValue: State.AT_REST,
  });

  get state(): State {
    return this.state$.read();
  }

  /**
   * This is the point from which all other resistance calculations are
   * measured.
   */
  readonly resistanceOrigin$: MotionProperty<Point2D> = createProperty({
    initialValue: { x: 0, y: 0 },
  });

  get resistanceOrigin(): Point2D {
    return this.resistanceOrigin$.read();
  }

  set resistanceOrigin(value: Point2D) {
    this.resistanceOrigin$.write(value);
  }

  /**
   * This is the distance from the origin that an item can be freely dragged
   * without encountering resistance.
   */
  readonly radiusUntilResistance$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get radiusUntilResistance(): number {
    return this.radiusUntilResistance$.read();
  }

  set radiusUntilResistance(value: number) {
    this.radiusUntilResistance$.write(value);
  }

  /**
   * For carousels or swipeable lists, this is the width of one item.
   *
   * To apply resistance, the calculation needs to determine the amount of
   * progress through a drag.  `resistanceBasis` is the denominator in this
   * calculation. For instance, if a drag is 20px beyond `radiusUntilResistance`
   * and `resistanceBasis` is 50, the drag progress used by the resistance
   * calculation is 40%.
   *
   * Note: a drag cannot move farther than `resistanceBasis` beyond
   * `radiusUntilResistance`.
   */
  readonly resistanceBasis$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get resistanceBasis(): number {
    return this.resistanceBasis$.read();
  }

  set resistanceBasis(value: number) {
    this.resistanceBasis$.write(value);
  }

  /**
   * This value determines how far beyond `radiusUntilResistance` a drag is
   * limited to.
   *
   * It works in conjunction with `resistanceBasis`.  If `resistanceBasis` is 50
   * and `resistanceFactor` is 5, the drag is limited to 10px (basis / factor)
   * beyond `radiusUntilResistance`.
   */
  readonly resistanceFactor$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get resistanceFactor(): number {
    return this.resistanceFactor$.read();
  }

  set resistanceFactor(value: number) {
    this.resistanceFactor$.write(value);
  }

  readonly location$: MotionProperty<Point2D> = createProperty({
    initialValue: { x: 0, y: 0 },
  });

  readonly velocity$: ObservableWithMotionOperators<Point2D>;
  readonly draggedLocation$: ObservableWithMotionOperators<Point2D>;

  readonly draggable: Draggable;
  readonly interpolator: Point2DEasedInterpolator;

  readonly styleStreams: TranslateStyleStreams;

  constructor({ draggable, interpolator }: {draggable: Draggable, interpolator: Point2DEasedInterpolator}) {
    this.draggable = draggable;
    this.interpolator = interpolator;

    const dragIsAtRest$ = draggable.state$.rewrite<boolean, boolean>({
      mapping: {
        [State.AT_REST]: true,
        [State.ACTIVE]: false,
      }
    }).dedupe();

    const whenDragIsAtRest$ = when(dragIsAtRest$);
    const whenDragIsActive$ = when(not(dragIsAtRest$));

    // This block needs to come before the one that sets spring enabled to
    // ensure the spring initializes with the correct values; otherwise, it will
    // start from 0
    subscribe({
      sink: interpolator.initialValue$,
      source: this.location$._debounce({ pulse$: whenDragIsAtRest$}),
    });

    const locationOnDown$ = this.location$._debounce({ pulse$: whenDragIsActive$ });

    this.draggedLocation$ = draggable.value$.addedBy<Point2D>({
      value$: locationOnDown$,
      onlyEmitWithUpstream: true
    })._reactiveMap({
      transform: ({
        upstream: location,
        resistanceOrigin,
        radiusUntilResistance,
        resistanceBasis,
        resistanceFactor,
      }) => {
        if (!resistanceFactor) {
          return location;
        }

        // We apply resistance radially, leading to all the trig below.  In most
        // cases, the draggable element will be axis locked, which means there's
        // room to short circuit the logic here with simpler solutions when we
        // know either x or y is constant.
        const locationFromOrigin: Point2D = {
          x: location.x - resistanceOrigin.x,
          y: location.y - resistanceOrigin.y,
        };

        const overflowRadius = Math.sqrt(locationFromOrigin.x ** 2 + locationFromOrigin.y ** 2) - radiusUntilResistance;
        const resistanceProgress = Math.max(0, Math.min(1, overflowRadius / resistanceBasis));

        if (overflowRadius < 0) {
          return location;
        }

        const radiusWithResistance = resistanceBasis / resistanceFactor * Math.sin(resistanceProgress * Math.PI / 2) + radiusUntilResistance;
        const angle = Math.atan2(locationFromOrigin.y, locationFromOrigin.x);

        return {
          x: resistanceOrigin.x + radiusWithResistance * Math.cos(angle),
          y: resistanceOrigin.y + radiusWithResistance * Math.sin(angle),
        };
      },
      inputs: {
        resistanceOrigin: this.resistanceOrigin$,
        radiusUntilResistance: this.radiusUntilResistance$,
        resistanceBasis: this.resistanceBasis$,
        resistanceFactor: this.resistanceFactor$,
      },
      onlyEmitWithUpstream: true,
    });

    this.velocity$ = getVelocity$({
      // Since drag starts at rest, whenDragIsAtRest$ emits immediately.  Thus,
      // we start with { 0, 0 } to ensure velocity doesn't emit undefined.
      value$: this.draggedLocation$.startWith({ x: 0, y: 0 }),
      pulse$: whenDragIsAtRest$,
    });

    subscribe({
      sink: interpolator.initialVelocity$,
      source: this.velocity$,
    });

    subscribe({
      sink: interpolator.enabled$,
      source: dragIsAtRest$,
    });

    subscribe({
      sink: this.state$,
      source: anyOf([
        interpolator.state$.isAnyOf([ State.ACTIVE ]),
        draggable.state$.isAnyOf([ State.ACTIVE ]),
      ]).rewrite({
        mapping: {
          true: State.ACTIVE,
          false: State.AT_REST,
        },
      }).dedupe(),
    });

    subscribe({
      sink: this.location$,
      source: interpolator.enabled$.rewrite<Point2D, ObservableWithMotionOperators<Point2D>>({
        mapping: {
          true: interpolator.value$,
          false: this.draggedLocation$,
        },
        emitOnKeyChange: false,
      })._debounce(),
    });

    this.styleStreams = {
      translate$: this.location$,

      willChange$: this.state$.rewrite<string, string>({
        mapping: {
          [State.ACTIVE]: 'transform',
          [State.AT_REST]: '',
        },
      }),
    };
  }
}

export class BezierExperiments extends React.Component<{}, {}> {
  bottomSheetStyle$ = createProperty({ initialValue: {} });

  styleSheet = jss.createStyleSheet(
    {
      bottomSheet: this.bottomSheetStyle$,
    },
    {
      link: true,
    }
  ).attach();

  attachToSheet = (element: HTMLElement) => {
    const bottomSheetPointerStreams = getPointerEventStreamsFromElement(element);
    const draggable = new Draggable(bottomSheetPointerStreams);
    draggable.axis = Axis.Y;
    const interpolator = new Point2DEasedInterpolator();

    const tossable = new BezierTossableExperiment({ draggable, interpolator });

    subscribe({
      source: combineStyleStreams(tossable.styleStreams),
      sink: this.bottomSheetStyle$,
    });
  }

  render() {
    const {
      classes,
    } = this.styleSheet;

    return (
      <Col
        minWidth = '100vw'
        minHeight = '100vh'
        backgroundColor = '#202020'
      >
        <Col
          className = { classes.bottomSheet }
          width = '100vw'
          height = '100vh'
          backgroundColor = 'white'
          props = {
            {
              ref: this.attachToSheet,
            }
          }
        />
      </Col>
    );
  }
}
export default BezierExperiments;
