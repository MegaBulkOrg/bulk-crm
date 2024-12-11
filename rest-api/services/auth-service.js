import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config'

export default ({
    models: { AuthModel, UsersModel }
}) => ({
    generateTokens(payload) {
        // для проверок
        // const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: 60})
        // реальный токен
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '1d'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
        return {accessToken, refreshToken}
    },
    
    async login(credentials) {
        try {
            const response = await AuthModel.findUserQuery(credentials.email)            
            if (typeof response === 'object') {
                if (bcryptjs.compareSync(credentials.password, response.password)) {
                    const tokens = this.generateTokens({
                        userId: response.id,
                        userRole: response.role
                    })
                    try {
                        AuthModel.saveRefreshTokenQuery({
                            id_user: response.id, 
                            refresh_token: tokens.refreshToken
                        })
                        return {
                            status: true,
                            ...tokens
                        }
                    } catch (error) {
                        console.log('[api/auth/signup]: ошибка сохранения токена - ', error.message)
                    }
                } else {
                    return {status: false, msg: 'Пароль не подходит'}
                }
            } else {
                return {status: false, msg: response}
            }
        } catch(error) {
            console.log('[api/auth/signin]: ошибка входа - ', error.message)
        }
    },

    async logout(userId) {
        try {
            const response = await AuthModel.deleteRefreshTokenQuery(userId)
            return response === 1 ? true : false
        } catch (error) {
            console.log('[api/auth/signout]: ошибка выхода - ', error.message)
        }   
    },

    // в функциях валидации блок try/catch нужен чтобы ошибки можно было отлавливать
    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        } catch (error) {
            return null
        }
    },
    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        } catch (error) {
            return null
        }
    },

    async refresh(refreshToken) {        
        if (!refreshToken) { 
            return {status: false, msg: 'Refresh токен отсутствует'} 
        }
        const refreshTokenValid = this.validateRefreshToken(refreshToken)
        // тут если r-токен есть в БД то получаем true а если нет то false
        const refreshTokenInDb = await AuthModel.findRefreshToken(refreshToken)        
        if (!refreshTokenValid || !refreshTokenInDb) { 
            return {status: false, msg: 'Refresh токен не прошел валидацию или не найден в БД'} 
        } else {            
            try {
                const userInfo = await UsersModel.getCurrentUserQuery(refreshTokenValid.userId)                
                const tokens = this.generateTokens({
                    userId: userInfo.id,
                    userRole: userInfo.role
                })
                try {
                    AuthModel.saveRefreshTokenQuery({
                        id_user: userInfo.id, 
                        refresh_token: tokens.refreshToken
                    })                    
                    return {status: true, ...tokens}
                } catch (error) {
                    console.log('[api/auth/refresh]: ошибка обновления токена - ', error.message)
                }
            } catch (error) {
                console.log('[api/auth/refresh]: ошибка получения актуальной информации о пользователе - ', error.message)
            }
        }
    }
})