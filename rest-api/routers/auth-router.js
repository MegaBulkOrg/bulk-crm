import { Router } from 'express';
import Controller from '../controllers/auth-controllers.js';

export default context => {
    const router = Router();
    const controller = Controller(context);

    router.route('/api/auth/signin').post(controller.signin)

    router.route('/api/auth/signout').delete(controller.signout)

    router.route('/api/auth/refresh').get(controller.refresh)

    return router
}