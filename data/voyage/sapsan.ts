import { lineKm } from "../../lib/travel/geo.ts";
import type { Leg } from "../../lib/voyage/flight.ts";
import { getJourney } from "../travel/journeys.ts";

/**
 * The Sapsan, Moscow → Saint Petersburg, as a leg the train travels on the
 * world. The drawing is SCHEMATIC (through Tver, Bologoye and Chudovo, the
 * stations of the line): kilometres counted on it are labelled as such; the
 * scene's distance figure is the great-circle one between the cities.
 */
const journey = getJourney("train-moscou-spb");

export const sapsanLeg: Leg = { path: journey.path, km: lineKm(journey.path), startKm: 0, basis: journey.pathBasis, group: "sapsan" };

export const trainLegs = { "msk-spb": sapsanLeg };
