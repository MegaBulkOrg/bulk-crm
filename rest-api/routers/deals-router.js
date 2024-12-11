import { Router } from 'express';
import Controller from '../controllers/deals-controllers.js';
import { tokenVerificationMiddleware } from '../middleware/auth-middleware.js'

export default context => {
    const router = Router();
    const controller = Controller(context);

    router.route('/api/deals').get(tokenVerificationMiddleware, controller.getAllDeals)
                              .post(tokenVerificationMiddleware, controller.createDeal);

    router.route('/api/deals/deal-:dealId').get(tokenVerificationMiddleware, controller.getCurrentDeal)
                                           .patch(tokenVerificationMiddleware, controller.updateDeal)
                                           .delete(tokenVerificationMiddleware, controller.deleteDeal);

    router.route('/api/deals/user-:userId').get(tokenVerificationMiddleware, controller.getDealsByCurrentUser);

    router.route('/api/deals/client-:clientId').get(tokenVerificationMiddleware, controller.getDealsByCurrentClient);

    router.route('/api/deals/total').get(tokenVerificationMiddleware, controller.countAllDeals);

    router.route('/api/deals/count-inwork').get(tokenVerificationMiddleware, controller.сountDealsInWork);

    router.route('/api/deals/count-done').get(tokenVerificationMiddleware, controller.сountDealsDone);

    router.route('/api/deals/count-inwork-by-user').get(tokenVerificationMiddleware, controller.сountDealsInWorkByCurrentUser);

    router.route('/api/deals/count-done-by-user').get(tokenVerificationMiddleware, controller.сountDealsDoneByCurrentUser);

    router.route('/api/deals/count-failed-by-user').get(tokenVerificationMiddleware, controller.сountDealsFailedByCurrentUser);

    return router
}