import { Express, Request, Response, NextFunction } from "express";

export default function (app: Express): void {
   app.get("/healthcheck", (req: Request, res: Response) => {
      res.sendStatus(200);
   });

   app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({
         error: { msg: "Route not found. Check url for errors or check if you used the wrong http method." },
      });
   });
}
