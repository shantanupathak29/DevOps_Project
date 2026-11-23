// Campus locations and coordinates in Dehradun, Uttarakhand
export const CAMPUS_LOCATIONS = {
  bidholi: {
    id: 'bidholi',
    name: 'Bidholi Campus',
    shortName: 'Bidholi',
    subtitle: 'Energy Acres • 860m Alt',
    lat: 30.4158,
    lon: 77.9659,
    elevation: '860m',
  },
  kandoli: {
    id: 'kandoli',
    name: 'Kandoli Campus',
    shortName: 'Kandoli',
    subtitle: 'Knowledge Acres • 740m Alt',
    lat: 30.3842,
    lon: 77.9698,
    elevation: '740m',
  },
};

/**
 * Interpret WMO Weather Codes to icons, labels, and transit advisories
 * @param {number} code - WMO weather interpretation code
 * @param {number} [isDay=1] - 1 for day, 0 for night
 * @param {number} [precipitation=0] - precipitation amount in mm
 * @param {number} [windSpeed=0] - wind speed in km/h
 * @returns {object} Weather presentation metadata
 */
export const getWeatherInterpretation = (code, isDay = 1, precipitation = 0, windSpeed = 0) => {
  // Thunderstorms
  if ([95, 96, 99].includes(code)) {
    return {
      label: 'Thunderstorm',
      icon: '⛈️',
      badgeClass: 'weather-status-storm',
      advisory: 'Hill thunderstorm active. Shuttles operating with caution; +5 min transit buffer.',
      impactLevel: 'caution',
    };
  }
  // High wind advisory
  if (windSpeed > 40) {
    return {
      label: 'High Winds',
      icon: '💨',
      badgeClass: 'weather-status-caution',
      advisory: 'Strong foothill winds detected. Shuttles moving with reduced speed.',
      impactLevel: 'caution',
    };
  }
  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      label: 'Cold / Flurries',
      icon: '❄️',
      badgeClass: 'weather-status-cold',
      advisory: 'Low foothill temperature. Heated shuttles dispatched.',
      impactLevel: 'advisory',
    };
  }
  // Heavy / Moderate Rain
  if ([63, 65, 81, 82].includes(code) || precipitation > 2.5) {
    return {
      label: 'Heavy Rain',
      icon: '🌧️',
      badgeClass: 'weather-status-rain',
      advisory: 'Wet roads on Bidholi-Kandoli pass. Shuttles operating with speed restriction.',
      impactLevel: 'caution',
    };
  }
  // Light Rain / Drizzle
  if ([51, 53, 55, 61, 80].includes(code) || precipitation > 0) {
    return {
      label: 'Light Drizzle',
      icon: '🌦️',
      badgeClass: 'weather-status-rain',
      advisory: 'Drizzle along route. Bus wipers active, standard 15-min departure schedules.',
      impactLevel: 'notice',
    };
  }
  // Fog / Mist
  if ([45, 48].includes(code)) {
    return {
      label: 'Foothill Mist / Fog',
      icon: '🌫️',
      badgeClass: 'weather-status-fog',
      advisory: 'Valley fog detected. Shuttle fog lights enabled along mountain switchbacks.',
      impactLevel: 'notice',
    };
  }
  // Overcast
  if (code === 3) {
    return {
      label: 'Overcast Skies',
      icon: '☁️',
      badgeClass: 'weather-status-cloudy',
      advisory: 'Cloud cover over foothills. Smooth road conditions on transit express line.',
      impactLevel: 'normal',
    };
  }
  // Partly Cloudy
  if ([1, 2].includes(code)) {
    return {
      label: 'Partly Cloudy',
      icon: isDay ? '⛅' : '☁️',
      badgeClass: 'weather-status-partly',
      advisory: 'Optimal commute conditions. Express shuttles running strictly on time.',
      impactLevel: 'optimal',
    };
  }
  // Clear Sky
  return {
    label: isDay ? 'Clear Sky' : 'Clear Night',
    icon: isDay ? '☀️' : '🌙',
    badgeClass: 'weather-status-clear',
    advisory: 'Clear foothill weather. Zero delays reported across all 10 active shuttles.',
    impactLevel: 'optimal',
  };
};

/**
 * Formats Celsius temperature based on selected unit
 * @param {number|null|undefined} tempC
 * @param {'C'|'F'} unit
 * @returns {string}
 */
export const formatTemperature = (tempC, unit = 'C') => {
  if (tempC === undefined || tempC === null || Number.isNaN(tempC)) return '--';
  if (unit === 'F') {
    return `${Math.round((tempC * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(tempC)}°C`;
};

/**
 * Returns formatted elevation string for a campus or GPS mode
 * @param {string} campusId
 * @returns {string}
 */
export const getElevationForCampus = (campusId) => {
  if (CAMPUS_LOCATIONS[campusId]) {
    return CAMPUS_LOCATIONS[campusId].elevation;
  }
  return '800m';
};

/**
 * Creates default fallback telemetry when remote API is unreachable
 * @param {string} [locationLabel='Bidholi Campus']
 * @returns {object}
 */
export const createFallbackTelemetry = (locationLabel = 'Bidholi Campus') => {
  const interp = getWeatherInterpretation(2, 1, 0, 4);
  return {
    temperatureC: 19,
    feelsLikeC: 20,
    humidity: 78,
    windSpeed: 4.2,
    precipitation: 0.0,
    weatherCode: 2,
    isDay: 1,
    label: interp.label,
    icon: interp.icon,
    badgeClass: interp.badgeClass,
    advisory: interp.advisory,
    impactLevel: interp.impactLevel,
    locationLabel,
    isFallback: true,
  };
};
