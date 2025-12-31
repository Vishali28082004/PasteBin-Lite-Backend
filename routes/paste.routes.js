import { Router } from "express";
import {
  createPaste,
  getPaste,
  getPasteHTML,
  healthCheck,
  getAllPastes,
  deletePaste,
} from "../controllers/paste.controller.js";

const router = Router();


router.route("/healthz").get(healthCheck);


router.route("/create-paste").post(createPaste);

router.route("/get-all-pastes").get(getAllPastes);

router.route("/get-paste/:id").get(getPaste);

router.route("/delete-paste/:id").delete(deletePaste);

router.route("/view-paste/:id").get(getPasteHTML);

export default router;