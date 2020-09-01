import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default class Registration extends React.Component {
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
            let response = await axios.post("/welcome/register", {
                first: this.first,
                last: this.last,
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
                <h2>CREATE ACCOUNT</h2>
                {this.state.error && (
                    <div className="error">Something went wrong!</div>
                )}

                <label htmlFor="first"></label>
                <input
                    name="first"
                    id="first"
                    placeholder="First name"
                    onChange={this.handleChange}
                />

                <label htmlFor="last"></label>
                <input
                    name="last"
                    id="last"
                    placeholder="Last name"
                    onChange={this.handleChange}
                />

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

                <button className="register-button" onClick={this.submit}>
                    Register
                </button>
                <p className="login-offer">
                    Already a member? Please <Link to="/login">Log In</Link>
                </p>
            </div>
        );
    }
}
