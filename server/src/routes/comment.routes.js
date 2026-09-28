const router = require('express').Router();
const c = require('../controllers/comment.controller');
const { requireAuth } = require('../middlewares/auth');
const { requireProjectRole } = require('../middlewares/projectAccess');
const { attachTaskProject, attachCommentProject } = require('../middlewares/taskAccess');

router.get('/tasks/:id/comments', requireAuth, attachTaskProject('member'), c.list);
router.post('/tasks/:id/comments', requireAuth, attachTaskProject('member'), c.create);

router.put('/comments/:id', requireAuth, attachCommentProject('member'), c.update);
router.delete('/comments/:id', requireAuth, attachCommentProject('member'), c.remove);

router.get('/projects/:id/stats', requireAuth, requireProjectRole('member'), c.stats);

module.exports = router;
