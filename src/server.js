import cors from 'cors';
import express from 'express';
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
app.use(
  cors({
    origin: 'http://localhost:50000/',
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  res.header('Access-Control-Allow-Origin', 'http://localhost:50000/');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});
app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static('assets'));
app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);
app.use('/api', apiRouter);

export default app;
