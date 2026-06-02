import { z } from 'zod';

export const createUserSchema = z.object({
    marketId : z.string(),
    side: z.enum(['yes','no']),
    type: z.enum(['buy','sell']),
    price: z.int(),
    qty: z.int(),
});

export type orderBook = {[key:string]:{
    avaliableQty:number,
    orders:{userId:string,qty:number,filedQty:number,originalOrderId:string}[]
}};