import React from "react";

import ProfilePic from "./profilepic";
import BioEditor from "./bioeditor";
import { Wall } from "./wall";

export default function Profile(props) {
    return (
        <div className="profile main">
            <div className="profile-left">
                <ProfilePic
                    clickHandler={props.clickHandler}
                    imageUrl={props.imageUrl}
                    first={props.first}
                    last={props.last}
                />
            </div>
            <BioEditor
                userId={props.userId}
                first={props.first}
                last={props.last}
                bio={props.bio}
                setBio={props.setBio}
            />
            <Wall />
        </div>
    );
}
