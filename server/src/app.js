const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { uploadDirectory } = require('./middleware/upload');

const adminRouter = require('./routes/admin.routes');
const authRouter = require('./routes/auth.routes');
const healthRouter = require('./routes/health.routes');
const mechanicRouter = require('./routes/mechanic.routes');
const walletRouter = require('./routes/wallet.routes');
const { errorHandler, notFound } = require('./middleware/errors');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(uploadDirectory));
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/mechanics', mechanicRouter);
app.use('/api/usage', walletRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
