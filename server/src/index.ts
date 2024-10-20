/* eslint-disable @typescript-eslint/no-floating-promises */
import { join } from "path";

import fastify from "fastify";
import autoload from "@fastify/autoload";
import fstatic from "@fastify/static";
import {
	serializerCompiler,
	validatorCompiler
} from "fastify-type-provider-zod";
import cors from "@fastify/cors";

import { Port, Origin } from "./env";

const server = fastify();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

function removeTrailingSlash(url: string) {
	if (url.endsWith("/")) {
		url = url.slice(0, -1);
	}

	return url;
}

const allowedOrigins = [
	"http://localhost:8080",
	removeTrailingSlash(Origin.href)
];

server.register(cors, {
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE"],
	// Add this if your requests involve credentials
	optionsSuccessStatus: 200,
	origin: allowedOrigins // Some legacy browsers (IE11, various SmartTVs) choke on 204
});

const ClientBuildPath = join(__dirname, "../../client/dist");
server.register(fstatic, {
	root: ClientBuildPath,
	prefix: "/"
});

server.register(async (app) => {
	await app.register(autoload, {
		dir: join(__dirname, "routes/v1"),
		options: { prefix: "/api/v1" }
	});
});

server.setNotFoundHandler((request, reply) => {
	if (request.raw.url?.startsWith("/api")) {
		return reply.code(404).send({ error: "Not Found" });
	}

	return reply.sendFile("index.html");
});

server.ready((err) => {
	if (err) throw err;

	console.log("Plugins");
	console.log(server.printPlugins());
	console.log("Routes");
	console.log(server.printRoutes());
});

console.info("Starting server on %s", Port);
server.listen({ host: "0.0.0.0", port: Port }).catch((reason) => {
	console.error(reason, "Failed to bind server.");
	process.exit(1);
});
