const express = require("express");
const router = express.Router();
const pathController = require("../controllers/pathController");

const authenticateJWT = require("../middlewares/authMiddleware");

// dashboard to see paths
router.get("/", authenticateJWT, pathController.getAllPaths);
router.get("/:id", authenticateJWT, pathController.getPathById);
router.post("/", authenticateJWT, pathController.createPath);
router.put("/:id", authenticateJWT, pathController.updatePath);
router.delete("/:id", authenticateJWT, pathController.deletePath);

// path data
router.get("/:id/data", authenticateJWT, pathController.getPathData);
router.put("/:id/data", authenticateJWT, pathController.updatePathData);
module.exports = router;
