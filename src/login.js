import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleChange = this.handleChange.bind(this);
        this.submit = this.submit.bind(this);
    }
    handleChange(e) {
        this[e.target.name] = e.target.value;
    }
    async submit() {
        try {
            const response = await axios.post("/welcome/login", {
                email: this.email,
                password: this.password,
            });
            if (response.data.success) {
                location.replace("/");
            } else {
                this.setState({
                    error: true,
                });
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    render() {
        return (
            <div className="registration-form" autoComplete="off">
                <h2>LOGIN AND RATE FILMS!</h2>
                {this.state.error && (
                    <div className="error">Something went wrong!</div>
                )}
                <label htmlFor="email"></label>
                <input
                    name="email"
                    id="email"
                    placeholder="Email adress"
                    onChange={this.handleChange}
                />
                <label htmlFor="password"></label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    onChange={this.handleChange}
                />
                <button className="login-button" onClick={this.submit}>
                    Log In
                </button>
                <Link to="/reset-password">Forgot password?</Link>
                <br />
                or
                <Link to="/" className="register-offer">
                    Create new account
                </Link>
            </div>
        );
    }
}
