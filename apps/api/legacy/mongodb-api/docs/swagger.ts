import config from "config";
import { Request, Response, Express } from "express";
import swaggerJSDoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

class SwaggerService {
  private app: Express;
  private port: number = Number(config.get("PORT")) ?? 4500;
  private host = config.get("API_HOST") ?? "";

  constructor(app: Express) {
    this.app = app;
  }

  public init(): void {
    const environment = process.env.NODE_ENV ?? "development";


    //
    let server =
      environment !== "development"
        ? {
            url: `${this.host}/api/v2`,
            description: `${environment.toString()} server`,
          }
        : {
            url: `http://localhost:${this.port}/api/v2`,
            description: "Development server",
          };

    //
    const options: Options = {
      definition: {
        openapi: "3.0.1",
        info: {
          title: "LemonBooks Api docs",
          version: "1.0.0",
        },
        servers: [server],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
      apis: ["./src/docs/**/**/*.ts", "./src/docs/**/schemas/*.ts"],
    };

    const swaggerSpec = swaggerJSDoc(options);

    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    this.app.get("docs.json", (_: Request, res: Response) => {
      res.json(swaggerSpec);
    });

    console.log(
      `Access api docs via:  ${this.host}/api-docs`
    );
  }
}

export default SwaggerService;
