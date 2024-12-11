import bcryptjs from 'bcryptjs';

export default ({
    models: { UsersModel, DirectoriesModel }
}) => ({
    async getAndPrepareUsersList(query) {
        try {
            const rawList = await UsersModel.getAllUsersQuery(query)
            return Promise.all(rawList.map(async user => {
                let roleTitle = ''
                let jobTitle = ''
                let specializationTitle = ''
                try {
                    const response = await DirectoriesModel.getCurrentRoleQuery(user.role)
                    roleTitle = response.title
                } catch(error) {
                    console.log('[api/directories/roles]: ошибка получения данных - ', error.message)
                }
                try {
                    const response = await DirectoriesModel.getCurrentJobQuery(user.job)
                    jobTitle = response.title
                } catch(error) {
                    console.log('[api/directories/jobs]: ошибка получения данных - ', error.message)
                }
                try {
                    const response = await DirectoriesModel.getCurrentClientTypeQuery(user.specialization)
                    specializationTitle = response.title
                } catch(error) {
                    console.log('[api/directories/clients-types]: ошибка получения данных - ', error.message)
                }
                return {...user, 
                    role: roleTitle,
                    job: jobTitle,
                    specialization: specializationTitle
                }
            }))
        } catch(error) {
            console.log('[api/users]: ошибка получения данных - ', error.message)
        }
    },

    async getCurrentUserInfo(id) {
        try {
            const rawInfo = await UsersModel.getCurrentUserQuery(id)
            let roleTitle = ''
            let jobTitle = ''
            let specializationTitle = ''
            try {
                const response = await DirectoriesModel.getCurrentRoleQuery(rawInfo.role)
                roleTitle = response.title
            } catch(error) {
                console.log('[api/directories/roles]: ошибка получения данных - ', error.message)
            }
            try {
                const response = await DirectoriesModel.getCurrentJobQuery(rawInfo.job)
                jobTitle = response.title
            } catch(error) {
                console.log('[api/directories/jobs]: ошибка получения данных - ', error.message)
            }
            try {
                const response = await DirectoriesModel.getCurrentClientTypeQuery(rawInfo.specialization)
                specializationTitle = response.title
            } catch(error) {
                console.log('[api/directories/clients-types]: ошибка получения данных - ', error.message)
            }
            return {...rawInfo, 
                role: roleTitle,
                job: jobTitle,
                specialization: specializationTitle
            }
        } catch(error) {
            console.log('[api/users/user-:userId]: ошибка получения данных - ', error.message)
        }
    },

    async updateUser(req) {
        const updData = req.body.password
            ? {...req.body, password: bcryptjs.hashSync(req.body.password, 10)}
            : req.body
        try {
            return UsersModel.updateUserQuery(req.params.userId, updData)
        } catch (error) {
            console.log('[api/users/user-:userId]: ошибка обновления данных - ', error.message)
        }
    },

    async createUser(user) {
        const preparedUserInfo = {...user, password: bcryptjs.hashSync(user.password, 10)}
        try {
            return UsersModel.createUserQuery(preparedUserInfo)
        } catch (error) {
            console.log('[api/users]: ошибка создания нового пользователя - ', error.message)
        }
    }
})