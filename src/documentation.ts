import swaggerJSDoc, { Options } from "swagger-jsdoc";

const options: Options = {
   swaggerDefinition: {
      info: {
         title: "Project Darkstar Documentation",
         description: "Documentation for the Project Darkstar API.",
         version: "1.0.0",
      },
      host: "https://testing-darkstar-for-frontend.herokuapp.com",
      basePath: "/",
      securityDefinitions: {
         auth: {
            type: "apiKey",
            name: "Authorization",
            description: "Access token of user making request",
            in: "header",
         },
      },
   },
   apis: ["**/*routes.ts"],
};

const swaggerDocs = swaggerJSDoc(options);

export default swaggerDocs;
