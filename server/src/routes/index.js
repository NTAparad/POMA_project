const router = require('express').Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'Poma API đang hoạt động' }));

router.use(require('./auth.routes'));
router.use(require('./project.routes'));
router.use(require('./task.routes'));
router.use(require('./comment.routes'));

module.exports = router;
