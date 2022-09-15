import express from 'express';
// import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import flash from 'express-flash';
import MongoStore from 'connect-mongo';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';
import apiRouter from './routers/apiRouter';
import { localsMiddleware } from './middlewares';

const app = express();
const logger = morgan('dev');
app.use(logger);

app.set('view engine', 'pug');
app.set('views', process.cwd() + '/src/views');

// app.use(
//   cors({
//     origin: 'http://localhost:50000',
//     credentials: true,
//   })
// );
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:50000');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, content-type, application/json'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.use(flash());
app.use(localsMiddleware);
app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static('assets'));
app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);
app.use('/api', apiRouter);

export default app;
