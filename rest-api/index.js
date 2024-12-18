import compression from 'compression';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import context from './context.js';
import clientsRouter from './routers/clients-router.js';
import dealsRouter from './routers/deals-router.js';
import notesRouter from './routers/notes-router.js';
import usersRouter from './routers/users-router.js';
import directoriesRouter from './routers/directories-router.js';
import authRouter from './routers/auth-router.js';
import filesRouter from './routers/files-router.js';
import searchRouter from './routers/search-router.js';
import 'dotenv/config'

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )
}

const host = process.argv[2] === 'dev' ? process.env.APP_DEV_HOST : process.env.APP_PROD_HOST
const port = process.argv[2] === 'dev' ? process.env.APP_DEV_PORT : process.env.APP_PROD_PORT

// origin и credentials указываются для работы с куками
// без этих параметров не будут работать запросы если в fetchBaseQuery (api redux указано credentials: 'include')
app.use(cors({
  origin: process.argv[2] === 'dev' ? `http://${host}:${process.env.APP_DEV_CLIENT_PORT}` : process.env.APP_PROD_DOMAIN,
  credentials: true
}));
app.use(cookieParser());
// по умолчанию express не парсит тело запроса и нужно использовать соответствующий
// middleware чтобы обрабатывать JSON или URL-кодированные данные
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(usersRouter(context));
app.use(clientsRouter(context));
app.use(dealsRouter(context));
app.use(notesRouter(context));
app.use(directoriesRouter(context));
app.use(authRouter(context));
app.use(filesRouter(context));
app.use(searchRouter(context));

app.listen(port, () => {
  process.argv[2] === 'dev'
    ? console.log(`[index.js]: приложение запустилось на http://${host}:${port}`)
    : console.log(`[index.js]: приложение запустилось на ${process.env.APP_PROD_DOMAIN}`)
});