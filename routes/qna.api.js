const express = require("express");
const router = express.Router();
const qnaController = require("../controllers/qna.controller");
const authController = require("../controllers/auth.controller");

router.post("/", authController.authenticate, qnaController.createQnA);
router.get("/:id", qnaController.getQnA);
router.put("/:id");
router.delete("/:id");

module.exports = router;
