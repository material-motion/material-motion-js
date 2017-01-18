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
  StreamDict,
  SubscriptionDict,
} from 'material-motion-streams';

export type AttachStreamsProps = StreamDict;
export type AttachStreamsState = {
  [index:string]: any,
};

export class AttachStreams extends React.Component<AttachStreamsProps, AttachStreamsState> {
  private _subscriptions:SubscriptionDict = {};

  componentWillMount() {
    this._subscribeToProps(this.props);
  }

  componentWillReceiveProps(nextProps: AttachStreamsProps) {
    const newStreams: StreamDict = {};

    Object.entries(nextProps).forEach(
      ([propName, stream]) => {
        if (this.props[propName] !== stream && propName !== 'children') {
          if (this._subscriptions[propName]) {
            this._subscriptions[propName].unsubscribe();
          }

          newStreams[propName] = stream;
        }
      }
    );

    Object.keys(this.props).forEach(
      propName => {
        if (!nextProps[propName]) {
          this._subscriptions[propName].unsubscribe();
        }
      }
    );

    this._subscribeToProps(newStreams);
  }

  private _subscribeToProps(props) {
    Object.entries(props).forEach(
      ([propName, stream]) => {
        if (propName !== 'children') {
          this._subscriptions[propName] = stream.subscribe(
            (value: any) => {
              const nextState = {
                [propName]: value,
              };

              if (this.state) {
                this.setState(nextState);
              } else {
                this.state = nextState;
              }
            }
          );
        }
      }
    );
  }

  render() {
    return React.cloneElement(
      this.props.children,
      this.state
    );
  }

  componentWillUnmount() {
    Object.values(this._subscriptions).forEach(
      subscription => subscription.unsubscribe()
    );
  }
}

export default AttachStreams;
