import z from "zod";

import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export const StatusResponse = z.object({
	status: z.enum(["ok", "not_ok"])
});

const StatusRoutes: FastifyPluginAsync = async (app) => {
	app.withTypeProvider<ZodTypeProvider>().route({
		method: "GET",
		url: "/status",
		schema: {
			response: {
				200: StatusResponse
			}
		},
		handler: async (_, reply) => {
			return reply.status(200).send({ status: "ok" });
		}
	});
};

export default StatusRoutes;
