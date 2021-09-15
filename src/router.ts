import { Express, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./documentation";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import utilRoutes from "./routes/utils.routes";

export default async function (app: Express) {
   app.get("/healthcheck", (req: Request, res: Response) => {
      res.sendStatus(200);
   });

   app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
   app.use("/api/auth", authRoutes);
   app.use("/api/admin", adminRoutes);
   app.use("/api/utils", utilRoutes);

   app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({
         error: { msg: "Route not found. Check url for errors or wrong http method." },
      });
   });

   return;
}
