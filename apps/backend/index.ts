import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { middleware } from './middleware';
import {prisma} from 'db';
const app = express();
app.use(cors());
app.use(express.json());

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



app.post("/buy",middleware,async(req,res)=>{   
  
  console.log('Buy endpoint hit, body:', req.body ?? {});
  const responseBody = { message: "Buy success" };
  console.log('Responding with:', responseBody);
  res.json(responseBody);
})

app.post("/sell",middleware,async(req,res)=>{

})

app.post("/split",middleware,async(req,res)=>{

})

app.post("/merge",middleware,async(req,res)=>{

})

app.get("/positions",middleware,async(req,res)=>{

})

app.get("/balances",middleware,async(req,res)=>{

})

app.get("/history",middleware,async(req,res)=>{

})

