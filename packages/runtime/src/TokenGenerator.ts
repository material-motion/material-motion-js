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
 */

interface Token {
  terminate(): void;
}

type TokenCountChangeListener = (kwargs: { count: number }) => void;

interface TokenGeneratorArgs {
  onTokenCountChange: TokenCountChangeListener;
}

export default class TokenGenerator {
  protected _tokenCount = 0;
  protected _onTokenCountChange: TokenCountChangeListener;

  constructor({ onTokenCountChange }: TokenGeneratorArgs) {
    if (!onTokenCountChange) {
      throw new Error(`TokenGenerator requires an onTokenCountChange listener to be passed in`);
    }

    this._onTokenCountChange = onTokenCountChange;
  }

  /**
   *  Generates a token, representing a task waiting to be completed.
   *
   *  Call the returned terminate function when the task is complete.
   */
  generateToken(): Token {
    let terminated = false;
    this._updateTokenCount(+1);

    return {
      terminate: () => {
        if (terminated) {
          throw new Error(`This token has already been terminated`);

        } else {
          terminated = true;
          this._updateTokenCount(-1);
        }
      }
    }
  }

  _updateTokenCount(delta: number): void {
    this._tokenCount += delta;
    this._onTokenCountChange({ count: this._tokenCount });
  }
}
