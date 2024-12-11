import { Router } from 'express';
import Controller from '../controllers/clients-controllers.js';
import { tokenVerificationMiddleware } from '../middleware/auth-middleware.js'

export default context => {
    const router = Router();
    const controller = Controller(context);

    router.route('/api/clients').get(tokenVerificationMiddleware, controller.getAllClients)
                                .post(tokenVerificationMiddleware, controller.createClient);

    router.route('/api/clients/client-:clientId').get(tokenVerificationMiddleware, controller.getCurrentClient)
                                                 .patch(tokenVerificationMiddleware, controller.updateClient)
                                                 .delete(tokenVerificationMiddleware, controller.deleteClient);

    router.route('/api/clients/user-:userId').get(tokenVerificationMiddleware, controller.getClientsByCurrentUser);

    router.route('/api/clients/user-:userId/count').get(tokenVerificationMiddleware, controller.countClientsByCurrentUser);

    router.route('/api/clients/total').get(tokenVerificationMiddleware, controller.countAllClients);

    return router
}