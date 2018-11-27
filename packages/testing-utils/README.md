# <img src="https://www.gstatic.com/images/branding/product/2x/motion_48dp.png" width="48" height="48" style="position: relative; top: 10px;" alt="logo" />  Material Motion: Testing utils #

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
