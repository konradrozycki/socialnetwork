const express = require("express");
const app = express();

const compression = require("compression");
const db = require("./db");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const csurf = require("csurf");
const bcrypt = require("./bcrypt.js");

const cryptoRandomString = require("crypto-random-string");
const { sendEmail } = require("./src/ses.js");
const { hash } = require("./bcrypt");

const { s3Url } = require("./config.json");
const s3 = require("./src/s3");

const server = require("http").Server(app);
const io = require("socket.io")(server, { origins: "localhost:8080" });

const functions = require("./functions");

let secrets;
if (process.env.NODE_ENV === "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets");
}

app.use(bodyParser.json());

app.use("/public", express.static("./public"));

app.use(compression());
const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.use(express.static("./public"));

// cookie session with socket.io:
const cookieSessionMiddleware = cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 90,
});

app.use(cookieSessionMiddleware);
io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

////////////////////////////

app.use(csurf());

app.use(function (req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});

if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: "http://localhost:8081/",
        })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

/************** ROUTES ****************/

app.post("/welcome/register", function (req, res) {
    if (
        !req.body.first ||
        !req.body.last ||
        !req.body.email ||
        !req.body.password
    ) {
        res.json({
            success: false,
        });
    } else {
        bcrypt
            .hash(req.body.password)
            .then((hashedPass) => {
                return db.registerUser(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hashedPass
                );
            })
            .then((dbData) => {
                console.log("User added to Database");
                let id = dbData.rows[0].id;
                console.log(id);
                req.session.userId = id;
                req.session.first = req.body.first;
                req.session.last = req.body.last;
                req.session.email = req.body.email;
                res.json({
                    success: true,
                });
            })
            .catch((err) => {
                console.log("error in POST register", err.message);
            });
    }
});

app.post("/welcome/login", (req, res) => {
    console.log(`your name is: ${req.body.first} ${req.body.last}`);
    let typedPW = req.body.password;
    db.getUserByEmail(req.body.email)
        .then((result) => {
            let userId = result[0].id;
            let userPW = result[0].hashedpass;
            let first = result[0].first;
            let last = result[0].last;
            console.log("userId in users table: ", userId);
            console.log("userPW safed in user table: ", userPW);
            return bcrypt.comparePassword(typedPW, userPW).then((result) => {
                console.log("passwords do match: ", result);
                if (result) {
                    req.session.userId = userId;
                    req.session.first = first;
                    req.session.last = last;
                    req.session.email = req.body.email;
                    res.json({
                        success: true,
                    });
                } else {
                    let loginErr = "wrong password or email!";
                    console.log(loginErr);
                    res.json({
                        success: false,
                    });
                }
            });
        })
        .catch((err) => {
            console.log("error in /login: ", err);
            res.json({
                success: false,
            });
        });
});

app.post("/reset/start", (req, res) => {
    const email = req.body.email;
    db.getUserByEmail(email)
        .then((results) => {
            console.log("result.length: ", results.length);
            if (results.length != 0) {
                const secretCode = cryptoRandomString({
                    length: 6,
                });
                console.log("secret code: ", secretCode);
                let recipient = req.body.email;
                let message =
                    "Hi, here is your secret code to reset your password: " +
                    secretCode;
                let subject = "Resetting your password at Filmspace";
                sendEmail(recipient, message, subject);

                db.addCode(req.body.email, secretCode)
                    .then(() => {
                        res.json({
                            success: true,
                        });
                    })
                    .catch((err) => {
                        console.log(
                            "error in addCode() /reset/start POST: ",
                            err
                        );
                        res.json({
                            success: false,
                        });
                    });
            } else {
                res.json({
                    success: false,
                });
            }
        })
        .catch((err) => {
            console.log("error in getUser() in /reset/start: ", err);
            res.json({
                success: false,
            });
        });
});

app.post("/reset/verify", (req, res) => {
    db.resetUserPassword(req.body.email)
        .then((result) => {
            console.log(result);
            if (result.length != 0) {
                console.log("code sent: ", result[0].code);
                console.log("code typed in: ", req.body.code);
                console.log("new password: ", req.body.password);
                if (result[0].code === req.body.code) {
                    hash(req.body.password)
                        .then((password) => {
                            console.log(req.body.email);
                            db.updateUserPassword(req.body.email, password)
                                .then(() => {
                                    console.log(
                                        "successfully changed password"
                                    );
                                    res.json({
                                        success: true,
                                    });
                                })
                                .catch((err) => {
                                    console.log(
                                        "error in updateUserPassword() in /reset/verify: ",
                                        err
                                    );
                                    res.json({
                                        success: false,
                                    });
                                });
                        })
                        .catch((err) => {
                            console.log(
                                "error in hash(password) in /reset/verify: ",
                                err
                            );
                            res.json({
                                success: false,
                            });
                        });
                } else {
                    res.json({
                        success: false,
                    });
                }
            } else {
                res.json({
                    success: false,
                });
            }
        })
        .catch((err) => {
            console.log("error in getUser() in /reset/verify: ", err);
            res.json({
                success: false,
            });
        });
});

