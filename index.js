const express=require("express");
const app=express();
const mongoose=require("mongoose");
const dotenv=require("dotenv");
const helmet=require("helmet");
const morgan=require("morgan");
const userRoute=require("./route/users")
const authRoute=require("./route/auth")
const postRoute=require("./route/posts")
const PORT=process.env.PORT || 8800


dotenv.config();
mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1.27017");

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/api/users",userRoute);
app.use("/api/auth",authRoute);
app.use("/api/posts",postRoute);




app.listen(PORT,()=>{
    console.log("backend server is running");
})