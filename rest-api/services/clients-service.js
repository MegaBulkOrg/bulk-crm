export default ({
    models: { ClientsModel, DirectoriesModel }
}) => ({
    async getAndPrepareAllClientsList(query) {
        try {
            const rawList = await ClientsModel.getAllClientsQuery(query)            
            const clientsCount = query.mode === 'all'
                ? await ClientsModel.countAllClientsQuery()
                : await ClientsModel.countClientsByCurrentUserQuery(query.managerId)
            const preparedList = await Promise.all(rawList.map(async client => {
                let typeTitle = ''
                let contactPersonContactTypeTitle = ''
                try {
                    const response = await DirectoriesModel.getCurrentClientTypeQuery(client.type)
                    typeTitle = response.title
                } catch(error) {
                    console.log('[api/directories/clients-types/:id]: ошибка получения данных - ', error.message)
                }
                try {
                    const response = await DirectoriesModel.getCurrentClientsContactPersonsContactTypeQuery(client.contact_person_contact_type)
                    contactPersonContactTypeTitle = response.alias
                } catch(error) {
                    console.log('[api/directories/clients-contact-persons-contact-types/:id]: ошибка получения данных - ', error.message)
                }
                return {...client, 
                    type: typeTitle,
                    contact_person_contact_type: contactPersonContactTypeTitle
                }
            }))
            return {
                quantity: clientsCount.quantity,
                items: preparedList
            }
        } catch(error) {
            console.log('[api/clients]: ошибка получения данных - ', error.message)
        }
    },

    async getCurrentClientInfo(id) {
        try {
            const rawInfo = await ClientsModel.getCurrentClientQuery(id)            
            let typeTitle = ''
            let contactPersonContactTypeTitle = ''
            try {
                const response = await DirectoriesModel.getCurrentClientTypeQuery(rawInfo.type)
                typeTitle = response.title
            } catch(error) {
                console.log('[api/directories/clients-types/:id]: ошибка получения данных - ', error.message)
            }
            try {
                const response = await DirectoriesModel.getCurrentClientsContactPersonsContactTypeQuery(rawInfo.contact_person_contact_type)
                contactPersonContactTypeTitle = response.alias
            } catch(error) {
                console.log('[api/directories/clients-contact-persons-contact-types/:id]: ошибка получения данных - ', error.message)
            }            
            return {...rawInfo, 
                type: typeTitle,
                contact_person_contact_type: contactPersonContactTypeTitle
            }
        } catch(error) {
            console.log('[api/clients/client-:clientId]: ошибка получения данных - ', error.message)
        }
    },

    async getAndPrepareUserClientsList(req) {
        try {
            const rawList = await ClientsModel.getClientsByCurrentUserQuery(req)
            return Promise.all(rawList.map(async client => {
                let typeTitle = ''
                let contactPersonContactTypeTitle = ''
                try {
                    const response = await DirectoriesModel.getCurrentClientTypeQuery(client.type)
                    typeTitle = response.title
                } catch(error) {
                    console.log('[api/directories/clients-types/:id]: ошибка получения данных - ', error.message)
                }
                try {
                    const response = await DirectoriesModel.getCurrentClientsContactPersonsContactTypeQuery(client.contact_person_contact_type)
                    contactPersonContactTypeTitle = response.alias
                } catch(error) {
                    console.log('[api/directories/clients-contact-persons-contact-types/:id]: ошибка получения данных - ', error.message)
                }
                return {...client, 
                    type: typeTitle,
                    contact_person_contact_type: contactPersonContactTypeTitle
                }
            }))
        } catch(error) {
            console.log('[api/clients/user-:userId]: ошибка получения данных - ', error.message)
        }
    }
})