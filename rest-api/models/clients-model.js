import knex from 'knex';
import db_config from '../db_config.js';

const db = knex(db_config);

class Clients {
    static async getAllClientsQuery(query) {
        let response = db.select().table('clients')
        if (query.sortby) response = response.orderBy('id', query.sortby)
        if (query.limit) response = response.limit(query.limit)
        if (query.offset) response = response.offset(query.offset)
        if (query.mode === 'byManager') response = response.where({id_user: query.managerId})
        return response
    }
    static async getCurrentClientQuery(id) {
        return db.select().table('clients').where({id}).first()
    }
    static async getClientsByCurrentUserQuery(req) {
        let response = db.select().table('clients').where({id_user: req.params.userId})
        if (req.query.sortby) response = response.orderBy('id', req.query.sortby)
        return response
    }
    static async countAllClientsQuery() {
        return db.count('* as quantity').table('clients').first()
    }
    static async countClientsByCurrentUserQuery(userId) {
        return db.count('* as quantity').table('clients')
                 .where({id_user: userId})
                 .first()
    }
    static async updateClientQuery(clientId, updData) {
        return db('clients').where({id: clientId}).update(updData).then(result => ({
            status: result === 1 ? true : false
        }))
    }
    static async createClientQuery(client) {
        // здесь [0] придется оставить так как в ответ приходит массив
        return db('clients').insert(client).then(result => ({newClientId: result[0]}))
    }
}

export default Clients