const express = require("express");
 const app = express();
 const jwt=require("jsonwebtoken")
 
 const cors=require("cors");
 const bcrypt=require("bcrypt");
 const mdb = require("mongoose");
 const dotenv = require("dotenv");
 const Signup = require("./models/SignupScheme.js");
 const SectionModel = require("./models/SectionModel.js");
 const mongoose = require("mongoose");
 
 app.use(cors())
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
 
 const port = process.env.PORT || 3000;
 dotenv.config();
 console.log(process.env.MONGODB_URL);
 mdb
   .connect(process.env.MONGODB_URL)
   .then(() => {
     console.log("MongoDB CONECTED");
   })
   .catch((err) => {
     console.log("Check your connection String", err);
   });
   const commentSchema = new mongoose.Schema({
     task: String,
     comment: String,
     createdAt: { type: Date, default: Date.now }
   });
 
   const Comment = mongoose.model("Comment", commentSchema);
 
 
   app.post("/signup",async(req,res)=>{
     try{
         const {firstName,lastName,email,password,phoneNumber}=req.body;
         console.log(firstName);
         console.log(lastName);
         console.log(email);
         console.log(password);
         console.log(phoneNumber);
         const existingUser = await Signup.findOne({ email });
         if (existingUser) {
             return res.status(409).json({ message: "User already exists. Please log in." });
         }
         const hashedPassword = await bcrypt.hash(password,10);
         const newSignup=new Signup({
             firstName,
             lastName,
             email,
             password:hashedPassword,  
             phoneNumber
         });
         await newSignup.save();
         console.log("User saved:", newSignup);
         res.status(201).json({message:"Signup Successfulll",isSignup:true});
 
         console.log("Signup Successefull");
     }catch(e){
         console.log(e);
     }
   });
 
   app.post("/Login", async (req, res) => {
     try {
         const { email, password } = req.body;
         const user = await Signup.findOne({ email });
 
         if (!user) {
             return res.status(404).json({ message: "User not found", isLogin: false });
         }
 
         const validPassword = await bcrypt.compare(password, user.password);
         console.log(validPassword);
 
         if (!validPassword) {
             return res.status(401).json({ message: "Invalid Password", isLogin: false });
         }
 
         // Generate JWT token
         const token = jwt.sign(
             { userId: user._id },
             process.env.JWT_SECRET,
             { expiresIn: '24h' }
         );
 
         console.log("Login Successful");
         res.status(200).json({ 
             message: "Login Successful", 
             isLogin: true,
             token: token 
         });
     } catch (error) {
         console.error("Login Error:", error);
         res.status(500).json({ message: "Error", isLogin: false });
     }
 }); 
 // Add this middleware function to your server.js file
 function authenticateUser(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1];
 
     if (!token) {
       return res.status(401).json({ error: 'No token provided' });
     }
 
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.userId = decoded.userId;
       next();
     } catch (error) {
       return res.status(401).json({ error: 'Invalid token' });
     }
   }
 // Profile endpoint
 
 app.get('/profile', authenticateUser, async (req, res) => {
     try {
       // Use Signup model instead of User since that's what you defined
       
       const user = await Signup.findById(req.userId).select('-password');
 
       if (!user) {
         return res.status(404).json({ error: 'User not found' });
       }
 
       res.status(200).json({
         firstName: user.firstName,
         lastName: user.lastName,
         email: user.email,
         phoneNumber: user.phoneNumber
       });
     } catch (error) {
       console.error('Error fetching user profile:', error);
       res.status(500).json({ error: 'Server error' });
     }
 });
 app.get("/getTasks", async (req, res) => {
     try {
       const {userEmail} =req.query;
       const tasks = await Task.find({ userEmail });      
         // Organize tasks into their respective sections
         const sectionData = {
             TODO: [],
             Completed: [],
             BackLogs: [],
         };
         console.log(tasks)
         tasks.forEach(task => {
             if (sectionData[task.section]) {
                 // Send the full task object instead of just the task string
                 sectionData[task.section].push({
                     name: task.task,
                     due: task.due ? new Date(task.due).toISOString().split('T')[0] : null, description: task.description || ""
                 });
             }
         });
 
         res.json(sectionData);
     } catch (error) {
         console.error("Error fetching tasks:", error);
         res.status(500).json({ error: "Internal Server Error" });
     }
 });
 app.get('/searchTasks', async (req, res) => {
   try {
     const { term, userEmail } = req.query;
     
     if (!term || !userEmail) {
       return res.status(400).json({ error: 'Search term and user email are required' });
     }
     
     const sections = ['TODO', 'Completed', 'BackLogs'];
     let allResults = [];
     
     for (const section of sections) {
       const tasks = await Task.find({
         userEmail: userEmail,
         section: section,
         name: { $regex: term, $options: 'i' } // Case-insensitive search
       });
       
       const tasksWithSection = tasks.map(task => ({
         ...task._doc,
         section
       }));
       
       allResults = [...allResults, ...tasksWithSection];
     }
     
     res.json({ tasks: allResults });
   } catch (error) {
     console.error('Error searching tasks:', error);
     res.status(500).json({ error: 'Server error' });
   }
 });
 
 
 app.delete("/deleteTask", async (req, res) => {
   const { task } = req.body;
 
   try {
       const deletedTask = await Task.findOneAndDelete({ task });
 
       if (!deletedTask) {
           return res.status(404).json({ error: "Task not found" });
       }
 
       res.json({ message: "Task deleted successfully" });
   } catch (error) {
       res.status(500).json({ error: "Error deleting task" });
   }
 });
 
 // Route to add a comment
 app.post("/addComment", async (req, res) => {
     const { task, comment } = req.body;
 
     if (!task || !comment) {
       return res.status(400).json({ error: "Task and comment are required" });
     }
 
     try {
       const newComment = new Comment({ task, comment });
       await newComment.save();
       res.json({ message: "Comment added successfully" });
     } catch (error) {
       console.error("Error adding comment:", error);
       res.status(500).json({ error: "Internal Server Error" });
     }
   });
 
 app.get("/getComments", async (req, res) => {
     const { task } = req.query;
 
     if (!task) {
       return res.status(400).json({ error: "Task parameter is required" });
     }
 
     try {
       const taskComments = await Comment.find({ task }).sort({ createdAt: 1 });
       res.json({ 
         comments: taskComments.map(comment => comment.comment)
       });
     } catch (error) {
       console.error("Error fetching comments:", error);
       res.status(500).json({ error: "Internal Server Error" });
     }
   });
 
 
 
 const taskSchema = new mongoose.Schema({
   task: String,
   due:Date,
   description: String,
   section: { type: String, enum: ["TODO", "Completed", "BackLogs"], default: "TODO" },
   userEmail:String  
 });
 
 const Task = mongoose.model("Task", taskSchema);
 
 
 app.put("/updateTask", async (req, res) => {
   const { task, fromSection, toSection } = req.body;
 
   if (!task || !fromSection || !toSection) {
       return res.status(400).json({ error: "Missing required fields" });
   }
 
   try {
       const updatedTask = await Task.findOneAndUpdate(
           { task: task, section: fromSection },  // Ensure we find the correct task
           { section: toSection },  // Update only the section
           { task: task, section: fromSection },  
           { section: toSection },  
           { new: true }
       );
 
       if (!updatedTask) {
           return res.status(404).json({ error: "Task not found" });
       }
 
       res.json({ message: "Task updated successfully", updatedTask });
   } catch (error) {
       console.error("Database update failed:", error);
       res.status(500).json({ error: "Database update failed" });
   }
 });
 
 
 
 app.post("/addTask", async (req, res) => {
   const { task,due,description, section,userEmail } = req.body;
 
   if (!task || !section) {
       return res.status(400).json({ error: "Task and section are required" });
   }
 
   try {
       const newTask = new Task({ task,due,description,section,userEmail});
       await newTask.save();
       res.json({ message: "Task added successfully", task: newTask });
   } catch (error) {
       console.error("Error saving task:", error);
       res.status(500).json({ error: "Internal Server Error" });
   }
 });
 
 app.put("/editTask", async (req, res) => {
     const { oldTask, newTask, due,description,section } = req.body;
 
     try {
       const updatedTask = await Task.findOneAndUpdate(
         { task: oldTask, section: section,description: description },
         { $set: { task: newTask, due: due } },
         { new: true }
       );
 
       if (!updatedTask) {
         return res.status(404).json({ error: "Task not found" });
       }
 
       // Also update the task name in the comments collection
       if (oldTask !== newTask) {
         await Comment.updateMany(
           { task: oldTask },
           { $set: { task: newTask } }
         );
       }
 
       res.json({ success: true, updatedTask });
     } catch (error) {
       console.error("Error updating task:", error);
       res.status(500).json({ error: "Error updating task" });
     }
   });
 
 
 app.get("/", (req, res) => {
     res.send("WELCOME");
 });
 
 app.listen(port, () => {
     console.log(`server is running on port ${port}`);
     });