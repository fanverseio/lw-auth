const express = require("express");
const router = express.Router();
const pathController = require("../controllers/pathController");

const authenticateJWT = require("../middlewares/authMiddleware");

router.get("/", authenticateJWT, pathController.getAllPaths);
router.get("/:id", authenticateJWT, pathController.getPathById);
router.post("/", authenticateJWT, pathController.createPath);
router.put("/:id", authenticateJWT, pathController.updatePath);
router.delete("/:id", authenticateJWT, pathController.deletePath);

module.exports = router;
