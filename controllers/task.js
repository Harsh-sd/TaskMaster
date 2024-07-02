const Task=require("../models/task");
const user=require("../models/User");
// Get all tasks for the authenticated user


exports.gettask = async (req, res) => {
    try {
        // Ensure user is authenticated
       

        // Fetch tasks for the authenticated user
        const tasks = await Task.find({ user: req.session.user._id });

        // Render the tasks index page with the fetched tasks
        res.render('tasks/index', { tasks });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
};


// Render form to create a new task
exports.newtask = (req, res) => {
    res.render('tasks/new');
};

// Create a new task
exports.createtask = async (req, res) => {
   
    try {
        if(!req.session.isLoggedIn){ 
            req.flash("error" ,"Login the user before creating the tasks.");
            res.redirect("/login");
        }
        const  title= req.body.title;
        const description=req.body.description;
        const dueDate=req.body.dueDate;
        const file=req.file;
        if(!req.file){
            req.flash("error" , "file is not attached.please try again")
        }
        if (!title || !description) {
            req.flash("error", "Title and description are required");
            return res.status(400).redirect("/tasks/new");
        }
        const newTask = new Task({
            title:title,
            description:description,
            user: req.session.user._id,
            dueDate:dueDate,
            file:req.file.path
        });
        await newTask.save();
        req.flash("success" , "Task has been created successfully");
        console.log('Task created successfully, setting flash message: Task has been created successfully');
        res.redirect('/tasks');
    }
     catch (err) {
        req.flash("error" , "Failed to create task, Please try again");
        res.status(500).json({ message: 'Error creating task' });
        res.redirect("/tasks/new");
    }
};

// Render form to edit a task
exports.getedittask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.session.user._id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.render('tasks/edit', { task });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching task' });
    }
};

// Update a task


exports.edittask = async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.session.isLoggedIn) {
            req.flash("error", "Login the user before editing the tasks.");
            return res.redirect("/login");
        }

        const { title, description, completed  , dueDate} = req.body;
        const file=req.file;

        // Validate title and description
        if (!title || !description) {
            req.flash('error', 'Title and description fields cannot be empty');
            return res.status(400).redirect(`/tasks/${req.params.id}/edit`);
        }
        if(!req.file){
            req.flash("error" , "file is not attached.please try again")
        }
        // Update the task
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.session.user._id },
            { title, description, completed: completed === 'on' , dueDate , file:req.file.path },
            { new: true }
        );

        if (!task) {
            req.flash('error', 'Task not found');
            return res.status(404).redirect('/tasks');
        }

        req.flash('success', 'Task updated successfully');
        res.redirect('/tasks');

    } catch (err) {
        console.error('Error updating task:', err);
        req.flash('error', 'Error updating task');
        res.status(500).redirect('/tasks');
    }
};



// Delete a task
exports.deletetask = async (req, res) => {
    try {
        if(!req.session.isLoggedIn){
            req.flash("error" ,"Login the user before delete the existing the tasks.");
           return  res.redirect("/login");
        }
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.session.user._id });
        if (!task) {
            req.flash('error', 'Task not found');
            return res.status(404).redirect('/tasks');
        }
        req.flash('success', 'Task deleted successfully');
        res.redirect('/tasks');
    
    
} catch (err) {
        req.flash('error', 'Error deleting task');
        res.status(500).redirect('/tasks');
    }
};

