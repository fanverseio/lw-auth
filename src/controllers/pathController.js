const PathModel = require("../models/pathModel");

const getAllPaths = async (req, res) => {
  try {
    const paths = await PathModel.getAllPaths();
    res.status(200).json(paths);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching paths, error [getAllPaths]" });
  }
};

const getPathById = async (req, res) => {
  try {
    const { id } = req.params;
    const path = await PathModel.findById(id);

    if (!path) {
      return res.status(404).json({ message: "Path not found" });
    }
    res.status(200).json(path);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching path, error [getPathById]" });
  }
};

const createPath = async (req, res) => {
  try {
    const userId = req.user.id;
    const pathDetails = { ...req.body, userId };
    const newPath = await PathModel.createPath(pathDetails);
    res.status(201).json(newPath);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating path, error [createPath]" });
  }
};

const updatePath = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPath = await PathModel.updatePath(id, req.body);
    if (!updatedPath) {
      return res
        .status(404)
        .json({ message: "Path not found, error [updatePath]" });
    }
    res.status(200).json(updatedPath);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating path, error [updatePath]" });
  }
};

const deletePath = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPath = await PathModel.deletePath(id);

    if (!deletedPath) {
      return res
        .status(404)
        .json({ message: "Path not found, error [deletePath]" });
    }

    res
      .status(200)
      .json({ message: "Path deleted successfully", path: deletedPath });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting path, error [deletePath]" });
  }
};

const getPathData = async (req, res) => {
  try {
    const { id } = req.params;
    const pathData = await PathModel.getPathData(id);

    if (!pathData) {
      return res.status(404).json({ message: "Path data not found" });
    }

    res.status(200).json({
      nodes: JSON.parse(pathData.nodes || "[]"),
      edges: JSON.parse(pathData.edges || "[]"),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching path data" });
  }
};

const updatePathData = async (req, res) => {
  try {
    const { id } = req.params;
    const { nodes, edges } = req.body;

    const updatedPathData = await PathModel.updatePathData(id, nodes, edges);
    res.status(200).json(updatedPathData);
  } catch (error) {
    res.status(500).json({ message: "Error updating path data" });
  }
};

module.exports = {
  getAllPaths,
  getPathById,
  createPath,
  updatePath,
  deletePath,
  getPathData,
  updatePathData,
};
