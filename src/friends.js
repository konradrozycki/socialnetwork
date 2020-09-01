import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    receiveFriendsWannabes,
    acceptFriendRequest,
    unfriend,
} from "./actions";

export default function Friends() {
    const dispatch = useDispatch();

    const friends = useSelector(
        (state) =>
            state.friendsWannabes &&
            state.friendsWannabes.filter((user) => user.accepted == true)
    );
    const wannabes = useSelector(
        (state) =>
            state.friendsWannabes &&
            state.friendsWannabes.filter((user) => user.accepted == false)
    );
    useEffect(() => {
        dispatch(receiveFriendsWannabes());
    }, []);

    if (!friends && !wannabes) {
        return null;
    }

    return (
        <div className="friends-wannabes main">
            {wannabes.length != 0 && (
                <h2>These users want to be your friends:</h2>
            )}
            <div className="wannabes users">
                {wannabes.map((wannabe) => {
                    return (
                        <React.Fragment key={wannabe.id}>
                            <div className="other-users">
                                <Link to={`/user/${wannabe.id}`}>
                                    <div className="profile-pic">
                                        <img
                                            src={
                                                wannabe.img_url ||
                                                "/public/assets/default-pic.jpeg"
                                            }
                                            alt={`picture of ${wannabe.first} ${wannabe.last}`}
                                        ></img>
                                    </div>
                                </Link>
                                <div className="name-holder">
                                    <Link to={`/user/${wannabe.id}`}>
                                        {wannabe.first} {wannabe.last}
                                    </Link>
                                    <button
                                        onClick={() =>
                                            dispatch(
                                                acceptFriendRequest(wannabe.id)
                                            )
                                        }
                                    >
                                        Accept Friend Request
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            {friends.length == 0 && (
                <div className="forever-alonle">
                    <p>
                        no friends yet?{" "}
                        <Link to="/users" className="link">
                            Find Users
                        </Link>
                    </p>
                </div>
            )}
            {friends.length != 0 && <h2>Your friends list:</h2>}
            <div className="friends users">
                {friends.map((friend) => {
                    return (
                        <React.Fragment key={friend.id}>
                            <div className="other-users">
                                <Link to={`/user/${friend.id}`}>
                                    <div className="profile-pic">
                                        <img
                                            src={
                                                friend.img_url ||
                                                "/public/assets/default-pic.jpeg"
                                            }
                                            alt={`picture of ${friend.first} ${friend.last}`}
                                        ></img>
                                    </div>
                                </Link>
                                <div className="name-holder">
                                    <Link to={`/user/${friend.id}`}>
                                        {friend.first} {friend.last}
                                    </Link>
                                    <button
                                        onClick={() =>
                                            dispatch(unfriend(friend.id))
                                        }
                                    >
                                        End friendship
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
