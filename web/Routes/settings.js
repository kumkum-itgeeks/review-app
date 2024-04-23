import express from "express";
import settingController from "../Controller/settings.js";

const router=express.Router();

router.get('/addSettingsData',settingController.addSettings);

router.get('/getSettings',settingController.getSettings);

router.get('/resetSettings',settingController.resetSettings);

router.post('/saveSettings',settingController.ModifySettings);

export default router;