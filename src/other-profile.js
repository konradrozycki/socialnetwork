import React from "react";
import axios from "./axios";

import FriendButton from "./friend-button";
import { Wall } from "./wall";

export default class OtherProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        let requestedId = this.props.match.params.id;
        this.setState({
            otherUserId: requestedId,
        });
        if (requestedId == this.props.userId) {
            this.props.history.push("/");
        } else {
            axios
                .get("/api/user/" + this.props.match.params.id)
                .then(({ data }) => {
                    if (data.success) {
                        this.setState(data);
                    } else {
                        this.setState({
                            error: true,
                        });

                        this.props.history.push("/");
                    }
                })
                .catch((err) => {
                    console.log(
                        "err in GET /api/user/:id in other-profile.js",
                        err
                    );
                });
        }
    }

    render() {
        let noBioElem = (
            <div>
                <p>no bio yet</p>
            </div>
        );

        let bioElem = (
            <div>
                <p>{this.state.bio}</p>
            </div>
        );

        return (
            <div className="profile main other">
                <div className="profile-left">
                    <div className="profile-pic">
                        <img
                            src={this.state.imageUrl}
                            alt="profile picture"
                        ></img>
                    </div>
                    <FriendButton otherUserId={this.state.otherUserId} />
                </div>
                <div className="profile-txt">
                    <h2>
                        {this.state.first} {this.state.last}
                    </h2>
                    {this.state.bio && bioElem}
                    {!this.state.bio && noBioElem}
                </div>
                <Wall />
            </div>
        );
    }
}
