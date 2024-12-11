import knex from 'knex';
import db_config from '../db_config.js';

const db = knex(db_config);

class Deals {
    static async getAllDealsQuery(query) {
        let response = query.mode === 'byManager'
            ? db.select().table('clients').join('deals', 'clients.id', '=', 'deals.id_client').where({id_user: query.managerId})
            : db.select().table('deals')
        if (query.sortby) response = response.orderBy('deals.id', query.sortby)
        if (query.limit) response = response.limit(query.limit)
        if (query.offset) response = response.offset(query.offset)
        return response
    }
    static async getCurrentDealQuery(id) {
        return db.select().table('deals').where({id}).first()
    }
    static async getDealsByCurrentUserQuery(req) {
        let response = db.select().table('clients')
	                  .join('deals', 'clients.id', '=', 'deals.id_client')
                      .where({'clients.id_user': req.params.userId})
        if (req.query.sortby) response = response.orderBy('clients.id', req.query.sortby)
        return response
    }
    static async getDealsByCurrentClientQuery(req) {
        let response = db.select().table('deals').where({id_client: req.params.clientId})
        if (req.query.sortby) response = response.orderBy('id', req.query.sortby)
        return response
    }
    static async countAllDealsQuery() {
        return db.count('* as quantity').table('deals').first()
    }
    static async countDealsByCurrentUserQuery(userId) {
        return db.count('* as quantity').table('deals')
                 .join('clients', 'deals.id_client', 'clients.id')
                 .where({id_user: userId})
                 .first()
    }
    static async сountDealsInWorkQuery(clientId) {
        return db.count('* as quantity').table('deals')
                 .where({id_client: clientId})
                 .whereIn('status', [1,2,3])
                 .first()
    }
    static async сountDealsDoneQuery(clientId) {
        return db.count('* as quantity').table('deals')
                 .where({
                    id_client: clientId,
                    status: 4
                 })
                 .first()
    }
    static async сountDealsInWorkByCurrentUserQuery(userId) {
        return db.count('* as quantity').table('clients')
                 .join('deals', 'clients.id', '=', 'deals.id_client')
                 .where({'clients.id_user': userId})
                 .whereIn('status', [1,2,3])
                 .first()
    }
    static async сountDealsDoneByCurrentUserQuery(userId) {
        return db.count('* as quantity').table('clients')
	             .join('deals', 'clients.id', '=', 'deals.id_client')
                 .where({
                    'clients.id_user': userId,
                    status: 4
                 })
                 .first()
    }
    static async сountDealsFailedByCurrentUserQuery(userId) {
        return db.count('* as quantity').table('clients')
                 .join('deals', 'clients.id', '=', 'deals.id_client')
                 .where({
                    'clients.id_user': userId,
                    status: 5
                 })
                 .first()
    }
    static async updateDealQuery(dealId, updData) {
        return db('deals').where({id: dealId}).update(updData).then(result => ({
            status: result === 1 ? true : false
        }))
    }
    static async createDealQuery(deal) {
        // здесь [0] придется оставить так как в ответ приходит массив
        return db('deals').insert(deal).then(result => ({newDealId: result[0]}))
    }
}

export default Deals