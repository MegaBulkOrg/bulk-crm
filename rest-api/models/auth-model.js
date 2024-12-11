import knex from 'knex';
import db_config from '../db_config.js';

const db = knex(db_config);

class Auth {
    static async saveRefreshTokenQuery(sessionInfo) {
        const response = await db.select().table('sessions').where({id_user: sessionInfo.id_user}).first()
        return response
            ? db('sessions').where({id_user: sessionInfo.id_user}).update({
                ...response, refresh_token: sessionInfo.refresh_token
            })
            : db.insert(sessionInfo).into('sessions')
    }
    static async deleteRefreshTokenQuery(userId) {
        return db('sessions').where('id_user', userId).del()
                             .then(response => response)
    }
    static async findUserQuery(email) {
        const response = await db.select().table('users').where({email}).first()
        return response ? response : 'Пользователя с такой почтой не существует'
    }
    static async findRefreshToken(refreshToken) {
        return db.select().table('sessions').where('refresh_token', refreshToken)
                                            .then(response => response.length > 0 ? true : false)
    }
}

export default Auth