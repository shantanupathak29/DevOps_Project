import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMPUS_LOCATIONS,
  getWeatherInterpretation,
  formatTemperature,
  getElevationForCampus,
  createFallbackTelemetry,
} from '../src/lib/weather.js';

test('CAMPUS_LOCATIONS defines expected coordinates and elevation for UPES campuses', () => {
  assert.ok(CAMPUS_LOCATIONS.bidholi);
  assert.equal(CAMPUS_LOCATIONS.bidholi.elevation, '860m');
  assert.equal(CAMPUS_LOCATIONS.bidholi.lat, 30.4158);
  assert.equal(CAMPUS_LOCATIONS.bidholi.lon, 77.9659);

  assert.ok(CAMPUS_LOCATIONS.kandoli);
  assert.equal(CAMPUS_LOCATIONS.kandoli.elevation, '740m');
  assert.equal(CAMPUS_LOCATIONS.kandoli.lat, 30.3842);
  assert.equal(CAMPUS_LOCATIONS.kandoli.lon, 77.9698);
});

test('getWeatherInterpretation handles WMO weather codes correctly', () => {
  // Thunderstorm
  const storm = getWeatherInterpretation(95);
  assert.equal(storm.label, 'Thunderstorm');
  assert.equal(storm.badgeClass, 'weather-status-storm');
  assert.equal(storm.impactLevel, 'caution');

  // Snow / cold flurries
  const snow = getWeatherInterpretation(71);
  assert.equal(snow.label, 'Cold / Flurries');
  assert.equal(snow.impactLevel, 'advisory');

  // Heavy rain
  const heavyRain = getWeatherInterpretation(63);
  assert.equal(heavyRain.label, 'Heavy Rain');
  assert.equal(heavyRain.impactLevel, 'caution');

  // Drizzle
  const drizzle = getWeatherInterpretation(51);
  assert.equal(drizzle.label, 'Light Drizzle');
  assert.equal(drizzle.impactLevel, 'notice');

  // Fog
  const fog = getWeatherInterpretation(45);
  assert.equal(fog.label, 'Foothill Mist / Fog');
  assert.equal(fog.impactLevel, 'notice');

  // Overcast
  const overcast = getWeatherInterpretation(3);
  assert.equal(overcast.label, 'Overcast Skies');
  assert.equal(overcast.impactLevel, 'normal');

  // Partly cloudy (day vs night)
  const partlyDay = getWeatherInterpretation(1, 1);
  assert.equal(partlyDay.label, 'Partly Cloudy');
  assert.equal(partlyDay.icon, '⛅');

  const partlyNight = getWeatherInterpretation(1, 0);
  assert.equal(partlyNight.icon, '☁️');

  // Clear sky (day vs night)
  const clearDay = getWeatherInterpretation(0, 1);
  assert.equal(clearDay.label, 'Clear Sky');
  assert.equal(clearDay.icon, '☀️');

  const clearNight = getWeatherInterpretation(0, 0);
  assert.equal(clearNight.label, 'Clear Night');
  assert.equal(clearNight.icon, '🌙');
});

test('getWeatherInterpretation triggers high wind advisory when wind speed exceeds 40 km/h', () => {
  const highWind = getWeatherInterpretation(0, 1, 0, 45);
  assert.equal(highWind.label, 'High Winds');
  assert.equal(highWind.icon, '💨');
  assert.equal(highWind.impactLevel, 'caution');
});

test('formatTemperature handles Celsius, Fahrenheit, and invalid values', () => {
  assert.equal(formatTemperature(20, 'C'), '20°C');
  assert.equal(formatTemperature(20.4, 'C'), '20°C');
  assert.equal(formatTemperature(20, 'F'), '68°F');
  assert.equal(formatTemperature(0, 'F'), '32°F');
  assert.equal(formatTemperature(null, 'C'), '--');
  assert.equal(formatTemperature(undefined, 'F'), '--');
  assert.equal(formatTemperature(NaN, 'C'), '--');
});

test('getElevationForCampus returns expected elevation strings', () => {
  assert.equal(getElevationForCampus('bidholi'), '860m');
  assert.equal(getElevationForCampus('kandoli'), '740m');
  assert.equal(getElevationForCampus('unknown-gps'), '800m');
});

test('createFallbackTelemetry returns valid default telemetry structure', () => {
  const fallback = createFallbackTelemetry('Bidholi Campus');
  assert.equal(fallback.locationLabel, 'Bidholi Campus');
  assert.equal(fallback.isFallback, true);
  assert.equal(typeof fallback.temperatureC, 'number');
  assert.equal(typeof fallback.feelsLikeC, 'number');
  assert.equal(typeof fallback.humidity, 'number');
  assert.equal(typeof fallback.windSpeed, 'number');
  assert.ok(fallback.icon);
  assert.ok(fallback.label);
  assert.ok(fallback.advisory);
});
