const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with correct database name
const mongoURI = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB...');

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✓ MongoDB Connected Successfully');
  })
  .catch(err => {
    console.error('✗ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Define Schema and specify the collection name
const quoteSchema = new mongoose.Schema({
  _id: String,  // Keep this simple - MongoDB handles the indexing
  author: String,
  content: String,
  tags: [String],
  authorSlug: String,
  length: Number,
  dateAdded: Date,
  dateModified: Date
}, { collection: 'quotes-table' });  // Specify the correct collection name

const Quote = mongoose.model('Quote', quoteSchema);

// Test route to check all quotes
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await Quote.find({});
    console.log(`Found ${quotes.length} total quotes`);
    res.json(quotes);
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ message: err.message });
  }
});

// Quotes by tag route with case-insensitive search
app.get('/api/quotes/tags/:tag', async (req, res) => {
  const searchTag = req.params.tag;
  console.log('Searching for tag:', searchTag);
  
  try {
    // First, let's see what unique tag variations exist
    const allQuotes = await Quote.find({});
    const uniqueTags = new Set();
    allQuotes.forEach(quote => {
      quote.tags.forEach(tag => uniqueTags.add(tag));
    });
    console.log('Existing tag variations:', Array.from(uniqueTags));

    // Now perform the case-insensitive search
    const quotes = await Quote.find({ 
      tags: { 
        $regex: new RegExp(searchTag, 'i') 
      } 
    });
    
    console.log(`Found ${quotes.length} quotes with tag ${searchTag}`);
    console.log('Matching tags from results:', quotes.map(q => q.tags).flat());
    
    res.json(quotes);
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ message: err.message });
  }
});

// Optional route to normalize tags (you can remove this after running it once)
app.get('/api/normalize-tags', async (req, res) => {
  try {
    const quotes = await Quote.find({});
    let updateCount = 0;
    
    for (let quote of quotes) {
      const normalizedTags = quote.tags.map(tag => 
        tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()
      );
      
      // Only update if tags have changed
      if (JSON.stringify(normalizedTags) !== JSON.stringify(quote.tags)) {
        quote.tags = normalizedTags;
        await quote.save();
        updateCount++;
      }
    }
    
    res.json({ 
      message: 'Tags normalization complete', 
      updatedQuotes: updateCount 
    });
  } catch (err) {
    console.error('Error normalizing tags:', err);
    res.status(500).json({ message: err.message });
  }
});

// Route to get all unique tags
app.get('/api/tags', async (req, res) => {
  try {
    const quotes = await Quote.find({});
    const uniqueTags = new Set();
    quotes.forEach(quote => {
      quote.tags.forEach(tag => uniqueTags.add(tag));
    });
    const sortedTags = Array.from(uniqueTags).sort();
    res.json(sortedTags);
  } catch (err) {
    console.error('Error fetching tags:', err);
    res.status(500).json({ message: err.message });
  }
});
app.post('/api/quotes', async (req, res) => {
	try {
    const newQuote = new Quote(req.body);
    await newQuote.save();
    res.status(201).json(newQuote);
  } catch (err) {
    console.error('Error adding quote:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add this to your server code
app.delete('/api/quotes/:id', async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    res.json({ message: 'Quote deleted successfully' });
  } catch (err) {
    console.error('Error deleting quote:', err);
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`  Try accessing http://localhost:${PORT}/api/quotes to see all quotes`);
});