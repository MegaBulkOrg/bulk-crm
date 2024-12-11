import { Router } from 'express';
import Controller from '../controllers/users-controllers.js';
import { tokenVerificationMiddleware } from '../middleware/auth-middleware.js';

export default context => {
    const router = Router();
    const controller = Controller(context);

    router.route('/api/users').get(tokenVerificationMiddleware, controller.getAllUsers)
                              .post(tokenVerificationMiddleware, controller.createUser);

    router.route('/api/users/user-:userId').get(tokenVerificationMiddleware, controller.getCurrentUser)
                                           .patch(tokenVerificationMiddleware, controller.updateUser)
                                           .delete(tokenVerificationMiddleware, controller.deleteUser);

    router.route('/api/users/existence-check').get(tokenVerificationMiddleware, controller.userExistenceCheck);

    router.route('/api/users/total').get(tokenVerificationMiddleware, controller.countAllUsers);

    return router
}