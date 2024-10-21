import z from "zod";

import { searchRestaurants } from "../../utils/search-restaurants";

import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export const SearchQuery = z.object({
	// Radius is in miles we will convert it to meters
	radius: z.string().optional(),
	// Latitude and Longitude are required
	latitude: z.string(),
	longitude: z.string()
});

export const SearchQueryAdvanced = z.object({
	// Radius is in miles we will convert it to meters
	radius: z.number().int().positive().min(5).max(50),
	// Latitude and Longitude are required
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180)
});

export const SearchResponse = z.object({
	status: z.enum(["ok", "not_ok"])
});

const SearchRoutes: FastifyPluginAsync = async (app) => {
	app.withTypeProvider<ZodTypeProvider>().route({
		method: "GET",
		url: "/search",
		schema: {
			querystring: SearchQuery,
			response: {
				// 200: SearchResponse
			}
		},
		handler: async (request, reply) => {
			const {
				radius: _radius,
				latitude: _latitude,
				longitude: _longitude
			} = request.query;

			const advanced = SearchQueryAdvanced.safeParse({
				radius: Number.parseInt(_radius || "5"),
				latitude: Number.parseFloat(_latitude),
				longitude: Number.parseFloat(_longitude)
			});

			if (!advanced.success) {
				return reply.status(400).send({
					statusCode: 400,
					code: "FST_ERR_VALIDATION",
					error: "Bad Request",
					message: advanced.error.message
				});
			}

			const { radius, latitude, longitude } = advanced.data;

			try {
				return reply
					.status(200)
					.send(await searchRestaurants(latitude, longitude, radius));
			} catch (reason) {
				console.error("Failed to search", reason);
				return reply.status(500).send({ status: "womp_womp" });
			}
		}
	});
};

export default SearchRoutes;