app.get("/user", (req, res) => {
    console.log("* GET /user*");
    console.log("req.session in get /user: ", req.session);
    db.getUserByEmail(req.session.email)
        .then((rows) => {
            res.json({
                success: true,
                userId: rows[0].id,
                first: rows[0].first,
                last: rows[0].last,
                imageUrl: rows[0].img_url || "/public/assets/default-pic.jpeg",
                bio: rows[0].bio || "",
            });
        })
        .catch((err) => {
            console.log("error in GET /user : ", err);
            res.json({
                success: false,
            });
        });
});

app.get("/api/user/:id", (req, res) => {
    console.log("* /api/user/:id *");
    console.log("/api/user/:id", req.params.id);
    db.getUserInfo(req.params.id)
        .then((dbData) => {
            res.json({
                success: true,
                userId: dbData.rows[0].id,
                first: dbData.rows[0].first,
                last: dbData.rows[0].last,
                imageUrl:
                    dbData.rows[0].img_url || "/public/assets/default-pic.jpeg",
                bio: dbData.rows[0].bio || "",
            });

            db.getWallPosts(req.params.id)
                .then((data) => {
                    data.reverse();
                    let allPosts = functions.formatDateFromMessages(data);
                    console.log("sockets wallPosts: ", allPosts);
                    io.sockets.emit("wallPosts", allPosts);
                })
                .catch((err) => console.log("err in getWallPosts(): ", err));
        })
        .catch((err) => {
            console.log("error in GET /api/user/:id : ", err);
            res.json({
                success: false,
            });
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const imageUrl = s3Url + req.file.filename;
    db.addUserPic(req.session.email, imageUrl)
        .then((image) => {
            console.log("image in addImage(): ", image);
            res.json({
                success: true,
                imageUrl: imageUrl,
            });
        })
        .catch((err) => {
            console.log("error in POST /upload", err);
            res.json({
                success: false,
            });
        });
});

app.post("/bio/edit", (req, res) => {
    db.editBio(req.body.userId, req.body.bio)
        .then(() => {
            res.json({
                success: true,
            });
        })
        .catch((err) => {
            console.log("error in editBio(): ", err);
            res.json({
                success: false,
            });
        });
});

app.get("/logout", (req, res) => {
    console.log("*logout*");
    req.session = null;
    res.redirect("/login");
});

app.get("/api/find/:searchFor", (req, res) => {
    console.log("* /api/find/:searchFor *");
    console.log("req.params.searchFor: ", req.params.searchFor);
    db.findUsers(req.params.searchFor)
        .then((rows) => {
            console.log("rows from findUsers():", rows);
            res.json({
                success: true,
                users: rows,
            });
        })
        .catch((err) => {
            console.log("err in GET /api/find/:searchFor: ", err);
            res.json({
                success: false,
            });
        });
});

app.get("/users/recent/:userId", (req, res) => {
    console.log("* /users/recent *");
    db.getRecentUsers(req.params.userId)
        .then((rows) => {
            res.json({
                success: true,
                recentUsers: rows,
            });
        })
        .catch((err) => {
            console.log("err in GET /users/recent: ", err);
            res.json({
                success: false,
            });
        });
});

app.get("/friends-status/:userId", (req, res) => {
    console.log("* /friends-status/:userId *");
    db.getFriendsStatus(req.session.userId, req.params.userId)
        .then((rows) => {
            console.log("rows after getFriendsStatus: ", rows);
            res.json({
                success: true,
                friendsStatus: rows[0],
            });
        })
        .catch((err) => {
            console.log("err in /friends-status/:userId: ", err);
            res.json({
                success: false,
            });
        });
});

app.get("/friends-wannabes", (req, res) => {
    console.log("* /friends-wannabes *");
    db.getFriendsWannabes(req.session.userId)
        .then((rows) => {
            console.log("rows after getFriendsApplications(): ", rows);
            res.json({
                success: true,
                friendsWannabes: rows,
            });
        })
        .catch((err) => {
            console.log("err in /friends-wannabes: ", err);
            res.json({
                success: false,
            });
        });
});

app.post("/make-friend-request/:userId", (req, res) => {
    console.log("* /make-friend-request/:userId *");
    db.makeFriendsReq(req.session.userId, req.params.userId)
        .then(() => {
            res.json({
                success: true,
            });
        })
        .catch((err) => {
            console.log("err in /make-friend-request/:userId: ", err);
            res.json({
                success: false,
            });
        });
});

app.post("/accept-friend-request/:userId", (req, res) => {
    console.log("* /accept-friend-request/:userId *");
    db.acceptFriendsReq(req.session.userId, req.params.userId)
        .then(() => {
            res.json({
                success: true,
            });
        })
        .catch((err) => {
            console.log("err in /accept-friend-request/:userId: ", err);
            res.json({
                success: false,
            });
        });
});

app.post("/end-friendship/:userId", (req, res) => {
    console.log("* /end-friendship/:userId *");
    db.endFriendship(req.session.userId, req.params.userId)
        .then(() => {
            res.json({
                success: true,
            });
        })
        .catch((err) => {
            console.log("err in /end-friendship/:userId: ", err);
            res.json({
                success: false,
            });
        });
});

app.get("/welcome", function (req, res) {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("*", function (req, res) {
    if (req.session.userId) {
        res.sendFile(__dirname + "/index.html");
    } else {
        res.redirect("/welcome");
    }
});

let onlineUsers = {};
let uniqueOnlineUsersIds = [];
console.log("whats that");
const updateOnlineUsers = (onlineUsers) => {
    let onlineUsersIds = [];
    for (let socketId in onlineUsers) {
        onlineUsersIds.push(onlineUsers[socketId]);
    }
    console.log("onlineUsersIds: ", onlineUsersIds);

    uniqueOnlineUsersIds = [...new Set(onlineUsersIds)];
    console.log("unique onlineUsersIds: ", uniqueOnlineUsersIds);

    db.getOnlineUsers(uniqueOnlineUsersIds)
        .then((data) => {
            console.log("sockets showOnlineUsers:", data);
            io.sockets.emit("showOnlineUsers", data);
        })
        .catch((err) => console.log("err in getOnlineUsers(): ", err));
};

io.on("connection", function (socket) {
    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }
    const userId = socket.request.session.userId;
    console.log("your userId: ", userId);
    socket.emit("your userId", userId);

    onlineUsers[socket.id] = userId;
    console.log("onlineUsers: ", onlineUsers);
    updateOnlineUsers(onlineUsers);

    db.getLastTenChatMessages()
        .then((data) => {
            console.log("data after getLastTenChatMessages: ", data);
            data.reverse();
            let messages = functions.formatDateFromMessages(data);

            console.log("sockets chatMessages: ", messages);
            io.sockets.emit("chatMessages", messages);
        })
        .catch((err) => console.log("err in getLastTenChatMessages(): ", err));

    socket.on("post chat message", (msg) => {
        console.log("post chat message...", msg);
        db.addNewChatMessage(userId, msg)
            .then((data) => {
                db.getLastChatMessage(data[0].id)
                    .then((data) => {
                        console.log("data after getLastChatMessage: ", data);
                        let newMessage = functions.formatDateFromNewMessage(
                            data[0]
                        );
                        console.log("sockets chatMessage: ", newMessage);
                        io.sockets.emit("chatMessage", newMessage);
                    })
                    .catch((err) =>
                        console.log("err in getLastChatMessage(): ", err)
                    );
            })
            .catch((err) => console.log("err in addNewChatMessage(): ", err));
    });

    db.getWallPosts(userId)
        .then((data) => {
            console.log("data after getWallPosts: ", data);
            data.reverse();
            let allPosts = functions.formatDateFromMessages(data);
            console.log("sockets wallPosts: ", allPosts);
            io.sockets.emit("wallPosts", allPosts);
        })
        .catch((err) => console.log("err in getWallPosts(): ", err));

    socket.on("post wall post", (newPost) => {
        console.log("post wall post...", newPost);
        db.addNewWallPost(userId, userId, newPost)
            .then(() => {
                db.getWallPosts(userId)
                    .then((data) => {
                        console.log("data after getWallPosts: ", data);
                        data.reverse();
                        let allPosts = functions.formatDateFromMessages(data);
                        console.log("sockets wallPosts: ", allPosts);
                        io.sockets.emit("wallPosts", allPosts);
                    })
                    .catch((err) =>
                        console.log("err in getWallPosts(): ", err)
                    );
            })
            .catch((err) => console.log("err in addNewWallPost(): ", err));
    });

    socket.on("disconnect", function () {
        console.log(`socket with the id ${socket.id} is now disconnected`);
        delete onlineUsers[socket.id];
        updateOnlineUsers(onlineUsers);
    });
});

// with socket.io:
server.listen(process.env.PORT || 8080, function () {
    console.log("I'm listening. OVER");
});
