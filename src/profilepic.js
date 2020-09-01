import React from "react";

export default function ProfilePic(props) {
    // console.log('props in profilepic.js: ', props);
    return (
        <div className="profile-img">
            <img
                src={props.imageUrl}
                alt="profile picture"
                onClick={() => props.clickHandler()}
            ></img>
        </div>
    );
}
