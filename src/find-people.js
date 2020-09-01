import React, { useState, useEffect } from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default function FindPeople(props) {
    const [searchFor, setSearchFor] = useState(searchFor);
    const [users, setUsers] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);

    // only runs ONCE when component mounts (because of [] in the end of useEffect):
    useEffect(() => {
        let ignore = false;
        console.log("props.userId: ", props.userId);
        (async () => {
            try {
                const { data } = await axios.get(
                    `/users/recent/${props.userId}`
                );
                if (!ignore) {
                    if (data.success) {
                        console.log("data in useEffect: ", data);
                        setRecentUsers(data.recentUsers);
                    } else {
                        // what to do in case user is not found?
                    }
                }
            } catch (err) {
                console.log(err);
            }
        })();

        return () => {
            console.log("searchFor in cleanup: ", searchFor);
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const { data } = await axios.get("/api/find/" + searchFor);
                if (!ignore) {
                    if (data.success) {
                        console.log("data in useEffect: ", data);
                        setUsers(data.users);
                    } else {
                        // what to do in case user is not found?
                    }
                }
            } catch (err) {
                console.log(err);
            }
        })();

        return () => {
            console.log("searchFor in cleanup: ", searchFor);
            ignore = true;
        };
    }, [searchFor]);

    const onSearchForChange = ({ target }) => {
        console.log("target.value: ", target.value);
        // if value is just an empty string, do nothing:
        if (target.value == " ") {
            target.value = target.value.replace(/ +/g, "");
        }
        setSearchFor(target.value);
    };

    return (
        <div className="find-users main">
            {!searchFor && (
                <div className="just-joined">
                    <h2>Checkout new people!</h2>
                    <div className="users">
                        {recentUsers.map((user) => {
                            return (
                                <Link to={`/user/${user.id}`} key={user.id}>
                                    <div className="other-users" key={user.id}>
                                        <div className="profile-pic">
                                            <img
                                                src={
                                                    user.img_url ||
                                                    "/public/assets/default-pic.jpeg"
                                                }
                                                alt={`picture of ${user.first} ${user.last}`}
                                            ></img>
                                        </div>
                                        <div>
                                            {user.first} {user.last}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
            <div className="user-search-container">
                <div className="user-search-input">
                    <h3>Who are you stalking today?</h3>
                    <input
                        className="search-input"
                        onChange={onSearchForChange}
                        placeholder="Enter name"
                    />
                    {searchFor && (
                        <div className="users">
                            {users.map((user) => {
                                return (
                                    <Link to={`/user/${user.id}`} key={user.id}>
                                        <div
                                            className="other-users"
                                            key={user.id}
                                        >
                                            <div className="profile-pic">
                                                <img
                                                    src={
                                                        user.img_url ||
                                                        "/public/assets/default-pic.jpeg"
                                                    }
                                                    alt={`picture of ${user.first} ${user.last}`}
                                                ></img>
                                            </div>
                                            <div>
                                                {user.first} {user.last}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
