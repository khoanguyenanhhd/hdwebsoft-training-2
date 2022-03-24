import http, { Server } from "http";
import express, { Express } from "express";
import config from "../config";
import { createConnection } from "typeorm";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { createGraphqlSchema } from "./graphqlSchema";
import { ApolloServer } from "apollo-server-express";
import { AuthContext, AuthRequest } from "../middlewares/auth/context";
import { authMiddleware } from "../middlewares/auth/authMiddleware";

export class App {
  public readonly port: number;
  public readonly app: Express;
  public readonly httpServer: Server;

  public constructor() {
    this.port = config.PORT;
    this.app = express();
    this.httpServer = http.createServer(this.app);
  }

  protected async bootstrap(): Promise<void> {
    this.middlewares();
    await createConnection();
    await this.startApolloServer();
  }

  protected middlewares(): void {
    this.app.use(authMiddleware);
  }

  protected async startApolloServer(): Promise<void> {
    const schema = await createGraphqlSchema();
    const apolloServer = new ApolloServer({
      schema,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer }),
      ],
      context: ({ req, res }): AuthContext => ({ req, res }),
      // context: ({ req, res }): AuthContext =>
      //   new AuthContext(req as AuthRequest, res),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: this.app, cors: true });
  }

  public async start(): Promise<void> {
    try {
      await this.bootstrap();
      await new Promise((resolve) => {
        this.httpServer.listen(this.port, () => resolve(true));
      });
      console.log(`Server started on http://localhost:${this.port}/graphql`);
    } catch (error) {
      console.log("Start error: ", error);
    }
  }
}
