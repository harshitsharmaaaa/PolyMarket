import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { middleware } from './middleware';
import {prisma} from 'db';
import { createUserSchema, type orderBook } from './types';
import { uuid} from 'uuidv4';
const app = express();
app.use(cors());
app.use(express.json());

app.listen(3000, async() => {
  console.log('Server is running on port 3000');
});

app.post("/buy",middleware,async(req,res)=>{   
  const {success,data} = createUserSchema.safeParse(req.body);
  const userId :string = req.userId;
  if(!success){
    console.log('Error parsing request body:',data)
    return res.status(411).json({error:'Invalid request body'})
  }

  const originalOrderId = uuid();
 await prisma.$transaction(async tx => {
    const response = await tx.$queryRaw<{yesOrderBook:string,noOrderBook:string,id:string,totalQty:number}[]>`SELECT * FROM "Market" WHERE id=${data.marketId} FOR UPDATE`;
    const userResponse = await tx.$queryRaw<{id: string, address: string, usdBalance: number}[]>`SELECT * FROM "User" WHERE id=${userId} FOR UPDATE;`;    const market = response[0]; 
    const user = userResponse[0];
    if(!user){
      return; 
    }
    if(!market){
      return;
    }

    const yesOrderBook:orderBook = JSON.parse(market.yesOrderBook);
    const noOrderBook:orderBook = JSON.parse(market.noOrderBook);


    if(data.side === 'yes' && data.type === 'buy'){
      const usd = data.qty*data.price;
      if(user.usdBalance < usd){
        res.status(400).json({error:'Insufficient balance'})
        return;
      }
      else{
        user.usdBalance -= usd;
      }

      let leftQty = data.qty;
      const prices= Object.keys(yesOrderBook).sort((a:string,b:string)=>Number(a)-Number(b));


      await Promise.all(prices.map(async price=>{
        if(Number(price)<=data.price){
          return;
        }
        const {avaliableQty,orders} = yesOrderBook[price]!;

        await Promise.all(orders.map(async(order)=>{
          const matchQty = order.qty>=leftQty?leftQty:order.qty;
            await prisma.position.update({
              where:{
                userId_marketId_type:{
                  userId:user.id,
                  marketId:market.id,
                  type:'Yes'
                }
              },
              data:{
                qty:{
                  decrement:matchQty
                }
              }
            })
            await prisma.user.update({
              where:{
                id:user.id
              },
              data:{
                usdBalance:{
                  increment:matchQty*Number(price)
                }
              }
            })
            await prisma.position.update({
              where:{
                userId_marketId_type:{
                  userId,
                  marketId:market.id,
                  type:'Yes'
                }
              },
              data:{
                qty:{
                  increment:matchQty
                }
              }
            })

            await prisma.user.update({
              where:{
                id:userId
              },
              data:{
                usdBalance:{
                  decrement:matchQty*Number(price)
                }
              }
            })
            leftQty -= matchQty;
            order.filedQty+=matchQty;
            yesOrderBook[price]!.avaliableQty-=matchQty;
        }))
      }))

      if(!yesOrderBook[data.price]){
        yesOrderBook[data.price] = {
          avaliableQty:0,
          orders:[]
        }
      }
      yesOrderBook[data.price]!.avaliableQty+=leftQty;
      yesOrderBook[data.price]!.orders.push({
        qty:leftQty,
        userId,
        filedQty:0,
        originalOrderId
      })
    }

    if(data.side === 'yes' && data.type === 'sell'){
       
    }

    await tx.market.update({
      where:{
        id:data.marketId
      },
      data:{
        yesOrderBook:JSON.stringify(yesOrderBook),
        noOrderBook:JSON.stringify(noOrderBook)
      }
    })

    res.json({
      message:'updating orderbook'
    })
});

  
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

