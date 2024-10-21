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
  primaryType: string;
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
  iconBackgroundColor?: string;
}

export function getLocations(lon: number, lat: number, rad: number = 15) {
  return fetch(`/api/v1/search?longitude=${lon}&latitude=${lat}&radius=${rad}`)
    .then((response) => response.json())
    .then((data: GAPIResponse) => {
      // Filter out places with duplicate names
      const uniquePlaces = data.places.filter(
        (place, index, self) =>
          index ===
          self.findIndex((p) => p.displayName.text === place.displayName.text)
      );

      return uniquePlaces;
    });
}
