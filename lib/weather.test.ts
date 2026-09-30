import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { openMeteoUrl, parseOpenMeteo, weatherLabel } from "./weather.ts";

describe("weather", () => {
  it("sends only the cities' coordinates to Open-Meteo", () => {
    const url = openMeteoUrl([{ coords: [37.6175, 55.75056] }, { coords: [49.11444, 55.79083] }]);
    const params = new URL(url).searchParams;
    assert.deepEqual([...params.keys()].sort(), ["current", "latitude", "longitude", "timezone"]);
    assert.equal(params.get("latitude"), "55.7506,55.7908");
  });

  it("reads several cities in one answer and skips a broken one", () => {
    const body = [{ current: { time: "2026-09-30T14:00", temperature_2m: 7.4, weather_code: 3, is_day: 1 } }, { current: {} }];
    assert.deepEqual(parseOpenMeteo(["moscou", "kazan"], body), [{ id: "moscou", temperature: 7.4, code: 3, isDay: true, time: "2026-09-30T14:00" }]);
  });

  it("puts WMO codes into a few words", () => {
    assert.equal(weatherLabel(0), "Ciel dégagé");
    assert.equal(weatherLabel(63), "Pluie");
    assert.equal(weatherLabel(73), "Neige");
  });
});
