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

const togglePathVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;
    const userId = req.user.id;

    const updatedPath = await PathModel.updatePathVisibility(
      id,
      userId,
      isPublic
    );
    res.status(200).json({ success: true, path: updatedPath });
  } catch (error) {
    res.status(500).json({ message: "Error updating path visibility" });
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
const getPublicPaths = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const paths = await PathModel.getPublicPaths(
      parseInt(limit),
      parseInt(offset)
    );
    res.json({ success: true, paths });
  } catch (error) {
    res.status(500).json({ message: "Error fetching public paths" });
  }
};

const copyPublicPath = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    // copy details debugging
    console.log("Path id:", id);
    console.log("New title:", title);
    console.log("User id:", userId);
    console.log("Request body:", req.body);
    console.log("Request user:", req.user);

    const copiedPath = await PathModel.copyPath(id, userId, title);
    console.log("Copy successful:", copiedPath);
    res.status(201).json({ success: true, path: copiedPath });
  } catch (error) {
    res.status(500).json({ message: "Error copying path" });
  }
};

const getPublicPathById = async (req, res) => {
  try {
    const { id } = req.params;
    const path = await PathModel.getPublicPathById(id);

    if (!path) {
      return res.status(404).json({ message: "Public path not found" });
    }

    res.json({ success: true, path });
  } catch (error) {
    res.status(500).json({ message: "Error fetching public path" });
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
  togglePathVisibility,
  getPublicPaths,
  copyPublicPath,
  getPublicPathById,
};
