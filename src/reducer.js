export default function reducer(state = {}, action) {
    if (action.type === "RECEIVE_FRIENDS_WANNABES") {
        state = {
            ...state,
            friendsWannabes: action.friendsWannabes,
        };
    }

    if (action.type === "ACCEPT_FRIEND_REQUEST") {
        state = {
            ...state,
            friendsWannabes: state.friendsWannabes.map((user) => {
                if (user.id == action.otherUserId) {
                    return {
                        ...user,
                        accepted: true,
                    };
                }
                return user;
            }),
        };
    }

    if (action.type === "UNFRIEND") {
        state = {
            ...state,
            friendsWannabes: state.friendsWannabes.filter((user) => {
                return user.id != action.otherUserId;
            }),
        };
    }

    if (action.type === "CHAT_MESSAGES") {
        state = {
            ...state,
            chatMessages: action.msgs,
        };
    }

    if (action.type === "CHAT_MESSAGE") {
        state = {
            ...state,
            chatMessages: state.chatMessages.concat(action.msg),
        };
    }

    if (action.type === "WALL_POSTS") {
        state = {
            ...state,
            wallPosts: action.allPosts,
        };
    }

    if (action.type === "WALL_POST") {
        state = {
            ...state,
            wallPosts: state.wallPosts.concat(action.post),
        };
    }

    if (action.type === "SHOW_ONLINE_USERS") {
        state = {
            ...state,
            onlineUsers: action.onlineUsers,
        };
    }

    if (action.type === "PASS_USER_ID") {
        state = {
            ...state,
            userId: action.userId,
        };
    }
    return state;
}
