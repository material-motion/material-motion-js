# Material Motion Testing Utils #

Utilities for testing the Material Motion framework

## Usage ##

```javascript

import {
  createMockObserver,
  useMockedRAF,
} from 'material-motion-testing-utils';

declare('TestableThing',
  useMockedRAF(
    (mockRAF) => {
      it('should do something with requestAnimationFrame',
        () => {
          const mockObserver = createMockObserver();

          const someStream = new MotionObservable(mockObserver).debounce();
          someStream.subscribe(someListener);

          mockObserver.next(4);
          mockObserver.next(5);
          mockObserver.next(6);

          mockRAF.step();

          expect(someListener).to.have.been.calledWith(6);
```

## Installation ##

```
yarn add material-motion-testing-utils
```

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
