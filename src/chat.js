import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { socket } from "./socket.js";
import { useSelector } from "react-redux";

import OnlineUsers from "./online-users";

export function Chat() {
    const chatMessages = useSelector((state) => state && state.chatMessages);
    const userId = useSelector((state) => state && state.userId);
    console.log("chatMessages: ", chatMessages);

    const elemRef = useRef();

    useEffect(() => {
        console.log("chat mounted");
        console.log("userId: ", userId);

        if (chatMessages) {
            console.log("elemRef: ", elemRef);
            let { clientHeight, scrollTop, scrollHeight } = elemRef.current;
            console.log("scroll y: ", scrollTop);
            console.log("client height: ", clientHeight);
            console.log("scroll height: ", scrollHeight);
            elemRef.current.scrollTop = scrollHeight - clientHeight;
        }
    }, [chatMessages]);

    const keyCheck = (e) => {
        if (e.key == "Enter") {
            e.preventDefault();
            console.log("which key user pressed...", e.keyCode);
            console.log("which key user pressed...", e.key);
            console.log("what the user is typing: ", e.target.value);
            socket.emit("post chat message", e.target.value);
            e.target.value = "";
        }
    };

    if (!chatMessages) {
        return null;
    }

    return (
        <div className="main chat-space">
            <div className="chat">
                <div className="chat-box users" ref={elemRef}>
                    {chatMessages.map((message) => {
                        let msgClassName = "message-left";
                        if (message.user_id == userId) {
                            msgClassName = "activ-user-msg";
                        }
                        return (
                            <div
                                key={message.id}
                                className={`message other-user ${msgClassName}`}
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
                                <div className="date-user-msg-container">
                                    <div className="name-date-box">
                                        <Link to={`/user/${message.user_id}`}>
                                            {message.first} {message.last}
                                        </Link>
                                        <span className="time-zone">
                                            {message.prettyDate ||
                                                message.created_at}
                                        </span>
                                    </div>
                                    <p>{message.msg}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <textarea
                    rows="3"
                    className="new-message"
                    placeholder="Type a message..."
                    onKeyDown={keyCheck}
                ></textarea>
            </div>
            <OnlineUsers />
        </div>
    );
}
