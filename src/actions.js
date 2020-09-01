import axios from "./axios";

export async function receiveFriendsWannabes() {
    const { data } = await axios.get("/friends-wannabes");
    return {
        type: "RECEIVE_FRIENDS_WANNABES",
        friendsWannabes: data.friendsWannabes,
    };
}

export async function acceptFriendRequest(otherUserId) {
    const { data } = await axios.post("/accept-friend-request/" + otherUserId);
    return {
        type: "ACCEPT_FRIEND_REQUEST",
        otherUserId,
    };
}

export async function unfriend(otherUserId) {
    const { data } = await axios.post("/end-friendship/" + otherUserId);
    return {
        type: "UNFRIEND",
        otherUserId,
    };
}

export function chatMessages(msgs) {
    return {
        type: "CHAT_MESSAGES",
        msgs,
    };
}

export function chatMessage(msg) {
    return {
        type: "CHAT_MESSAGE",
        msg,
    };
}

export function showOnlineUsers(onlineUsers) {
    return {
        type: "SHOW_ONLINE_USERS",
        onlineUsers,
    };
}

export function passUserId(userId) {
    return {
        type: "PASS_USER_ID",
        userId,
    };
}

export function postWall(post) {
    return {
        type: "WALL_POST",
        post,
    };
}

export function wallPosts(allPosts) {
    return {
        type: "WALL_POSTS",
        allPosts,
    };
}
