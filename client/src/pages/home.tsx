// import { useCallback, useEffect, useState } from "react";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MousePointer2, Star, WineOff } from "lucide-react";
import { cn } from "@udecode/cn";

import { getLocations, type Restaurant } from "@/utils/get-locations";

interface Location {
  lat: number;
  lon: number;
}

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [places, setPlaces] = useState<Array<Restaurant> | null>(null);

  const requestLocation = useCallback(() => {
    if (location) return;

    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });

          setPlaces(
            await getLocations(
              position.coords.longitude,
              position.coords.latitude
            )
          );

          setTimeout(() => {
            setLocationLoading(false);
          }, 1000);
        },
        (error) => {
          console.error("Failed to get location", error);
          setLocationDenied(true);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLocationDenied(true);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <main className="grid h-screen w-screen grid-cols-[1fr_0.5fr]">
      <div
        className={cn(
          "fixed left-0 top-0 z-50 flex transition-opacity backdrop-blur-lg h-screen w-screen flex-col items-center justify-center bg-black/25 pointer-events-none opacity-100",
          !locationLoading && "opacity-0"
        )}
      >
        <div className="w-full max-w-lg space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-10">
          <h1 className="text-2xl font-semibold">Fetching Location</h1>
          <p className="text-slate-500">
            We need your location to fetch restaurants around you!
          </p>
          {!locationDenied && (
            <div className="grid grid-cols-2">
              <div className="flex flex-row items-center gap-2">
                <p className="text-slate-500">Lat:</p>
                {!location ? (
                  <Loader2 className="size-4 animate-spin text-slate-400" />
                ) : (
                  <p className="text-slate-400">{location.lat}</p>
                )}
              </div>
              <div className="flex flex-row items-center gap-2">
                <p className="text-slate-500">Lon:</p>
                {!location ? (
                  <Loader2 className="size-4 animate-spin text-slate-400" />
                ) : (
                  <p className="text-slate-400">{location.lon}</p>
                )}
              </div>
            </div>
          )}
          {!locationDenied && (
            <div className="flex flex-row items-center gap-2">
              <p className="text-slate-500">Nearby Restaurants:</p>
              {!places ? (
                <Loader2 className="size-4 animate-spin text-slate-400" />
              ) : (
                <p className="text-slate-400">{places.length}</p>
              )}
            </div>
          )}
          {locationDenied && (
            <p className="text-red-400/85">
              Can&apos;t function unless location permission is allowed :(
            </p>
          )}
        </div>
      </div>
      {places && (
        <>
          <DropArea places={places} />
          <LocationArea places={places} />
        </>
      )}
    </main>
  );
}

// idrk how to find the best image from the api. they dont really give us that.
function tryFindLogoImage(place: Restaurant): string | undefined {
  const name = place.displayName.text;

  const logo = place.photos?.find(
    (photo) =>
      photo.authorAttributions[0].displayName === name &&
      photo.widthPx >= 500 &&
      photo.heightPx >= 500
  );

  const fallback = place.photos?.find(
    (photo) =>
      photo.widthPx === photo.heightPx || photo.widthPx > photo.heightPx
  );

  // If a logo is found, return it. Otherwise, fallback to first image or undefined.
  return (
    logo?.authorAttributions[0].photoUri ||
    fallback?.authorAttributions[0].photoUri
  );
}

function primaryType(_type: string): string {
  const type = _type.split("_")[0];

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    x,
    y,
    "Z"
  ].join(" ");
  return d;
}

