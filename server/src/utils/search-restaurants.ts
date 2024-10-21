import { GoogleAPIKey } from "../env";

export interface GAPIResponse {
	places: Array<Restaurant>;
}

export interface Address {
	text: string;
	languageCode: string;
}

export interface DateDetails {
	year: number;
	month: number;
	day: number;
}

export interface TimePeriod {
	day: number;
	hour: number;
	minute: number;
	date: DateDetails;
}

export interface OpeningHoursPeriod {
	open: TimePeriod;
	close: TimePeriod;
}

export interface CurrentOpeningHours {
	openNow: boolean;
	periods: Array<OpeningHoursPeriod>;
	weekdayDescriptions: Array<string>;
}

export interface ReviewText {
	text: string;
	languageCode: string;
}

export interface AuthorAttribution {
	displayName: string;
	uri: string;
	photoUri: string;
}

export interface Review {
	name: string;
	relativePublishTimeDescription: string;
	rating: number;
	text: ReviewText;
	originalText: ReviewText;
	authorAttribution: AuthorAttribution;
	publishTime: string;
}

export interface AuthorPhoto {
	displayName: string;
	uri: string;
	photoUri: string;
}

export interface Photo {
	name: string;
	widthPx: number;
	heightPx: number;
	authorAttributions: Array<AuthorPhoto>;
}

export interface Restaurant {
	id: string;
	types: Array<string>;
	nationalPhoneNumber?: string;
	formattedAddress?: string;
	rating?: number;
	googleMapsUri?: string;
	websiteUri?: string;
	businessStatus?: string;
	priceLevel?: string;
	userRatingCount?: number;
	displayName: Address;
	takeout?: boolean;
	delivery?: boolean;
	dineIn?: boolean;
	reservable?: boolean;
	servesBreakfast?: boolean;
	servesLunch?: boolean;
	servesDinner?: boolean;
	servesBeer?: boolean;
	servesWine?: boolean;
	currentOpeningHours?: CurrentOpeningHours;
	shortFormattedAddress?: string;
	reviews?: Array<Review>;
	photos?: Array<Photo>;
	outdoorSeating?: boolean;
	goodForGroups?: boolean;
	goodForWatchingSports?: boolean;
}

export async function searchRestaurants(lat: number, lon: number, rad: number) {
	const radius = rad * 1609.34;

	const url = new URL("https://places.googleapis.com/v1/places:searchNearby");
	const headers = new Headers({
		"X-Goog-Api-Key": GoogleAPIKey,
		"X-Goog-FieldMask": `
		places.id,
    places.displayName,
    places.businessStatus,
    places.formattedAddress,
    places.shortFormattedAddress,
    places.nationalPhoneNumber,
    places.googleMapsUri,
    places.websiteUri,
    places.priceLevel,
    places.rating,
    places.primaryType,
    places.types,
    places.userRatingCount,
    places.takeout,
    places.delivery,
    places.dineIn,
    places.curbsidePickup,
    places.reservable,
    places.servesBreakfast,
    places.servesLunch,
    places.servesDinner,
    places.servesBeer,
    places.servesWine,
    places.goodForGroups,
    places.goodForWatchingSports,
    places.outdoorSeating,
    places.photos,
    places.reviews,
    places.currentOpeningHours,
		places.iconBackgroundColor
  `.replace(/\s+/g, "")
	});
	const body = JSON.stringify({
		locationRestriction: {
			circle: {
				center: {
					latitude: lat,
					longitude: lon
				},
				radius
			}
		},
		includedPrimaryTypes: ["restaurant"]
	});

	const response = await fetch(url.toString(), {
		method: "POST",
		headers,
		body
	});

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	return response.json() as Promise<GAPIResponse>;
}
