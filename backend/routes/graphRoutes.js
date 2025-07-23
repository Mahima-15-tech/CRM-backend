const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const GraphSchema = new mongoose.Schema({
  title: String,
  profile: String,
  size: String,
  type: String
});

const Graph = mongoose.model('Graph', GraphSchema);

// Add a graph
router.post('/', async (req, res) => {
  try {
    const graph = new Graph(req.body);
    await graph.save();
    res.status(201).json(graph);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all graphs
router.get('/', async (req, res) => {
  try {
    const graphs = await Graph.find();
    res.json(graphs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
