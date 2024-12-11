export default ({
  models: { UsersModel, DirectoriesModel },
  services: { UsersService }
}) => ({
  async getAllUsers (req, res) {  
    const service = UsersService({models:{UsersModel,DirectoriesModel}})
    const result = await service.getAndPrepareUsersList(req.query)
    res.json(result)
  },

  async getCurrentUser (req, res) {
    const service = UsersService({models:{UsersModel,DirectoriesModel}})
    const result = await service.getCurrentUserInfo(req.params.userId)
    res.json(result)
  },

  async userExistenceCheck (req, res) {
    UsersModel.userExistenceCheckQuery(req.query.email)
      .then(result => res.json(result))
      .catch(error => console.log('[api/users/existence-check]: ошибка проверки существования пользователя - ', error.message))
  },

  async updateUser (req, res) {
    const service = UsersService({models:{UsersModel}})
    const response = await service.updateUser(req)
    res.json(response)
  },

  async deleteUser (req, res) {

  },

  async createUser (req, res) {
    const service = UsersService({models:{UsersModel}})
    const response = await service.createUser(req.body)
    res.json(response)
  },

  async countAllUsers (req, res) {
    UsersModel.countAllUsersQuery()
      .then(result => res.json(result))
      .catch(error => console.log('[api/users/total]: ошибка получения данных - ', error.message))
  }
})