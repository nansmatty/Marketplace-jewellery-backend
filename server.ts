require('dotenv').config();
import { app } from './app';
import connectDB from './config/db';

connectDB();

app.listen(process.env.PORT, () => console.log(`Server is connected with port ${process.env.PORT}`));
