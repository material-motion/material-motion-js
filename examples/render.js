import React from 'react';
import ReactDOM from 'react-dom';

import {
  Router,
  browserHistory,
} from 'react-router';

import {
  AppContainer,
} from 'react-hot-loader';

const redraw = function() {
  //  ReactRouter will throw during HMR unless you wrap it in a component
  let App = () => (
    <Router
      routes = { require('./routes').default }
      history = { browserHistory }
    />
  );

  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,

    document.getElementById('container')
  );
};

redraw();

if (module.hot) {
  module.hot.accept('./routes', redraw);
}
