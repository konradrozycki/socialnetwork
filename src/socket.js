import * as io from "socket.io-client";

import {
    chatMessages,
    chatMessage,
    showOnlineUsers,
    passUserId,
    postWall,
    wallPosts,
} from "./actions";

export let socket;

export const init = (store) => {
    if (!socket) {
        socket = io.connect();

        socket.on("chatMessages", (msgs) => {
            store.dispatch(chatMessages(msgs));
        });

        socket.on("chatMessage", (msg) => store.dispatch(chatMessage(msg)));

        socket.on("wallPosts", (allPosts) => {
            store.dispatch(wallPosts(allPosts));
        });

        socket.on("postWall", (newPost) => store.dispatch(postWall(newPost)));

        socket.on("showOnlineUsers", (users) =>
            store.dispatch(showOnlineUsers(users))
        );

        socket.on("your userId", (userId) =>
            store.dispatch(passUserId(userId))
        );
    }
};
