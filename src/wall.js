import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { socket } from "./socket.js";
import { useSelector } from "react-redux";

export function Wall() {
    const wallPosts = useSelector((state) => state && state.wallPosts);
    const userId = useSelector((state) => state && state.userId);
    console.log("wallPosts: ", wallPosts);

    const elemRef = useRef();

    useEffect(() => {
        console.log("wall allPosts mounted");
        console.log("userId: ", userId);

        if (wallPosts) {
            console.log("elemRef: ", elemRef);
            let { clientHeight, scrollTop, scrollHeight } = elemRef.current;
            console.log("scroll y: ", scrollTop);
            console.log("client height: ", clientHeight);
            console.log("scroll height: ", scrollHeight);
            elemRef.current.scrollTop = scrollHeight - clientHeight;
        }
    }, [wallPosts]);

    const keyCheck = (e) => {
        if (e.key == "Enter") {
            e.preventDefault();
            console.log("which key user pressed...", e.keyCode);
            console.log("which key user pressed...", e.key);
            console.log("what the user is typing: ", e.target.value);
            socket.emit("post wall post", e.target.value);
            e.target.value = "";
        }
    };

    if (!wallPosts) {
        return null;
    }

    return (
        <div className="main wall-space">
            <div className="wall">
                <textarea
                    rows="5"
                    className="new-post"
                    placeholder="What's on your mind?"
                    onKeyDown={keyCheck}
                ></textarea>
                <div className="wall-box users" ref={elemRef}>
                    {wallPosts.map((message) => {
                        let msgClassName = "singlePost";
                        if (message.user_id == userId) {
                            msgClassName = "activ-user-post";
                        }
                        return (
                            <div
                                key={message.id}
                                className={`post other-user-post ${msgClassName}`}
                            >
                                <div className="profile-pic">
                                    <Link to={`/user/${message.user_id}`}>
                                        <img
                                            src={
                                                message.img_url ||
                                                "/public/assets/default-pic.jpeg"
                                            }
                                            alt={`picture of ${message.first} ${message.last}`}
                                        ></img>
                                    </Link>
                                </div>
                                <div className="date-user-post-container">
                                    <div className="name-date-box">
                                        <Link to={`/user/${message.user_id}`}>
                                            {message.first} {message.last}
                                        </Link>
                                        <span className="time-zone">
                                            {message.prettyDate ||
                                                message.created_at}
                                        </span>
                                    </div>
                                    <p>{message.post}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
