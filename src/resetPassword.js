import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default class resetPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: "start",
        };
    }
    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }
    getCurrentDisplay() {
        if (this.state.step == "start") {
            return (
                <div className="reset-form">
                    <h2>RESET PASSWORD</h2>
                    <h3>
                        Please enter e-mail address with whitch you have
                        registered
                    </h3>
                    {this.state.error && (
                        <div className="error">Error! Please try again!</div>
                    )}
                    <input
                        className="input"
                        name="email"
                        placeholder="email"
                        onChange={(e) => this.handleChange(e)}
                    />
                    <button
                        className="reset-button"
                        onClick={(e) => this.submit(e)}
                    >
                        submit
                    </button>
                    <p>
                        Actually remembering your password?{" "}
                        <Link className="link" to="/login">
                            <p>Log in</p>
                        </Link>
                    </p>
                </div>
            );
        } else if (this.state.step == "verify") {
            return (
                <div className="reset-form">
                    <h2>Reset Password</h2>
                    {this.state.error && (
                        <div className="error">Error! Please try again!</div>
                    )}
                    <p>
                        Please check your e-mail and enter the code we just sent
                        you:
                    </p>
                    <input
                        className="input"
                        key="code"
                        name="code"
                        placeholder="code"
                        onChange={(e) => this.handleChange(e)}
                    />
                    <input
                        className="input"
                        type="password"
                        name="password"
                        placeholder="new password"
                        onChange={(e) => this.handleChange(e)}
                    />
                    <button
                        className="reset-button"
                        onClick={(e) => this.submit(e)}
                    >
                        submit
                    </button>
                </div>
            );
        } else if (this.state.step == "confirmed") {
            return (
                <div className="reset-form">
                    <h2>Reset Password</h2>
                    <p>Success!</p>
                    <p>
                        You can now{" "}
                        <Link className="link" to="/login">
                            log in
                        </Link>{" "}
                        with your new password
                    </p>
                </div>
            );
        }
    }
    submit(e) {
        e.preventDefault();
        if (this.state.step == "start") {
            axios
                .post("/reset/start", {
                    email: this.state.email,
                })
                .then(({ data }) => {
                    if (data.success) {
                        console.log("email found, secret code sent");
                        this.setState({
                            step: "verify",
                        });
                    } else {
                        this.setState({
                            error: true,
                        });
                    }
                });
        } else if (this.state.step == "verify") {
            axios
                .post("/reset/verify", {
                    email: this.state.email,
                    code: this.state.code,
                    password: this.state.password,
                })
                .then(({ data }) => {
                    if (data.success) {
                        this.setState({
                            step: "confirmed",
                        });
                    } else {
                        this.setState({
                            error: true,
                        });
                    }
                });
        }
    }
    render() {
        return this.getCurrentDisplay();
    }
}
