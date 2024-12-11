// в maxAge число 2592000000 это 30 дней в миллисекундах

export default ({
  models: { AuthModel, UsersModel },
  services: { AuthService }
}) => ({  
  async signin (req, res) {
    const service = AuthService({models:{AuthModel}})
    const response = await service.login(req.body)
    if (response.status) res.cookie('refreshToken', response.refreshToken, {
      maxAge: 2592000000,
      httpOnly: true
    })
    response.status
      ? res.json({status: true, accessToken: response.accessToken})
      : res.json(response)
  },

  async signout (req, res) {
    const service = AuthService({models:{AuthModel}})
    const response = await service.logout(req.query.userId)
    res.clearCookie('refreshToken')   
    res.json({
      status: response,
      msg: response
        ? 'Выход из системы успешно выполнен'
        : 'Сессия не найдена'
    })
  },

  async refresh (req, res) { 
    const { refreshToken } = req.cookies
    const service = AuthService({models:{AuthModel,UsersModel}})
    const response = await service.refresh(refreshToken)    
    if (response.status) {
      res.cookie('refreshToken', response.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true
      })
    }
    res.json(response)
  }
})