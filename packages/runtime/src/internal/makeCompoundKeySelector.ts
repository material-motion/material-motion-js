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

export type Dict = {
  [index:string]: any,
};

/**
 *  A compound key selector searches the object it receives for the values at
 *  the given keys.  It returns an object that represents the intersection of
 *  those values; that is, every object that has the same values for
 *  { key1, key2 } will receive the same result.  (It's idempotent.)
 *
 *  The compound key selector is designed to generate keys to be used in a Map
 *  or be the selector in an RxJS groupBy operator.
 */
export default function makeCompoundKeySelector(key1:string, key2:string):(dict:Dict) => any {
  const keyMap = new Map();

  return function(dict) {
    const value1 = dict[key1];
    const value2 = dict[key2];

    if (!keyMap.has(value1)) {
      keyMap.set(value1, new Map());
    }

    const value1Map = keyMap.get(value1);

    if (value1Map.has(value2)) {
      return value1Map.get(value2);

    } else {
      // Currently returns { key1: value1, key2: value2 }, but could just as easily be a Symbol
      const result = {
        [key1]: value1,
        [key2]: value2,
      };

      value1Map.set(value2, result);
      return result;
    }
  };
}
