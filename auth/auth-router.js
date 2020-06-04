const router = require("express").Router()
const bcrypt = require("bcryptjs")

const Users = require("../users/users-model")

// registers new user
router.post("/register", async (req, res) => {
	const user = req.body

	const hash = bcrypt.hashSync(user.password, 10)

    user.password = hash
    
    console.log(user)

	try {
		const newUser = await Users.add(user)
		res.status(201).json(newUser)
	} catch (error) {
		res.status(500).json(error)
	}
})

// logins user
router.post("/login", async (req, res) => {
	let { username, password } = req.body

	try {
		const user = await Users.findBy({ username }).first()

		if (user && bcrypt.compareSync(password, user.password)) {
			req.session.user = user
			res.status(200).json({ message: `Welcome ${user.username}!` })
		} else {
			res.status(401).json({ message: "Invalid credentials" })
		}
	} catch (error) {
		res.status(500).json(error)
	}
})

// logout user
router.delete("/logout", (req, res) => {
	if (req.session) {
		req.session.destroy(error => {
			if (error) {
				res.status(400).json({ message: "error logging out: ", error })
			} else {
				res.json({ message: "User logged out" })
			}
		})
	} else {
		res.end()
	}
})

module.exports = router
