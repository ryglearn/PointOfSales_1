import express from 'express'
import dotenv from 'dotenv/config'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'

const app = express();
const port = process.env.LISTEN_PORT ||3000;

app.use(cors());


app.use(express.json());
    
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes);  
app.use('/api/customers', customerRoutes);  
app.use('/api/categories', categoryRoutes);  
app.use('/api/products', productRoutes);  
app.use('/api/transactions', transactionRoutes);  

app.get('/', (req,res)=>{
    return res.status(200).json({succes: true, message: "Gunakan Prefix -> /api/{resource}/ "})
});

app.listen(port, ()=>{
    console.log("server up and running at " + port)
});