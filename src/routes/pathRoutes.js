const express = require("express");
const router = express.Router();
const pathController = require("../controllers/pathController");

const authenticateJWT = require("../middlewares/authMiddleware");

// get paths for public board
router.get("/public", pathController.getPublicPaths);
router.get("/public/:id", authenticateJWT, pathController.getPublicPathById);

// dashboard to see paths
router.get("/", authenticateJWT, pathController.getAllPaths);
router.get("/:id", authenticateJWT, pathController.getPathById);
router.post("/", authenticateJWT, pathController.createPath);
router.put("/:id", authenticateJWT, pathController.updatePath);
router.delete("/:id", authenticateJWT, pathController.deletePath);

// path data
router.get("/:id/data", authenticateJWT, pathController.getPathData);
router.put("/:id/data", authenticateJWT, pathController.updatePathData);

// copy and set user path status
router.post("/:id/copy", authenticateJWT, pathController.copyPublicPath);
router.put(
  "/:id/visibility",
  authenticateJWT,
  pathController.togglePathVisibility
);

module.exports = router;
