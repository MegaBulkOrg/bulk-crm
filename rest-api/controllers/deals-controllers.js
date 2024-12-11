export default ({
  models: { DealsModel, DirectoriesModel },
  services: { DealsService }
}) => ({
  async getAllDeals (req, res) {
    const service = DealsService({models:{DealsModel,DirectoriesModel}})
    const result = await service.getAndPrepareAllDealsList(req.query)
    res.json(result)
  },

  async getCurrentDeal (req, res) {    
    const service = DealsService({models:{DealsModel,DirectoriesModel}})
    const result = await service.getCurrentDealInfo(req.params.dealId)
    res.json(result)
  },

  async getDealsByCurrentUser (req, res) {
    const service = DealsService({models:{DealsModel,DirectoriesModel}})
    const result = await service.getAndPrepareUserDealsList(req)
    res.json(result)
  },

  async getDealsByCurrentClient (req, res) {
    const service = DealsService({models:{DealsModel,DirectoriesModel}})
    const result = await service.getAndPrepareClientDealsList(req)
    res.json(result)
  },

  async updateDeal (req, res) {
    DealsModel.updateDealQuery(req.params.dealId, req.body)
         .then(result => res.send(result))
         .catch(error => console.log('[api/deals/deal-:dealId]: ошибка обновления данных - ', error.message))
  },

  async deleteDeal (req, res) {

  },

  async createDeal (req, res) {
    DealsModel.createDealQuery(req.body)
         .then(result => res.send(result))
         .catch(error => console.log('[api/deals]: ошибка создания новой сделки - ', error.message))
  },

  async countAllDeals (req, res) {
    DealsModel.countAllDealsQuery()
         .then(result => res.json(result))
         .catch(error => console.log('[api/deals/total]: ошибка получения данных - ', error.message))
  },

  async сountDealsInWork (req, res) {
    DealsModel.сountDealsInWorkQuery(req.query.id)
        .then(result => res.json(result))
        .catch(error => console.log('[api/deals/count-inwork]: ошибка получения данных - ', error.message))
  },

  async сountDealsDone (req, res) {
    DealsModel.сountDealsDoneQuery(req.query.id)
        .then(result => res.json(result))
        .catch(error => console.log('[api/deals/count-done]: ошибка получения данных - ', error.message))
  },

  async сountDealsInWorkByCurrentUser (req, res) {
    DealsModel.сountDealsInWorkByCurrentUserQuery(req.query.id)
        .then(result => res.json(result))
        .catch(error => console.log('[api/deals/count-inwork-by-user]: ошибка получения данных - ', error.message))
  },

  async сountDealsDoneByCurrentUser (req, res) {
    DealsModel.сountDealsDoneByCurrentUserQuery(req.query.id)
        .then(result => res.json(result))
        .catch(error => console.log('[api/deals/count-done-by-user]: ошибка получения данных - ', error.message))
  },

  async сountDealsFailedByCurrentUser (req, res) {
    DealsModel.сountDealsFailedByCurrentUserQuery(req.query.id)
        .then(result => res.json(result))
        .catch(error => console.log('[api/deals/count-failed-by-user]: ошибка получения данных - ', error.message))
  }
})