import React, { useState, useEffect } from "react";
import axios from "./axios";

export default function FriendButton(props) {
    const [buttonText, setButtonText] = useState();
    const buttonTextArr = [
        "Send Friend Request",
        "Cancel Friend Request",
        "Accept Friend Request",
        "End friendship",
    ];

    useEffect(() => {
        if (props.otherUserId) {
            console.log("props.otherUserId: ", props.otherUserId);
            let ignore = false;
            (async () => {
                try {
                    const { data } = await axios.get(
                        `/friends-status/${props.otherUserId}`
                    );
                    if (!ignore) {
                        if (data.friendsStatus) {
                            console.log(
                                "data.friendsStatus: ",
                                data.friendsStatus
                            );
                            if (data.friendsStatus.accepted) {
                                setButtonText(buttonTextArr[3]);
                            } else {
                                if (
                                    props.otherUserId ==
                                    data.friendsStatus.receiver_id
                                ) {
                                    setButtonText(buttonTextArr[1]);
                                } else {
                                    setButtonText(buttonTextArr[2]);
                                }
                            }
                        } else {
                            setButtonText(buttonTextArr[0]);
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            })();

            return () => {
                ignore = true;
            };
        }
    });

    const handleSubmit = () => {
        let url;
        console.log(buttonText);
        if (buttonText == buttonTextArr[0]) {
            url = "/make-friend-request/" + props.otherUserId;
            console.log("props.otherUserId: ", props.otherUserId);
        }
        if (buttonText == buttonTextArr[2]) {
            url = "/accept-friend-request/" + props.otherUserId;
            console.log("props.otherUserId: ", props.otherUserId);
        }
        if (buttonText == buttonTextArr[1] || buttonText == buttonTextArr[3]) {
            url = "/end-friendship/" + props.otherUserId;
            console.log("props.otherUserId: ", props.otherUserId);
        }
        console.log(url);
        axios
            .post(url)
            .then(({ data }) => {
                if (data.success) {
                    if (buttonText == buttonTextArr[0]) {
                        setButtonText(buttonTextArr[1]);
                    }
                    if (buttonText == buttonTextArr[2]) {
                        setButtonText(buttonTextArr[3]);
                    }
                    if (
                        buttonText == buttonTextArr[1] ||
                        buttonText == buttonTextArr[3]
                    ) {
                        setButtonText(buttonTextArr[0]);
                    }
                } else {
                    // ???
                }
            })
            .catch((err) => {
                console.log("err in handleSubmit in FriendButton: ", err);
            });
    };

    return (
        <div className="friend">
            <button onClick={(e) => handleSubmit(e)}>{buttonText}</button>
        </div>
    );
}
