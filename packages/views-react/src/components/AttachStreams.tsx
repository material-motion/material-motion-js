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
  IndefiniteObservable,
} from 'indefinite-observable';

import {
  Observer,
  StreamDict,
  Subject,
  SubjectDict,
  SubscriptionDict,
} from 'material-motion';

export type AttachStreamsProps = StreamDict<any> & {
  children: React.ReactElement<{ domRef(element: Element): void }>,
  domRef?: (element: Element) => void,
};
export type AttachStreamsState = {
  [index:string]: any,
};

/**
 * `AttachStreams` is a stateful component that listens to any stream it
 * receives as a prop.  Whenever the stream dispatches a value, `AttachStreams`
 * forwards that value as a prop onto its child component.
 *
 * If the prop name starts with "on," `AttachStreams` presumes the prop
 * represents an event stream, and that the stream it received is a subject.
 * Instead of subscribing to the stream and forwarding values to the child
 * component, it will subscribe to the appropriate event on the child component
 * and forward that event to the stream.
 *
 * In order for event subscription to work, `AttachStreams` must receive a child
 * component that accepts a `domRef` prop.  That prop should be set as `ref` on
 * whatever DOM node the child tree eventually renders.
 */
export class AttachStreams extends React.Component<AttachStreamsProps, AttachStreamsState> {
  state = {
    // The PEP polyfill doesn't handle nested touch-actions very well:
    //   https://github.com/jquery/PEP/issues/336
    // so only set touch-action if it isn't the default.
    usesPointerEvents: false,
  };
  private _subscriptions:SubscriptionDict = {};
  private _domNode: Element;

  /**
   * `domRef` is passed as a prop to this component's `children`.  `children`
   * must ensure that `domRef` will eventually be called with a reference to the
   * actual DOM node that this tree represents.
   *
   * For instance, the children component could look like this:
   *
   * const SomeComponent = ({ domRef }) => <div ref = { domRef } />;
   */
  private _domRef = (ref: Element) => {
    this._domNode = ref;

    if (this._domNode) {
      Object.entries(this.props).forEach(
        ([ propName, stream ]) => {
          // Presumes any stream that starts with "on" is a Subject waiting to be
          // bound to an event stream.
          //
          // Same presumption is made in `_subscribeToProps`.
          if (isEventHandlerName(propName)) {
            this._subscribeToEvent$(propName, stream as Subject);
          }
        }
      );
    }

    if (this.props.domRef) {
      this.props.domRef(ref);
    }
  }

  /**
   * A React lifecycle method that will be called before this component is added
   * to the DOM.
   */
  componentWillMount() {
    this._subscribeToProps(this.props);
  }

  /**
   * A React lifecycle method that will be called before this component will
   * receive new props.
   *
   * Here, we compare the new props to the old props: subscribing to any new
   * props and unsubscribing from any props that are no longer present.
   */
  componentWillReceiveProps(nextProps: AttachStreamsProps) {
    const newStreams: StreamDict = {};

    Object.entries(nextProps).forEach(
      ([propName, stream]) => {
        if (this.props[propName] !== stream && propName !== 'children') {
          if (this._subscriptions[propName]) {
            this._subscriptions[propName].unsubscribe();
            delete this._subscriptions[propName];
          }

          newStreams[propName] = stream;
        }
      }
    );

    Object.keys(this._subscriptions).forEach(
      propName => {
        if (!nextProps[propName]) {
          this._subscriptions[propName].unsubscribe();
          delete this._subscriptions[propName];
        }
      }
    );

    this._subscribeToProps(newStreams);
  }

  /**
   * `AttachStreams` decides whether to forward events from the stream to the
   * child or from the child to the stream based on the prop name.  If the prop
   * name starts with "on", `AttachStreams` listen for events matching the rest
   * of the prop name (e.g. `click` for `onClick`) and forward them to the
   * stream.
   *
   * Otherwise, `AttachStreams` will subscribe to the stream and pass any values
   * the stream dispatches as props to its `children` component.
   */
  private _subscribeToProps(props) {
    let usesPointerEvents: boolean = false;

    Object.entries(props).forEach(
      ([propName, stream]) => {
        if (propName === 'children') {
          return;

        } else if (stream.subscribe === undefined) {
          // This prop isn't a stream, so pass it through unmolested
          this.setState({
            [propName]: stream
          });

        } else if (isEventHandlerName(propName)) {
          if (this._domNode) {
            this._subscribeToEvent$(propName, stream as Subject);
          }

          if (propName.includes('onPointer')) {
            usesPointerEvents = true;
          }

        } else {
          this._subscriptions[propName] = stream.subscribe(
            (value: any) => {
              const nextState = {
                [propName]: value,
              };

              this.setState(nextState);
            }
          );
        }
      }
    );

    this.setState({ usesPointerEvents });
  }

  /**
   * React has a synthetic event system, which exposes events that it knows
   * about, e.g. `click`, as `onClick`.  Unfortunately, React doesn't know about
   * some event types that we might care about, e.g. `pointermove`.  Therefore,
   * we subscribe to that actual DOM's event system for any prop that looks like
   * an event listener (e.g. starts with `on`).
   */
  private _subscribeToEvent$(propName: string, subject: Subject) {
    const eventType = propName.replace('on', '').toLowerCase();

    // Using `observable.subscribe` for consistency, but this could just as
    // easily be an object literal with an `unsubscribe` method.  That would be
    // a bit simpler/more performant too.
    this._subscriptions[propName] = new IndefiniteObservable(
      (observer: Observer<any>) => {
        const nextChannel = observer.next.bind(observer);

        this._domNode.addEventListener(eventType, nextChannel);

        return () => {
          this._domNode.removeEventListener(eventType, nextChannel);
        };
      }
    ).subscribe(subject);
  }

  render() {
    const {
      usesPointerEvents,
      ...props
    } = this.state;

    props.domRef =  this._domRef;

    if (this.state.usesPointerEvents) {
      props.touchAction = 'none';
    }

    return React.cloneElement(this.props.children, props);
  }

  /**
   * A React lifecycle method that will be called just before this component is
   * removed from the DOM.  Here, we unsubscribe from all current subscriptions.
   */
  componentWillUnmount() {
    Object.values(this._subscriptions).forEach(
      subscription => subscription.unsubscribe()
    );
  }
}

/**
 * Tests if a string starts with "on" followed by a capital letter.
 */
function isEventHandlerName(propName: string): boolean {
  return Boolean(/^on[A-Z]/.exec(propName));
}

export default AttachStreams;
