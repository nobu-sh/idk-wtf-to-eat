import path from "path";

import { config } from "dotenv";

const FilePath = path.resolve(__dirname, "../.env");

config({ path: FilePath });

export function getVariable<T>(key: string, fallback?: T) {
	const value = process.env[key] ?? fallback;
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}

	if (typeof fallback === "number") {
		return Number.parseInt(value as string) as T;
	}

	return value as T;
}

export const Port = getVariable<number>("PORT", 1234);
export const Origin = new URL(getVariable<string>("ORIGIN"));
export const GoogleAPIKey = getVariable<string>("GOOGLE_API_KEY");
