import AuthService from '../services/auth-service.js'

export function tokenVerificationMiddleware (req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({msg: 'Отсутствует заголовок авторизации'})    
    const accessToken = authHeader.split(' ')[1]
    if (!accessToken) return res.status(401).json({msg: 'Access токен отсутствует'})
    // так как тут не нужны запросы к БД то модели не передаются но сам объект models передать нужно чтобы не было ошибки
    const service = AuthService({models:{}})
    const accessTokenValid = service.validateAccessToken(accessToken)
    if (!accessTokenValid) return res.status(403).json({msg: 'Access токен не прошел валидацию'})
    // если все проверки прошли
    next()
}