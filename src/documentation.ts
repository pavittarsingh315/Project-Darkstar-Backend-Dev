import swaggerJSDoc, { Options } from "swagger-jsdoc";

const options: Options = {
   swaggerDefinition: {
      info: {
         title: "Project Darkstar Documentation",
         description: "Documentation for the Project Darkstar API.",
         version: "1.0.0",
      },
      host: "localhost:5000",
      basePath: "/",
   },
   apis: ["**/*routes.ts"],
};

const swaggerDocs = swaggerJSDoc(options);

export default swaggerDocs;
