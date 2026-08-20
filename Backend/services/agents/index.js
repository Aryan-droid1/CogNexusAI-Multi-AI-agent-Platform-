import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
const result = dotenv.config({ path: "./.env" });
import router from './routes/agent.route.js';


const port = process.env.PORT
const app = express();

app.use(express.json());
app.use('/', router)

app.use((err, req, res, next) => {
  console.log(err)
  if (err.status) {
    return res.status(err.status).json(err.data)
  }
  return res.status(500).json({
    message: `agent error ${error}`,
  });
})


app.listen(port, () => {
  console.log(`agent server is started on port  ${port}`)
  connectDB();
})