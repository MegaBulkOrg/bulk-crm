import knex from 'knex';
import db_config from '../db_config.js';

const db = knex(db_config);

class Notes {
    static async getAllNotesQuery(query) {    
        let response = query.mode === 'byManager'
            // соединение таблиц нужно делать именно так чтобы не перезаписались поля из notes
            ? db.select().table('clients').join('deals', 'clients.id', 'deals.id_client').join('notes', 'deals.id', 'notes.id_deal').where({id_user: query.managerId})
            : db.select().table('notes')
        if (query.sortby) response = response.orderBy('notes.id', query.sortby)
        if (query.limit) response = response.limit(query.limit)
        return response
    }
    static async getCurrentNoteQuery(id) {
        return db.select().table('notes').where({id}).first()
    }
    static async getNotesByCurrentDealQuery(req) {
        let response = db.select().table('notes').where({id_deal: req.params.dealId})
        if (req.query.sortby) response = response.orderBy('id', req.query.sortby)
        return response
    }
    static async updateNoteQuery(noteId, updData) {
        return db('notes').where({id: noteId}).update(updData).then(result => ({
            status: result === 1 ? true : false
        }))
    }
    static async createNoteQuery(note) {
        // здесь [0] придется оставить так как в ответ приходит массив
        return db('notes').insert(note).then(result => ({newNoteId: result[0]}))
    }
}

export default Notes