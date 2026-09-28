const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

router.post('/auth/register', c.register);
router.post('/auth/login', c.login);
router.get('/auth/me', requireAuth, c.me);
router.put('/auth/change-password', requireAuth, c.changePassword);

router.get('/users', requireAuth, requireAdmin, c.listUsers);
router.patch('/users/:id/status', requireAuth, requireAdmin, c.setUserStatus);

module.exports = router;
