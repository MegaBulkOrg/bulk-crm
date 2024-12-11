import { Router } from 'express';
import Controller from '../controllers/files-controllers.js';
import { tokenVerificationMiddleware } from '../middleware/auth-middleware.js'

export default context => {
    const router = Router();
    const controller = Controller(context);

    router.route('/api/files/upload-single-photo').post(tokenVerificationMiddleware, controller.uploadSinglePhoto)
    
    // тут не используется token так как ручка используется в атрибутах src тегов img 
    router.route('/api/files/get-img/:folder/:filename').get(controller.getImg)

    return router
}