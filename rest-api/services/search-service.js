export default ({
    models: { SearchModel },
}) => ({
    async getSearchResults(queryParams) {
        try {
            const response = await SearchModel.getSearchResultsQuery(queryParams.query, queryParams.sortDir)            
            if (queryParams.mode === 'all') {
                return response
            } else {
                const responseForCurrentManager = []
                for (const item of response) {
                    if (item.item_type === 'users') responseForCurrentManager.push(item)
                    if (item.item_type === 'clients') {
                        const checkResponse = await SearchModel.relationClientToManagerCheck(item.id, Number(queryParams.managerId))
                        if (checkResponse) responseForCurrentManager.push(item)
                    }
                    if (item.item_type === 'deals') {
                        const checkResponse = await SearchModel.relationDealToManagerCheck(item.id, Number(queryParams.managerId))
                        if (checkResponse) responseForCurrentManager.push(item)
                    }
                    if (item.item_type === 'notes') {
                        const checkResponse = await SearchModel.relationNoteToManagerCheck(item.id, Number(queryParams.managerId))
                        if (checkResponse) responseForCurrentManager.push(item)
                    }
                }
                return responseForCurrentManager
            }   
        } catch (error) {
            console.log('[api/search]: ошибка получения данных - ', error.message)
        }
    }
})