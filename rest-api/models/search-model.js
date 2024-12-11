import knex from 'knex';
import db_config from '../db_config.js';

const db = knex(db_config);

class Search {
    static async getSearchResultsQuery(query, sortDir) {
        const usersQuery = db('users')
            .select(db.raw("'users' AS item_type"), 'id', 'name', 'description')
            .where('email', 'LIKE', `%${query}%`)
            .orWhere('name', 'LIKE', `%${query}%`)
            .orWhere('phone', 'LIKE', `%${query}%`)
            .orWhere('address', 'LIKE', `%${query}%`)
            .orWhere('birthdate', 'LIKE', `%${query}%`)
            .orWhere('description', 'LIKE', `%${query}%`);
        const clientsQuery = db('clients')
            .select(db.raw("'clients' AS item_type"), 'id', 'title', 'description')
            .where('title', 'LIKE', `%${query}%`)
            .orWhere('description', 'LIKE', `%${query}%`)
            .orWhere('phone', 'LIKE', `%${query}%`)
            .orWhere('email', 'LIKE', `%${query}%`)
            .orWhere('address', 'LIKE', `%${query}%`)
            .orWhere('lead_date', 'LIKE', `%${query}%`)
            .orWhere('contact_person_name', 'LIKE', `%${query}%`)
            .orWhere('contact_person_contact_value', 'LIKE', `%${query}%`);
        const dealsQuery = db('deals')
            .select(db.raw("'deals' AS item_type"), 'id', 'title', 'description')
            .where('title', 'LIKE', `%${query}%`)
            .orWhere('description', 'LIKE', `%${query}%`)
            .orWhere('sum', 'LIKE', `%${query}%`)
            .orWhere('beginning_date', 'LIKE', `%${query}%`)
            .orWhere('completion_date', 'LIKE', `%${query}%`);
        const notesQuery = db('notes')
            .select(db.raw("'notes' AS item_type"), 'id', 'title', 'content')
            .where('title', 'LIKE', `%${query}%`)
            .orWhere('content', 'LIKE', `%${query}%`)
            .orWhere('creation_date', 'LIKE', `%${query}%`);
        // true для удаления дубликатов
        return db.unionAll([usersQuery, clientsQuery, dealsQuery, notesQuery], true)   
                 .orderBy('id', sortDir).limit(1000000)
    }
    static async relationClientToManagerCheck(clientId, managerId) {
        const client = await db.select().table('clients').where({id: clientId}).first()        
        return client.id_user === managerId
    }
    static async relationDealToManagerCheck(dealId, managerId) {
        const result = await db.select().table('deals')
                                        .join('clients', 'deals.id_client', '=', 'clients.id')
                                        .where({'deals.id': dealId}).first()           
        return result.id_user === managerId
    }
    static async relationNoteToManagerCheck(noteId, managerId) {
        const result = await db.select().table('notes')
                                        .join('deals', 'notes.id_deal', '=', 'deals.id')
                                        .join('clients', 'deals.id_client', '=', 'clients.id')
                                        .where({'notes.id': noteId}).first()           
        return result.id_user === managerId
    }
}

export default Search