function DropArea({ places }: { places: Array<Restaurant> }) {
  const svg = useRef<SVGSVGElement | null>(null);
  const numberSegments = places.length;
  const segmentAngle = 360 / numberSegments;
  const [isSpinning, setIsSpinning] = useState(false);
  const [justMounted, setJustMounted] = useState(true);
  const [result, setResult] = useState<Restaurant | null>(null);

  const handleSpin = () => {
    if (!svg.current) return;
    if (isSpinning) return;
    const current = svg.current;
    setIsSpinning(true);
    setJustMounted(false);

    // Reset the svg rotation
    current.style.transition = "none";
    current.style.transform = "rotate(0deg)";

    // Randomly select a segment
    const randomIndex = Math.floor(Math.random() * numberSegments);
    setResult(places[randomIndex]);

    // Calculate the angle to land on the chosen segment
    const randomAmount = Math.random() * segmentAngle;
    const chosenAngle = randomIndex * segmentAngle + randomAmount;

    const totalRotation = 360 * 5 + chosenAngle;

    // Animate the spin
    const spinDuration = 5;
    setTimeout(() => {
      current.style.transition = `transform ${spinDuration}s ease-out`;
      current.style.transform = `rotate(-${totalRotation}deg)`;
    }, 5);

    // Reset spin state after animation completes
    setTimeout(() => {
      setIsSpinning(false);
    }, spinDuration * 1000);
  };

  return (
    <div className="flex size-full min-h-screen select-none flex-col items-center overflow-y-auto overflow-x-hidden p-10 animate-in fade-in">
      <div className="relative my-auto aspect-square w-full max-w-3xl rounded-full bg-slate-900">
        <MousePointer2 className="absolute -top-8 left-1/2 z-10 size-12 -translate-x-1/2 rotate-[225deg] fill-violet-500 text-violet-500" />

        <button
          className="absolute left-1/2 top-1/2 z-10 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950 font-semibold text-violet-400 transition-colors hover:bg-violet-950"
          type="button"
          onClick={handleSpin}
        >
          SPIN
        </button>

        <svg
          ref={svg}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "absolute inset-0 size-full select-none",
            justMounted && "animate-spin-reverse"
          )}
          style={{
            animationDuration: "25s"
          }}
          // style={{
          //   transition: `transform ${5}s ease-out`, // Easing effect for the spin
          //   transform: `rotate(-${rotation}deg)` // Rotate the wheel based on calculated angle
          // }}
        >
          {places.map((place, index) => {
            const segmentRotation = index * segmentAngle;
            return (
              <g key={index} transform={`rotate(${segmentRotation}, 50, 50)`}>
                <path
                  d={describeArc(50, 50, 50, 0, segmentAngle)}
                  fill={index % 2 === 0 ? "#0f172a" : "#1e293b"}
                />
                <text
                  className="max-w-12"
                  fill="#e2e8f0"
                  fontSize="2"
                  textAnchor="middle"
                  transform={`rotate(${segmentAngle / 2}, 50, 50)`}
                  x="50"
                  y="20"
                  style={{
                    writingMode: "vertical-rl"
                  }}
                >
                  {place.displayName.text}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
function LocationArea({ places }: { places: Array<Restaurant> }) {
  return (
    <div className="flex size-full flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-slate-800 p-6 animate-in fade-in">
      {places.map((place) => (
        <div
          className="flex flex-row gap-4 rounded-lg border border-slate-800 p-4"
          key={place.id}
        >
          <img
            className="aspect-video h-16 rounded-lg bg-slate-900 object-cover object-center"
            loading="lazy"
            src={tryFindLogoImage(place)}
          />
          <div className="flex flex-col gap-0.5">
            <h2 className="truncate text-lg">{place.displayName.text}</h2>
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-row items-center gap-1">
                <Star className="size-4 text-yellow-400" />
                <p className="text-sm text-slate-400">{place.rating}</p>
                <p className="text-sm text-slate-500">
                  ({place.userRatingCount})
                </p>
              </div>
              <p className="text-slate-600">·</p>
              <p className="text-sm text-slate-500">
                {primaryType(place.primaryType)}
              </p>
              <div className="flex flex-row items-center gap-2">
                {!(place.servesBeer || place.servesWine) && (
                  <WineOff className="size-3.5 text-red-400" />
                )}
              </div>
            </div>
            <p className="truncate text-sm text-slate-400">
              {place.shortFormattedAddress}
            </p>
            <div className="flex flex-row items-center gap-1 text-sm">
              {[
                place.servesBreakfast && "Breakfast",
                place.servesLunch && "Lunch",
                place.servesDinner && "Dinner"
              ]
                .filter(Boolean) // Filter out false values (for meals not served)
                .map((meal, index) => (
                  <Fragment key={index}>
                    {index > 0 && <p className="text-slate-600">·</p>}{" "}
                    {/* Dot before each item except the first */}
                    <p className="text-slate-500">{meal}</p>
                  </Fragment>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
