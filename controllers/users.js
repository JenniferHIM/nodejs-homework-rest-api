const jwt = require('jsonwebtoken')
const fs = require('fs/promises')
// const path = require('path')
// const jimp = require('jimp')
const cloudinary = require('cloudinary').v2
const {promisify} = require('util')
const Users = require('../model/users')
const { HttpCode } = require('../helpers/constants')
const EmailService = require('../services/email')

require('dotenv').config()
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY_CLOUD,
    api_secret: process.env.API_SECRET_CLOUD
})

const uploadToCloud = promisify(cloudinary.uploader.upload)

const register = async (req, res, next) => {
    const {  email } = req.body
    const user = await Users.findByEmail(email)
    if (user) {
        return res.status(HttpCode.CONFLICT).json({
            status: 'error',
            code: HttpCode.CONFLICT,
            message: 'Email is already used'
        })
    }
    try {
        const newUser = await Users.createUser(req.body)
        const { id, name, email, subscription, avatar, verifyTokenEmail } = newUser
        try {
            const emailService = new EmailService(process.env.NODE_ENV)
            await emailService.sendVerifyEmail(verifyTokenEmail, email, name)
        } catch (e) {
            console.log(e.message)
        }
        return res.status(HttpCode.CREATED).json({
            status: 'success',
            code: HttpCode.CREATED,
            data: {
                id,
                email,
                subscription,
                avatar
            }
        })
    } catch (e) {
        next(e)
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body
    const user = await Users.findByEmail(email)
    const isValidPassword = await user?.validPassword(password)
    if (!user || !isValidPassword || !user.verify) {
        return res.status(HttpCode.UNAUTHORIZED).json({
            status: 'error',
            code: HttpCode.UNAUTHORIZED,
            message: 'Not correct email or password or not verified'
        })
    }
    const payload = { id: user.id }
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '2h' })
    await Users.updateToken(user.id, token)
    return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: {token}
    })
}
 
const logout = async (req, res, next) => {
    const id = req.user.id
    await Users.updateToken(id, null)
    return res.status(HttpCode.NO_CONTENT).json({})
}

const updateAvatar = async (req, res, next) => {
    const { id } = req.user
    const {idCloudAvatar, avatarUrl} = await saveAvatarUserCloud(req)
    await Users.updateAvatar(id, avatarUrl, idCloudAvatar)
    return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: {avatarUrl}
    })
}
// Облачное хранение
const saveAvatarUserCloud = async (req) => {
    const pathFile = req.file.path
    const { public_id: idCloudAvatar , secure_url: avatarUrl} = await uploadToCloud(pathFile, {
        public_id: req.user.idCloudAvatar?.replace('Avatars/', ''),
        folder: 'Avatars',
        transformation: {width: 250, height: 250, crop: 'pad' }
    })
    await fs.unlink(pathFile)
    return {idCloudAvatar, avatarUrl}
}

const verify = async (req, res, next) => {
    try {
        const user = await Users.findByVerifyTokenEmail(req.params.token)
        if (user) {
            await Users.updateVerifyToken(user.id, true, null)
            return res.status(HttpCode.OK).json({
                status: 'success',
                code: HttpCode.OK,
                data: { message: 'Verification is succesful' }
            })
        }
        return res.status(HttpCode.BAD_REQUEST).json({
            status: 'error',
            code: HttpCode.BAD_REQUEST,
            message: 'Your verification token is not valid.'
        })
    } catch (error) {
        next(error)
    }
}

const repeatEmailVerify = async (req, res, next) => {
    try {
        const user = await Users.findByEmail(req.body.email)
        if (user) {
            const { name, verifyTokenEmail, email } = user
            const emailService = new EmailService(process.env.NODE_ENV)
            await emailService.sendVerifyEmail(verifyTokenEmail, email ,name )
            return res.status(HttpCode.OK).json({
                status: 'success',
                code: HttpCode.OK,
                data: {
                    message: 'Verification email resubmitted'
                }
            })
        }
        return res.status(HttpCode.NOT_FOUND).json({
            status: 'error',
            code: HttpCode.NOT_FOUND,
            message: 'User not found'
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    register,
    login,
    logout,
    updateAvatar,
    verify,
    repeatEmailVerify
}