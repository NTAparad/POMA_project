const router = require('express').Router();
const c = require('../controllers/task.controller');
const { requireAuth } = require('../middlewares/auth');
const { requireProjectRole } = require('../middlewares/projectAccess');
const { attachTaskProject } = require('../middlewares/taskAccess');

// Đường dẫn lồng trong dự án
router.get('/projects/:projectId/tasks', requireAuth, requireProjectRole('member'), c.list);
router.post('/projects/:projectId/tasks', requireAuth, requireProjectRole('manager'), c.create);

// Đường dẫn theo công việc: xác định dự án từ task rồi mới kiểm tra quyền
router.get('/tasks/:id', requireAuth, attachTaskProject('member'), c.detail);
router.put('/tasks/:id', requireAuth, attachTaskProject('manager'), c.update);
router.patch('/tasks/:id/status', requireAuth, attachTaskProject('member'), c.updateStatus);
router.delete('/tasks/:id', requireAuth, attachTaskProject('manager'), c.remove);

module.exports = router;
