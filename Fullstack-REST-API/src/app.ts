import express from "express";
import dotenv from "dotenv";
dotenv.config()
import path from "path";
import friendRoutes from "./routes/friendRoutesAuth";
const app = express()
//const debug = require("debug")("app")
import { Request, Response } from "express";
import { ApiError } from "./errors/errors";
import simpleLogger from "./middleware/simpleLogger";

//Simple cors
//import myCors from "./middleware/myCors";
//app.use(myCors)

//Cors package
const Cors = require("cors"); 
app.use(Cors());

//adding a piece of middleware
//this is a built-in middleware function in express. it parses incoming requests with json payloads and is based on body-parser
app.use(express.json());

//Logger -------------------------
import logger, { stream } from "./middleware/logger";

const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
app.use(require("morgan")(morganFormat, { stream }));
logger.log("info", "Server started");


// Simple logger
//app.use(simpleLogger);
app.use(express.static(path.join(process.cwd(), "public")))
app.use("/api/friends", friendRoutes)

//WINSTON/MORGAN-LOGGER (Use ONLY one of them)
// import logger, { stream } from "./middleware/logger";
// const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
// app.use(require("morgan")(morganFormat, { stream }));
// app.set("logger", logger) 
//The line above sets the logger as a global key on the application object
//You can now use it from all your middlewares like this req.app.get("logger").log("info","Message")
//Level can be one of the following: error, warn, info, http, verbose, debug, silly
//Level = "error" will go to the error file in production





//----------------------------------------------

import authMiddleware from "./middleware/basic-auth"
//app.use("/graphql", authMiddleware)

app.use("/graphql", (req, res, next) => {
    const body = req.body;
    console.log(body);
    if (body && body.query && body.query.includes("createFriend")) {
      console.log("Create")
      return next();
    }
    if (body && body.operationName && body.query.includes("IntrospectionQuery")) {
      return next();
    }
    if (body && body.query && (body.mutation || body.query)) {
        console.log("blalba");
      return authMiddleware(req, res, next)
    }
    next()
  })
  

//GraphQL
import { graphqlHTTP } from 'express-graphql';
import { schema } from './graphql/schema';

  app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
  }));






// Default 404 handlers for api-requests
app.use("/api", (req, res, next) => {
    res.status(404).json({ errorCode: 404, msg: "not found" })
})

// Makes JSON error-response for ApiErrors, otherwise pass on to default error handleer
app.use((err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof (ApiError)) {
        res.status(err.errorCode).json({ errorCode: 404, msg: err.message })
    } else {
        next(err)
    }
})

export default app;