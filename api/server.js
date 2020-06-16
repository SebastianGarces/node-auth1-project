const express = require("express")
const session = require("express-session")
const helmet = require("helmet")
const cors = require("cors")

const userRouter = require("../users/users.router")
const authRouter = require("../auth/auth-router")

// checks if session exists
const restricted = require("../auth/restricted")
// passes sessions to knex db
const knexSessionStore = require("connect-session-knex")(session)

// session configuration
const sessionConfig = {
	name: "auth-session",
	secret: "supersecret",
	cookie: {
		maxAge: 1000 * 60 * 60,
		secure: false, // should be true in productions - requires HTTPS environment
		httpOnly: true,
	},

	resave: false,
	saveUninitialized: false,

	store: new knexSessionStore({
		knex: require("../data/db-config"),
		tablename: "sessions",
		sidfieldname: "sid",
		createtable: true,
		clearInterval: 1000 * 60 * 60,
	}),
}

const server = express()

// global middleware
server.use(express.json())
server.use(helmet())
server.use(cors())

// adds session with session config obj
server.use(session(sessionConfig))

server.use("/api/users", restricted, userRouter)
server.use("/api/auth", authRouter)

module.exports = server
