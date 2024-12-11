export default ({
    models: { DirectoriesModel }
}) => ({
    async getAllRoles (req, res) {
        DirectoriesModel.getAllRolesQuery()
                   .then(result => res.json(result))
                   .catch(error => console.log('[api/directories/roles]: ошибка получения данных - ', error.message))
    },

    async getAllJobs (req, res) {
        DirectoriesModel.getAllJobsQuery()
                    .then(result => res.json(result))
                    .catch(error => console.log('[api/directories/jobs]: ошибка получения данных - ', error.message))
    },

    async getAllClientsTypes (req, res) {
        DirectoriesModel.getAllClientsTypesQuery()
                   .then(result => res.json(result))
                   .catch(error => console.log('[api/directories/clients-types]: ошибка получения данных - ', error.message))
    },

    async getAllClientsContactPersonsContactTypes (req, res) {
        DirectoriesModel.getAllClientsContactPersonsContactTypesQuery()
                   .then(result => res.json(result))
                   .catch(error => console.log('[api/directories/clients-contact-persons-contact-types]: ошибка получения данных - ', error.message))
    },

    async getAllCurrencies (req, res) {
        DirectoriesModel.getAllCurrenciesQuery()
                   .then(result => res.json(result))
                   .catch(error => console.log('[api/directories/currencies]: ошибка получения данных - ', error.message))
    },    
    
    async getAllDealsStatuses (req, res) {
        DirectoriesModel.getAllDealsStatusesQuery()
                   .then(result => res.json(result))
                   .catch(error => console.log('[api/directories/deals-statuses]: ошибка получения данных - ', error.message))
    },

    async getAllManagers (req, res) {
        DirectoriesModel.getAllManagersQuery()
                   .then(result => res.json(result))
                   .catch(error => console.log('[api/directories/managers]: ошибка получения данных - ', error.message))
    }
})