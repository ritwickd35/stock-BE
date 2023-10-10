import express from "express";
import stockController from '../controllers/stock.controller.js'

const router = express.Router();

router.get("/generate-data", stockController.generateData)

router.get("/instruments", stockController.getInstruments)

router.get("/search", stockController.getInstrumentDetails)

export default router;