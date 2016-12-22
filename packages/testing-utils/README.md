# Material Motion Testing Utils #

Utilities for testing the Material Motion framework

## Usage ##

```javascript
import {
  createMockObserver,
} from 'material-motion-testing-utils';

const mockObserver = createMockObserver();

const someStream = new MotionObservable(mockObserver);
someStream.subscribe(someListener);
mockObserver.next(5);
expect(someListener).to.have.been.calledWith(5);
```

## Installation ##

```
yarn add material-motion-testing-utils
```

## License ##

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
