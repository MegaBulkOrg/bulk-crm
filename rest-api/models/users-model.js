import knex from 'knex';
import db_config from '../db_config.js';

const db = knex(db_config);

class Users {
    static async getAllUsersQuery(query) {
        let response = db.select().table('users')
        if (query.homepage === 'true') {
            response = response.where({job: 1}).orderBy('id', 'desc').limit(8)
        } else {
            if (query.sortby) response = response.orderBy('id', query.sortby)
            if (query.limit) response = response.limit(query.limit)
            if (query.offset) response = response.offset(query.offset)
        }
        return response
    }
    static async getCurrentUserQuery(id) {
        return db.select().table('users').where({id}).first()
    }
    static async countAllUsersQuery() {
        return db.count('* as quantity').table('users').first()
    }
    static async userExistenceCheckQuery(email) {
        return db.count('id as quantity').table('users').where({email}).first()
    }
    static async updateUserQuery(userId, updData) {
        return db('users').where({id: userId}).update(updData).then(result => ({
            status: result === 1 ? true : false
        }))
    }
    static async createUserQuery(user) {
        // здесь [0] придется оставить так как в ответ приходит массив
        return db('users').insert(user).then(result => ({newUserId: result[0]}))
    }
}

export default Users