export default ({
    models: { DealsModel, DirectoriesModel },
}) => ({
    async getAndPrepareAllDealsList(query) {
        try {
            const rawList = await DealsModel.getAllDealsQuery(query)
            
            const dealsCount = query.mode === 'all'
                ? await DealsModel.countAllDealsQuery()
                : await DealsModel.countDealsByCurrentUserQuery(query.managerId)
            const preparedList = await Promise.all(rawList.map(async deal => {
                let currency = {}
                let status = {}
                try {
                    currency = await DirectoriesModel.getCurrentCurrencyQuery(deal.currency)
                } catch(error) {
                    console.log('[api/directories/currencies/:id]: ошибка получения данных - ', error.message)
                }
                try {
                    status = await DirectoriesModel.getCurrentDealsStatusQuery(deal.status)
                } catch(error) {
                    console.log('[api/directories/deals-statuses/:id]: ошибка получения данных - ', error.message)
                }
                return {...deal, currency, status}
            }))
            return {
                quantity: dealsCount.quantity,
                items: preparedList
            }
        } catch(error) {
            console.log('[api/deals]: ошибка получения данных - ', error.message)
        }
    },

    async getCurrentDealInfo(id) {        
        try {
            const rawInfo = await DealsModel.getCurrentDealQuery(id)
            let currency = {}
            let status = {}
            try {
                currency = await DirectoriesModel.getCurrentCurrencyQuery(rawInfo.currency)
            } catch(error) {
                console.log('[api/directories/currencies/:id]: ошибка получения данных - ', error.message)
            }
            try {
                status = await DirectoriesModel.getCurrentDealsStatusQuery(rawInfo.status)
            } catch(error) {
                console.log('[api/directories/deals-statuses/:id]: ошибка получения данных - ', error.message)
            }
            return {...rawInfo, currency, status}
        } catch(error) {
            console.log('[api/deals/deal-:dealId]: ошибка получения данных - ', error.message)
        }
    },

    async getAndPrepareUserDealsList(req) {
        try {
            const rawList = await DealsModel.getDealsByCurrentUserQuery(req)
            return Promise.all(rawList.map(async deal => {
                let currency = {}
                let status = {}
                try {
                    currency = await DirectoriesModel.getCurrentCurrencyQuery(deal.currency)
                } catch(error) {
                    console.log('[api/directories/currencies/:id]: ошибка получения данных - ', error.message)
                }
                try {
                    status = await DirectoriesModel.getCurrentDealsStatusQuery(deal.status)
                } catch(error) {
                    console.log('[api/directories/deals-statuses/:id]: ошибка получения данных - ', error.message)
                }
                return {...deal, currency, status}
            }))
        } catch(error) {
            console.log('[api/deals/user-:userId]: ошибка получения данных - ', error.message)
        }
    },

    async getAndPrepareClientDealsList(req) {
        try {
            const rawList = await DealsModel.getDealsByCurrentClientQuery(req)
            return Promise.all(rawList.map(async deal => {
                let currency = {}
                let status = {}
                try {
                    currency = await DirectoriesModel.getCurrentCurrencyQuery(deal.currency)
                } catch(error) {
                    console.log('[api/directories/currencies/:id]: ошибка получения данных - ', error.message)
                }
                try {
                    status = await DirectoriesModel.getCurrentDealsStatusQuery(deal.status)
                } catch(error) {
                    console.log('[api/directories/deals-statuses/:id]: ошибка получения данных - ', error.message)
                }
                return {...deal, currency, status}
            }))
        } catch(error) {
            console.log('[api/deals/client-:clientId]: ошибка получения данных - ', error.message)
        }
    }
})