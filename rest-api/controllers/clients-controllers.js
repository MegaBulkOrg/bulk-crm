export default ({
  models: { ClientsModel, DirectoriesModel },
  services: { ClientsService }
}) => ({
  async getAllClients (req, res) {
    const service = ClientsService({models:{ClientsModel,DirectoriesModel}})
    const result = await service.getAndPrepareAllClientsList(req.query)
    res.json(result)
  },

  async getCurrentClient (req, res) {
    const service = ClientsService({models:{ClientsModel,DirectoriesModel}})
    const result = await service.getCurrentClientInfo(req.params.clientId)
    res.json(result)
  },

  async getClientsByCurrentUser (req, res) {
    const service = ClientsService({models:{ClientsModel,DirectoriesModel}})
    const result = await service.getAndPrepareUserClientsList(req)
    res.json(result)
  },

  async updateClient (req, res) {
    ClientsModel.updateClientQuery(req.params.clientId, req.body)
         .then(result => res.send(result))
         .catch(error => console.log('[api/clients/client-:clientId]: ошибка обновления данных - ', error.message))
  },

  async deleteClient (req, res) {

  },

  async createClient (req, res) {
    ClientsModel.createClientQuery(req.body)
         .then(result => res.send(result))
         .catch(error => console.log('[api/clients]: ошибка создания нового клиента - ', error.message))
  },

  async countClientsByCurrentUser (req, res) {
    ClientsModel.countClientsByCurrentUserQuery(req.params.userId)
         .then(result => res.send(result))
         .catch(error => console.log('[api/clients/user-:userId/count]: ошибка получения данных - ', error.message))
  },

  async countAllClients (req, res) {
    ClientsModel.countAllClientsQuery()
         .then(result => res.send(result))
         .catch(error => console.log('[api/clients/total]: ошибка получения данных - ', error.message))
  }
})