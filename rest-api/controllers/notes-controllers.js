export default ({
  models: { NotesModel }
}) => ({
  async getAllNotes (req, res) {
    NotesModel.getAllNotesQuery(req.query)
         .then(result => res.json(result))
         .catch(error => console.log('[api/notes]: ошибка получения данных - ', error.message))
  },

  async getCurrentNote (req, res) {
    NotesModel.getCurrentNoteQuery(req.params.noteId)
         .then(result => res.json(result))
         .catch(error => console.log('[api/notes/note-:noteId]: ошибка получения данных - ', error.message))
  },

  async getNotesByCurrentDeal (req, res) {
    NotesModel.getNotesByCurrentDealQuery(req)
         .then(result => res.json(result))
         .catch(error => console.log('[/api/notes/deal-:dealId]: ошибка получения данных - ', error.message))
  },

  async updateNote (req, res) {
    NotesModel.updateNoteQuery(req.params.noteId, req.body)
         .then(result => res.json(result))
         .catch(error => console.log('[api/notes/note-:noteId]: ошибка обновления данных - ', error.message))
  },

  async deleteNote (req, res) {

  },

  async createNote (req, res) {
    NotesModel.createNoteQuery(req.body)
         .then(result => res.json(result))
         .catch(error => console.log('[api/notes]: ошибка создания новой записи - ', error.message))
  }
})