// psql caper-socialnetwork -f sql/users.sql

const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/caper-socialnetwork"
);

// USER REGISTRATION
module.exports.registerUser = (first, last, email, hashedPass) => {
    return db.query(
        `INSERT INTO users (first, last, email, hashedpass) VALUES ($1, $2, $3, $4) RETURNING id, first, last`,
        [first, last, email, hashedPass]
    );
};

//USER LOGIN
module.exports.getUserByEmail = (email) => {
    return db
        .query(`SELECT * FROM users WHERE email = $1`, [email])
        .then(({ rows }) => rows);
};

//GET CODE
exports.addCode = function (email, code) {
    return db
        .query(
            `INSERT INTO password_reset_codes (email, code)
            VALUES ($1, $2) RETURNING id`,
            [email, code]
        )
        .then(({ rows }) => rows);
};

// RESET PASSWORD
module.exports.resetUserPassword = function (email) {
    return db
        .query(
            `SELECT * FROM password_reset_codes WHERE CURRENT_TIMESTAMP - created_at < INTERVAL '10 minutes'
            AND email = $1 ORDER BY id DESC LIMIT 1`,
            [email]
        )
        .then(({ rows }) => rows);
};

//UPDATE PASSWORD
module.exports.updateUserPassword = (email, hashedPass) => {
    return db.query(`UPDATE users SET hashedPass = $2 WHERE email = $1`, [
        email,
        hashedPass,
    ]);
};

//GET USER INFO
module.exports.getUserInfo = (id) => {
    return db.query(`SELECT * FROM users WHERE id = $1`, [id]);
};

//ADD UPLOADED
module.exports.addUserPic = (email, imageUrl) => {
    return db.query(` UPDATE users SET img_url = $2 WHERE email = $1`, [
        email,
        imageUrl,
    ]);
};

// CHANGE BIO
exports.editBio = function (id, bio) {
    return db.query(`UPDATE users SET bio = $2 WHERE id = $1`, [id, bio]);
};

// SEARCH FOR OTHER USERS
exports.findUsers = function (searchFor) {
    return db
        .query(
            `SELECT * FROM users WHERE first ILIKE $1 OR last ILIKE $1
            OR CONCAT(first, ' ', last) ILIKE $1 ORDER BY id LIMIT 6`,
            [searchFor + "%"]
        )
        .then(({ rows }) => rows);
};

// SHOW RECENT USERS
exports.getRecentUsers = function (userId) {
    return db
        .query(
            `SELECT * FROM users WHERE NOT id = $1
            ORDER BY id DESC LIMIT 3`,
            [userId]
        )
        .then(({ rows }) => rows);
};

// SHOW FRIENDS STATUS
exports.getFriendsStatus = function (me, otherUser) {
    return db
        .query(
            `SELECT * FROM friendships WHERE (receiver_id = $1 AND sender_id = $2)
            OR (receiver_id = $2 AND sender_id = $1)`,
            [me, otherUser]
        )
        .then(({ rows }) => rows);
};

// SEND FRIEND REQUEST
exports.makeFriendsReq = function (me, otherUser) {
    return db
        .query(
            `INSERT INTO friendships (sender_id, receiver_id)
            VALUES ($1, $2) RETURNING id`,
            [me, otherUser]
        )
        .then(({ rows }) => rows);
};

// ACCEPT FIRENDS REQUEST
exports.acceptFriendsReq = function (me, otherUser) {
    return db
        .query(
            `UPDATE friendships SET accepted = true
            WHERE (receiver_id = $1 AND sender_id = $2) RETURNING id`,
            [me, otherUser]
        )
        .then(({ rows }) => rows);
};

// UNFRIEND
exports.endFriendship = function (sender_id, receiver_id) {
    return db
        .query(
            `DELETE FROM friendships WHERE (receiver_id = $1 AND sender_id = $2)
            OR (receiver_id = $2 AND sender_id = $1) RETURNING id`,
            [sender_id, receiver_id]
        )
        .then(({ rows }) => rows);
};

// SHOW FRIENDS APPLICATIONS
exports.getFriendsWannabes = function (userId) {
    return db
        .query(
            `SELECT users.id, first, last, img_url, accepted FROM friendships JOIN users
            ON (accepted = false AND receiver_id = $1 AND sender_id = users.id)
            OR (accepted = true AND receiver_id = $1 AND sender_id = users.id)
            OR (accepted = true AND sender_id = $1 AND receiver_id = users.id)`,
            [userId]
        )
        .then(({ rows }) => rows);
};

// CHAT MESSAGES
exports.getLastTenChatMessages = function () {
    return db
        .query(
            `SELECT messages.id, messages.msg, messages.user_id, messages.created_at, users.first, users.last, users.img_url
            FROM messages JOIN users ON messages.user_id = users.id ORDER BY id DESC LIMIT 10`
        )
        .then(({ rows }) => rows);
};

// ADD CHAT MESSAGE
exports.addNewChatMessage = function (userId, msg) {
    return db
        .query(
            `INSERT INTO messages (user_id, msg) VALUES ($1, $2) RETURNING id`,
            [userId, msg]
        )
        .then(({ rows }) => rows);
};

// LAST CHAT MESSAGE
exports.getLastChatMessage = function (id) {
    return db
        .query(
            `SELECT messages.id, messages.msg, messages.user_id, messages.created_at, users.first, users.last, users.img_url
            FROM messages JOIN users ON messages.user_id = users.id WHERE messages.id = $1`,
            [id]
        )
        .then(({ rows }) => rows);
};

// WALL ALL POSTS
exports.getWallPosts = function (id) {
    return db
        .query(
            `SELECT wall_posts.id, wall_posts.post, wall_posts.creator_id, wall_posts.receiver_id, wall_posts.created_at, users.first, users.last, users.img_url
            FROM wall_posts JOIN users ON wall_posts.creator_id = users.id 
            WHERE wall_posts.receiver_id = $1
            ORDER BY wall_posts.id DESC`,
            [id]
        )
        .then(({ rows }) => rows);
};

// ADD WALL POST
exports.addNewWallPost = function (receiverId, creatorId, singePost) {
    return db
        .query(
            `INSERT INTO wall_posts (receiver_id, creator_id, post) VALUES ($1, $2, $3) RETURNING *`,
            [receiverId, creatorId, singePost]
        )
        .then(({ rows }) => rows);
};

// ONLINE-USERS
exports.getOnlineUsers = function (arrayOfUserIds) {
    return db
        .query(
            `SELECT id, first, last, img_url FROM users WHERE id = ANY ($1)`,
            [arrayOfUserIds]
        )
        .then(({ rows }) => rows);
};
