const { Router } = require('express');

const router = Router();

router.get('/', (_request, response) => {
  response.json({ status: 'ok', service: 'mecafind-api' });
});

module.exports = router;
