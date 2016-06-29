/** @license
 *  Copyright 2016 The Material Motion Authors. All Rights Reserved.
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
 *
 *  @flow
 */

import {
  List as ImmutableList,
} from 'immutable';

type DescriptorT = {
  value:any,
  configurable: bool,
  writable: bool,
  enumerable: bool,
};

export function stringifyArgs(args:Array<any>) {
  return args.map(
    arg => (
      arg.hasOwnProperty('toString')
        ? arg.toString()
        : JSON.stringify(arg)
    )
  ).join(', ');
}

export function logTerm(target:Object, name:string, descriptor:DescriptorT) {
  return {
    ...descriptor,

    initializer: function() {
      return function(...args:Array<any>) {
        const result = descriptor.value.apply(this, args);
        result.log = this.log.push(`${ name }(${ stringifyArgs(args) })`);
        return result;
      };
    },
  };
}

export function renameFunction(name:string, target:Function):Function {
  return Object.defineProperty(
    target,
    'name',
    {
      value: name,
      configurable: true,
      writable: false,
      enumerable: false,
    }
  );
}

export function startTermLog(root:Function) {
  return renameFunction(
    root.name,
    function(...args:Array<any>) {
      const expression = root(...args);
      expression.log = ImmutableList(
        [`${ root.name }(${ stringifyArgs(args) })`]
      );
      return expression;
    }
  );
}
