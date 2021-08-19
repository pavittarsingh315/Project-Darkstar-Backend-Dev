import { Express, Request, Response, NextFunction } from "express";
import authRoutes from "./routes/auth.routes";

export default function (app: Express): void {
   app.get("/healthcheck", (req: Request, res: Response) => {
      res.sendStatus(200);
   });

   app.use("/api/auth", authRoutes);

   app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({
         error: { msg: "Route not found. Check url for errors or wrong http method." },
      });
   });
}
