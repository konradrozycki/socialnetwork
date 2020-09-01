import React from "react";
import ReactDOM from "react-dom";
import Welcome from "./welcome";
import App from "./app";

// for socket.io:
import { init } from "./socket";

// for redux *************************************************
import { Provider } from "react-redux";

import { createStore, applyMiddleware } from "redux";
import reduxPromise from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./reducer";

const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(reduxPromise))
);
// /for redux *************************************************

let elem;
if (location.pathname == "/welcome") {
    elem = <Welcome />;
} else {
    init(store);

    elem = (
        <Provider store={store}>
            <App />
        </Provider>
    );
}

ReactDOM.render(elem, document.querySelector("main"));
