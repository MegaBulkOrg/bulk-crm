import knex from 'knex';
import db_config from '../db_config.js';

const db = knex(db_config);

class Directories {
    static async getAllRolesQuery() {
        return db.select().table('directory_roles')
    }
    static async getAllJobsQuery() {
        return db.select().table('directory_jobs')
    }
    static async getAllClientsTypesQuery() {
        return db.select().table('directory_clients_types')
    }
    static async getAllClientsContactPersonsContactTypesQuery() {
        return db.select().table('directory_clients_contact_persons_contact_types')
    }
    static async getAllCurrenciesQuery() {
        return db.select().table('directory_currencies')
    }    
    static async getAllDealsStatusesQuery() {
        return db.select().table('directory_deals_statuses')
    }
    static async getAllManagersQuery() {
        return db.select().table('users').where({role: 1})
    }
    static async getCurrentRoleQuery(id) {
        return db.select().table('directory_roles').where({id}).first()
    }
    static async getCurrentJobQuery(id) {
        return db.select().table('directory_jobs').where({id}).first()
    }
    static async getCurrentClientTypeQuery(id) {
        return db.select().table('directory_clients_types').where({id}).first()
    }
    static async getCurrentClientsContactPersonsContactTypeQuery(id) {
        return db.select().table('directory_clients_contact_persons_contact_types').where({id}).first()
    }
    static async getCurrentCurrencyQuery(id) {
        return db.select().table('directory_currencies').where({id}).first()
    }
    static async getCurrentDealsStatusQuery(id) {
        return db.select().table('directory_deals_statuses').where({id}).first()
    }
    static async getCurrentManagerQuery(id) {
        return db.select().table('users').where({id}).first()
    }
}

export default Directories