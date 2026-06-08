import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { loginController, logoutController, registerController } from './auth.controller.js'

export const authRoute = Router()

authRoute.post('/login', asyncHandler(loginController))
authRoute.post('/register', asyncHandler(registerController))
authRoute.post('/logout', logoutController)
