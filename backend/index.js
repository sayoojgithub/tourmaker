import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cron from "node-cron";
import authRoute from './Routes/auth.js'
import companyRoute from './Routes/company.js'
import frontofficeRoute from './Routes/frontoffice.js'
import executiveRoute from './Routes/executive.js'
import salesManagerRoute from './Routes/salesManager.js'
import purchaserRoute from './Routes/purchase.js'
import billingRoute from './Routes/billing.js'
import bookingRoute from './Routes/booking.js'
import customercareRoute from './Routes/customercare.js'
import entryRoute from './Routes/entry.js'
import Client from "./models/Client.js"

dotenv.config()

const app=express()
const port=process.env.PORT || 8000

const corsOption={
    origin:true 
}  

app.get('/',(req,res)=>{
    res.send('Api is working')
}) 
//database connection
const connectDB=async()=>{ 
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB database is connected');
    } catch (err) {
        console.log('MongoDB database connection failed');
    }
}


//middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOption));
app.use('/api/v1/auth',authRoute)
app.use('/api/v1/company',companyRoute)
app.use('/api/v1/frontoffice',frontofficeRoute)
app.use('/api/v1/executive',executiveRoute)
app.use('/api/v1/salesManager',salesManagerRoute)
app.use('/api/v1/purchaser',purchaserRoute)
app.use('/api/v1/billing',billingRoute)
app.use('/api/v1/booking',bookingRoute)
app.use('/api/v1/customercare',customercareRoute) 
app.use('/api/v1/entry',entryRoute)

// Function to update the ongoingStatus of clients
const updateOngoingStatus = async () => {
    try {
        // const today = new Date(); 
        // today.setHours(0, 0, 0, 0); // Normalize to 00:00 local time
        // const utcToday = new Date(today.toISOString()); // Convert to UTC for matching
        // const result = await Client.updateMany(
        //     {
        //         balance: 0,
        //         finalizedTourDateAt: {
        //             $gte: utcToday,
        //             $lt: new Date(utcToday.getTime() + 24 * 60 * 60 * 1000), // less than tomorrow
        //         },
        //         ongoingStatus: { $ne: true },
        //     },
        //     {
        //         $set: { ongoingStatus: true }
        //     }
        // ); 
        const now = new Date();
const utcStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000);
console.log(utcStart,utcEnd)    
const result = await Client.updateMany( 
    {
        balance: 0,
        finalizedTourDateAt: {
            $gte: utcStart,
            $lt: utcEnd,
        },
        ongoingStatus: { $ne: true }, 
    },
    {
        $set: { ongoingStatus: true }  
    }
); 

        console.log(`Updated ${result.modifiedCount} client(s) with ongoingStatus: true`);
    } catch (error) {
        console.error('Error updating ongoingStatus:', error);
    }
};
// Function to schedule clients for tomorrow
const updateCompletedStatus = async () => {
    try {
        const now = new Date();
        const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const utcStart = new Date(utcToday.getTime() - 24 * 60 * 60 * 1000); // yesterday
        const utcEnd = new Date(utcToday); // today

        const result = await Client.updateMany(
            {
                ongoingStatus: true,
                finalizedTourEndDateAt: {
                    $gte: utcStart,
                    $lt: utcEnd,
                },
                completedStatus: { $ne: true },
            },
            {
                $set: { completedStatus: true }
            }
        );

        console.log(`Updated ${result.modifiedCount} client(s): completedStatus -> false`);
    } catch (error) {
        console.error('Error updating completedStatus:', error);
    }
}; 
  

// Schedule the cron job to run every hour on the hour
cron.schedule('0 * * * *', () => {
    console.log('Running hourly cron job to check client ongoing status');
    updateOngoingStatus(); // Update client ongoingStatus every hour
    updateCompletedStatus();
});

// Immediately update ongoingStatus when the server starts
updateOngoingStatus();
updateCompletedStatus();


app.listen(port, () => {
    connectDB();
   console.log('server is running')
});                   