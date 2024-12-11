import { Router } from 'express';
import Controller from '../controllers/notes-controllers.js';
import { tokenVerificationMiddleware } from '../middleware/auth-middleware.js'

export default context => {
    const router = Router();
    const controller = Controller(context);

    router.route('/api/notes').get(tokenVerificationMiddleware, controller.getAllNotes)
                              .post(tokenVerificationMiddleware, controller.createNote);

    router.route('/api/notes/note-:noteId').get(tokenVerificationMiddleware, controller.getCurrentNote)
                                           .patch(tokenVerificationMiddleware, controller.updateNote)
                                           .delete(tokenVerificationMiddleware, controller.deleteNote);

    router.route('/api/notes/deal-:dealId').get(tokenVerificationMiddleware, controller.getNotesByCurrentDeal);

    return router
}