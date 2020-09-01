import React from "react";
import Register from "./registration";
import Login from "./login";
import resetPassword from "./resetPassword";
import { HashRouter, Route } from "react-router-dom";

export default function Welcome() {
    return (
        <div className="background">
            <img
                className="background-image"
                src="/public/wallpaper.jpg"
                alt="wallpaper"
            />
            <HashRouter>
                <Route exact path="/" component={Register} />
                <Route path="/login" component={Login} />
                <Route path="/reset-password" component={resetPassword} />
            </HashRouter>
        </div>
    );
}
