import { Router } from 'express';
import Controller from '../controllers/directories-controllers.js';
import { tokenVerificationMiddleware } from '../middleware/auth-middleware.js';

export default context => {
    const router = Router();
    const controller = Controller(context);

    router.route('/api/directories/roles').get(tokenVerificationMiddleware, controller.getAllRoles);

    router.route('/api/directories/jobs').get(tokenVerificationMiddleware, controller.getAllJobs);
    
    router.route('/api/directories/clients-types').get(tokenVerificationMiddleware, controller.getAllClientsTypes);
    
    router.route('/api/directories/clients-contact-persons-contact-types').get(tokenVerificationMiddleware, controller.getAllClientsContactPersonsContactTypes);

    router.route('/api/directories/currencies').get(tokenVerificationMiddleware, controller.getAllCurrencies);
    
    router.route('/api/directories/deals-statuses').get(tokenVerificationMiddleware, controller.getAllDealsStatuses);

    router.route('/api/directories/managers').get(tokenVerificationMiddleware, controller.getAllManagers);

    return router
}