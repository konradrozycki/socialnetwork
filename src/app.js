import React from "react";
import axios from "./axios";
import { BrowserRouter, Route, Link } from "react-router-dom";

import Uploader from "./uploader";
import Profile from "./profile";
import ProfilePic from "./profilepic";
import OtherProfile from "./other-profile";
import FindPeople from "./find-people";
import Friends from "./friends";

import { Chat } from "./chat";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        axios.get("/user").then(({ data }) => {
            this.setState(data);
        });
    }
    setBio(updatedBio) {
        this.setState({
            bio: updatedBio,
        });
    }
    render() {
        return (
            <BrowserRouter>
                <React.Fragment>
                    <header>
                        <div className="logo">
                            <Link to="/">
                                <img
                                    src="/public/favicon.png"
                                    alt="Filmspace"
                                />
                            </Link>
                            <div className="logo-sign">FILMSPACE</div>
                        </div>
                        <div className="header-right">
                            <div className="nav">
                                <Link to="/chat">Chat</Link>
                                <Link to="/users">Find People</Link>
                                <Link to="/friends">Friends</Link>
                                <a href="/logout">Log out</a>
                            </div>
                            {this.state.uploaderIsVisible && (
                                <Uploader
                                    setImageUrl={(imageUrl) =>
                                        this.setState({
                                            imageUrl: imageUrl,
                                            uploaderIsVisible: false,
                                        })
                                    }
                                    closeUploader={() =>
                                        this.setState({
                                            uploaderIsVisible: false,
                                        })
                                    }
                                />
                            )}
                            <ProfilePic
                                clickHandler={() =>
                                    this.setState({ uploaderIsVisible: true })
                                }
                                imageUrl={this.state.imageUrl}
                                first={this.state.first}
                                last={this.state.last}
                            />
                        </div>
                    </header>
                    <Route
                        exact
                        path="/"
                        render={() => (
                            <Profile
                                userId={this.state.userId}
                                first={this.state.first}
                                last={this.state.last}
                                imageUrl={this.state.imageUrl}
                                clickHandler={() =>
                                    this.setState({ uploaderIsVisible: true })
                                }
                                bio={this.state.bio}
                                setBio={(updatedBio) =>
                                    this.setState({ bio: updatedBio })
                                }
                            />
                        )}
                    />
                    <Route
                        path="/user/:id"
                        render={(props) => (
                            <OtherProfile
                                key={props.match.url}
                                match={props.match}
                                history={props.history}
                                userId={this.state.userId}
                            />
                        )}
                    />
                    <Route
                        path="/users"
                        render={(props) => (
                            <FindPeople
                                key={props.match.url}
                                match={props.match}
                                history={props.history}
                                userId={this.state.userId}
                            />
                        )}
                    />
                    <Route
                        path="/friends"
                        render={(props) => (
                            <Friends
                                key={props.match.url}
                                match={props.match}
                                history={props.history}
                                userId={this.state.userId}
                            />
                        )}
                    />
                    <Route
                        exact
                        path="/chat"
                        render={(props) => (
                            <Chat
                                key={props.match.url}
                                match={props.match}
                                history={props.history}
                                userId={this.state.userId}
                            />
                        )}
                    />
                </React.Fragment>
            </BrowserRouter>
        );
    }
}
