import { Router } from 'express';
import Controller from '../controllers/search-controllers.js';
import { tokenVerificationMiddleware } from '../middleware/auth-middleware.js';

export default context => {
    const router = Router();
    const controller = Controller(context);

    router.route('/api/search').get(tokenVerificationMiddleware, controller.getSearchResults);

    return router
}