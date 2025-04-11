const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 5000;
const jwt=require("jsonwebtoken")
// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/blogsDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// Mongoose Schema & Model
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
  }, { timestamps: true });
  
  const Blog = mongoose.model('Blog', blogSchema);

  // GET all blogs
app.get('/blogs', async (req, res) => {
    try {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      res.json(blogs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch blogs' });
    }
  });
  
  // POST create a new blog
  app.post('/blogs', async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
  
    try {
      const newBlog = new Blog({ title, content });
      await newBlog.save();
      res.status(201).json(newBlog);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create blog' });
    }
  });
  
  // PUT update a blog
  app.put('/blogs/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
  
    try {
      const updated = await Blog.findByIdAndUpdate(
        id,
        { title, content },
        { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ error: 'Blog not found' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update blog' });
    }
  });
  
  // DELETE a blog
  app.delete('/blogs/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deleted = await Blog.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Blog not found' });
      res.json({ message: 'Blog deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete blog' });
    }
  });
  //search the blog
  app.get('/search',async (req,res)=>{
    try {
        const { title } = req.query;
    
        if (!title) {
          return res.status(400).json({ error: 'Title query param is required' });
        }
    
        // Case-insensitive partial match using RegExp
        const blogs = await Blog.find({
          title: { $regex: title, $options: 'i' },
        });
    
        res.json(blogs);
      } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Server error while searching blogs' });
      }
  })
  // Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));