const {PrismaClient} = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

const register = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: req.body.email },
                    { username: req.body.username },
                ],
            },
        })

        if (user) {
            return res.status(409).json({ message: 'User already exists' })
        }

        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        const newUser = await prisma.user.create({
            data: {
                email: req.body.email,
                username: req.body.username,
                password: hashedPassword,
            },
        })
        if (!newUser) {
            return res.json({ message: 'Error creating user' })
        }

        const token = jwt.sign({ id: newUser.id }, 'jwtkey')
        const { password, ...other } = newUser

        res.cookie('access_token', token, {
            httpOnly: true,
        })
            .status(201)
            .json(other)
    } catch (error) {
        res.status(500).json({ message: error.toString() })
    }
}

const login = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: req.body.email },
                    { username: req.body.username },
                ],
            },
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password,
            user.password
        )
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign({ id: user.id }, 'jwtkey')
        const { password, ...other } = user

        res.cookie('access_token', token, {
            httpOnly: true,
        })
            .status(200)
            .json(other)
    } catch (error) {
        res.status(500).json({ message: error.toString() })
    }
}

const logout = (req, res) => {
    try {
        res.clearCookie('access_token', {
            sameSite: 'None',
            secure: true,
        })
            .status(200)
            .json({ message: 'Logged out' })
    } catch (error) {
        res.status(500).json({ message: error.toString() })
    }
}

module.exports = { register, login, logout }