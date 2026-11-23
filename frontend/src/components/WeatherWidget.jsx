import { useState, useEffect, useCallback } from 'react';
import {
  CAMPUS_LOCATIONS,
  getWeatherInterpretation,
  formatTemperature,
  getElevationForCampus,
  createFallbackTelemetry,
} from '../lib/weather';

export default function WeatherWidget() {
  const [selectedCampus, setSelectedCampus] = useState('bidholi');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unit, setUnit] = useState('C'); // 'C' | 'F'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [customLocationName, setCustomLocationName] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Fetch live weather data from Open-Meteo API
  const fetchWeather = useCallback(async (lat, lon, locationLabel, isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    }

    try {
      setFetchError(null);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      
      if (!response.ok) {
        throw new Error(`Weather API error (${response.status})`);
      }

      const data = await response.json();
      const current = data.current || {};

      const weatherInterpretation = getWeatherInterpretation(
        current.weather_code ?? 0,
        current.is_day ?? 1,
        current.precipitation ?? 0,
        current.wind_speed_10m ?? 0
      );

      setWeather({
        temperatureC: Math.round(current.temperature_2m ?? 20),
        feelsLikeC: Math.round(current.apparent_temperature ?? 21),
        humidity: current.relative_humidity_2m ?? 65,
        windSpeed: Math.round((current.wind_speed_10m ?? 5) * 10) / 10,
        precipitation: current.precipitation ?? 0,
        weatherCode: current.weather_code ?? 0,
        isDay: current.is_day ?? 1,
        label: weatherInterpretation.label,
        icon: weatherInterpretation.icon,
        badgeClass: weatherInterpretation.badgeClass,
        advisory: weatherInterpretation.advisory,
        impactLevel: weatherInterpretation.impactLevel,
        locationLabel: locationLabel || 'Dehradun Campus',
        isFallback: false,
      });

      const now = new Date();
      setLastSyncTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.warn('Weather API fetch failed, activating resilient telemetry fallback:', err);
      try {
        const fallback = createFallbackTelemetry(locationLabel || 'Bidholi Campus');
        setWeather(fallback);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (fallbackErr) {
        console.error('Critical weather telemetry failure:', fallbackErr);
        setFetchError('Unable to retrieve weather telemetry');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setGeoLocating(false);
    }
  }, []);

  // Update weather whenever selected campus changes
  useEffect(() => {
    if (selectedCampus === 'gps') return undefined;
    let cancelled = false;
    const campus = CAMPUS_LOCATIONS[selectedCampus] || CAMPUS_LOCATIONS.bidholi;

    const loadWeather = async (isManual = false) => {
      if (cancelled) return;
      await fetchWeather(campus.lat, campus.lon, campus.name, isManual);
    };

    const kickoff = setTimeout(() => {
      void loadWeather(false);
    }, 0);

    // Auto-refresh every 4 minutes for live accuracy
    const timer = setInterval(() => {
      void loadWeather(false);
    }, 240000);

    return () => {
      cancelled = true;
      clearTimeout(kickoff);
      clearInterval(timer);
    };
  }, [selectedCampus, fetchWeather]);

  // Handle manual refresh button click
  const handleRefresh = () => {
    if (selectedCampus === 'gps' && customLocationName) {
      // Re-trigger current GPS if available
      handleDetectLocation();
      return;
    }
    const campus = CAMPUS_LOCATIONS[selectedCampus] || CAMPUS_LOCATIONS.bidholi;
    fetchWeather(campus.lat, campus.lon, campus.name, true);
  };

  // Handle GPS location detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    setSelectedCampus('gps');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCustomLocationName('Current Location');
        fetchWeather(latitude, longitude, 'My Location (GPS)', true);
      },
      (err) => {
        console.warn('Geolocation denied or failed, reverting to Bidholi Campus:', err);
        setSelectedCampus('bidholi');
        setGeoLocating(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="login-weather-card">
      {/* Top Header of Weather Widget */}
      <div className="weather-card-header">
        <div className="weather-header-title-wrap">
          <span className="weather-live-ping"></span>
          <span className="weather-widget-tag">REALTIME CAMPUS WEATHER</span>
        </div>

        <div className="weather-header-actions">
          {/* Temperature unit switch */}
          <button
            type="button"
            className="weather-unit-toggle"
            onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
            title="Toggle between Celsius and Fahrenheit"
          >
            °{unit}
          </button>

          {/* Real-time Refresh Button */}
          <button
            type="button"
            className={`weather-refresh-btn ${refreshing ? 'is-spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Refresh real-time weather"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Campus Selector Pills */}
      <div className="weather-campus-selector">
        <button
          type="button"
          className={`campus-select-chip ${selectedCampus === 'bidholi' ? 'active-chip' : ''}`}
          onClick={() => {
            setSelectedCampus('bidholi');
            setCustomLocationName(null);
          }}
        >
          <span className="campus-chip-dot dot-bidholi"></span>
          <span>Bidholi Campus</span>
        </button>
        <button
          type="button"
          className={`campus-select-chip ${selectedCampus === 'kandoli' ? 'active-chip' : ''}`}
          onClick={() => {
            setSelectedCampus('kandoli');
            setCustomLocationName(null);
          }}
        >
          <span className="campus-chip-dot dot-kandoli"></span>
          <span>Kandoli Campus</span>
        </button>
        <button
          type="button"
          className={`campus-select-chip chip-gps ${selectedCampus === 'gps' ? 'active-chip' : ''}`}
          onClick={handleDetectLocation}
          title="Detect weather using your current device GPS"
        >
          <span>{geoLocating ? '📡 Locating...' : '📍 My GPS'}</span>
        </button>
      </div>

      {/* Main Weather Display Section */}
      {loading && !weather ? (
        <div className="weather-loading-state">
          <div className="weather-mini-spinner"></div>
          <span>Retrieving Dehradun campus weather telemetry...</span>
        </div>
      ) : !weather ? (
        <div className="weather-error-state">
          <span>{fetchError || 'Unable to load campus weather telemetry.'}</span>
          <button type="button" className="weather-retry-btn" onClick={handleRefresh}>
            Retry Telemetry
          </button>
        </div>
      ) : (
        <div className="weather-display-body">
          {/* Main Temperature & Icon Hero */}
          <div className="weather-hero-row">
            <div className="weather-temp-group">
              <span className="weather-icon-animated" role="img" aria-label={weather?.label || 'Weather'}>
                {weather?.icon}
              </span>
              <div className="weather-temp-details">
                <span className="weather-temp-main">{formatTemperature(weather?.temperatureC, unit)}</span>
                <span className="weather-feels-sub">
                  Feels like {formatTemperature(weather?.feelsLikeC, unit)}
                </span>
              </div>
            </div>

            <div className="weather-condition-pill-box">
              <span className={`weather-condition-badge ${weather?.badgeClass}`}>
                {weather?.label}
              </span>
              <span className="weather-location-caption">
                {weather?.locationLabel}
              </span>
            </div>
          </div>

          {/* 4-Card Weather Telemetry Metrics Grid */}
          <div className="weather-metrics-grid">
            <div className="weather-metric-item">
              <span className="metric-icon">💧</span>
              <div className="metric-meta">
                <span className="metric-val">{weather?.humidity ?? '--'}%</span>
                <span className="metric-name">Humidity</span>
              </div>
            </div>

            <div className="weather-metric-item">
              <span className="metric-icon">💨</span>
              <div className="metric-meta">
                <span className="metric-val">{weather?.windSpeed ?? '--'} km/h</span>
                <span className="metric-name">Wind Speed</span>
              </div>
            </div>

            <div className="weather-metric-item">
              <span className="metric-icon">🌧️</span>
              <div className="metric-meta">
                <span className="metric-val">{weather?.precipitation ?? 0} mm</span>
                <span className="metric-name">Rainfall</span>
              </div>
            </div>

            <div className="weather-metric-item">
              <span className="metric-icon">⛰️</span>
              <div className="metric-meta">
                <span className="metric-val">
                  {getElevationForCampus(selectedCampus)}
                </span>
                <span className="metric-name">Elevation</span>
              </div>
            </div>
          </div>



          {/* Transit Route Advisory Banner */}
          <div className={`weather-advisory-strip impact-${weather?.impactLevel}`}>
            <span className="advisory-icon">
              {weather?.impactLevel === 'caution' ? '⚠️' : weather?.impactLevel === 'notice' ? 'ℹ️' : '🚌'}
            </span>
            <div className="advisory-content">
              <span className="advisory-title">Transit Advisory:</span>
              <span className="advisory-text">{weather?.advisory}</span>
            </div>
          </div>

          {/* Sync status footer */}
          <div className="weather-sync-footer">
            <span className="sync-pulse-dot"></span>
            <span className="sync-text">
              {weather?.isFallback ? 'Station Telemetry (Offline Cache)' : 'Live Station Feed'} &bull; Synced {lastSyncTime || 'Just now'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
