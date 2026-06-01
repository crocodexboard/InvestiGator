import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import eventsRouter from "./events";
import bulletinRouter from "./bulletin";
import customSkinsRouter from "./customSkins";
import customBadgesRouter from "./customBadges";
import customBannersRouter from "./customBanners";
import customBordersRouter from "./customBorders";
import authRouter from "./auth";
import mapsRouter from "./maps";
import badgeInventoryRouter from "./badgeInventory";
import skinInventoryRouter from "./skinInventory";
import borderInventoryRouter from "./borderInventory";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profilesRouter);
router.use(eventsRouter);
router.use(bulletinRouter);
router.use(customSkinsRouter);
router.use(customBadgesRouter);
router.use(customBannersRouter);
router.use(customBordersRouter);
router.use(mapsRouter);
router.use(badgeInventoryRouter);
router.use(skinInventoryRouter);
router.use(borderInventoryRouter);

export default router;
