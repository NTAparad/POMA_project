const router = require('express').Router();
const c = require('../controllers/project.controller');
const { requireAuth } = require('../middlewares/auth');
const { requireProjectRole } = require('../middlewares/projectAccess');

router.get('/projects', requireAuth, c.list);
router.post('/projects', requireAuth, c.create);

router.get('/projects/:id', requireAuth, requireProjectRole('member'), c.detail);
router.put('/projects/:id', requireAuth, requireProjectRole('manager'), c.update);
router.delete('/projects/:id', requireAuth, requireProjectRole('manager'), c.remove);

router.get('/projects/:id/members', requireAuth, requireProjectRole('member'), c.members);
router.post('/projects/:id/members', requireAuth, requireProjectRole('manager'), c.addMember);
router.delete('/projects/:id/members/:uid', requireAuth, requireProjectRole('manager'), c.removeMember);

module.exports = router;
