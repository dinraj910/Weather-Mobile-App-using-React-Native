import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";

// Open-Meteo API - Free, no API key required!
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE_GEOCODING_URL = "https://nominatim.openstreetmap.org/reverse";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

type HourlyForecast = {
  time: string;
  temp: number;
  weatherCode: number;
  isDay: boolean;
};

type WeatherData = {
  name: string;
  temp: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  weatherCode: number;
  timezone: string;
  isDay: boolean;
  localTime: string;
  sunrise: string;
  sunset: string;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  hourlyForecast: HourlyForecast[];
};

// Get AQI level and color
const getAqiInfo = (aqi: number | null) => {
  if (aqi === null) return { label: "N/A", color: "#888", bgColor: "bg-gray-500/30" };
  if (aqi <= 50) return { label: "Good", color: "#00E400", bgColor: "bg-green-500/30" };
  if (aqi <= 100) return { label: "Moderate", color: "#FFFF00", bgColor: "bg-yellow-500/30" };
  if (aqi <= 150) return { label: "Unhealthy (SG)", color: "#FF7E00", bgColor: "bg-orange-500/30" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#FF0000", bgColor: "bg-red-500/30" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#8F3F97", bgColor: "bg-purple-500/30" };
  return { label: "Hazardous", color: "#7E0023", bgColor: "bg-red-900/30" };
};

// Map weather codes to descriptions, icons, and backgrounds
const getWeatherInfo = (code: number, isDay: boolean = true) => {
  const weatherMap: Record<number, { description: string; icon: string; bg: string[]; image: string }> = {
    0: { 
      description: "Clear sky", 
      icon: isDay ? "sunny" : "moon",
      bg: isDay ? ["#4facfe", "#00f2fe"] : ["#0f0c29", "#302b63", "#24243e"],
      image: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800"
    },
    1: { 
      description: "Mainly clear", 
      icon: isDay ? "partly-sunny" : "cloudy-night",
      bg: isDay ? ["#667eea", "#764ba2"] : ["#141e30", "#243b55"],
      image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800"
    },
    2: { 
      description: "Partly cloudy", 
      icon: "partly-sunny",
      bg: ["#89f7fe", "#66a6ff"],
      image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800"
    },
    3: { 
      description: "Overcast", 
      icon: "cloudy",
      bg: ["#bdc3c7", "#606c88"],
      image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800"
    },
    45: { 
      description: "Foggy", 
      icon: "cloudy",
      bg: ["#757f9a", "#d7dde8"],
      image: "https://images.unsplash.com/photo-1487621167193-286a15127e3a?w=800"
    },
    48: { 
      description: "Rime fog", 
      icon: "cloudy",
      bg: ["#757f9a", "#d7dde8"],
      image: "https://images.unsplash.com/photo-1487621167193-286a15127e3a?w=800"
    },
    51: { 
      description: "Light drizzle", 
      icon: "rainy",
      bg: ["#373b44", "#4286f4"],
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800"
    },
    53: { 
      description: "Drizzle", 
      icon: "rainy",
      bg: ["#373b44", "#4286f4"],
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800"
    },
    55: { 
      description: "Dense drizzle", 
      icon: "rainy",
      bg: ["#373b44", "#4286f4"],
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800"
    },
    61: { 
      description: "Slight rain", 
      icon: "rainy",
      bg: ["#0f2027", "#203a43", "#2c5364"],
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800"
    },
    63: { 
      description: "Moderate rain", 
      icon: "rainy",
      bg: ["#0f2027", "#203a43", "#2c5364"],
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800"
    },
    65: { 
      description: "Heavy rain", 
      icon: "rainy",
      bg: ["#000046", "#1cb5e0"],
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800"
    },
    71: { 
      description: "Slight snow", 
      icon: "snow",
      bg: ["#e6dada", "#274046"],
      image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800"
    },
    73: { 
      description: "Moderate snow", 
      icon: "snow",
      bg: ["#e6dada", "#274046"],
      image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800"
    },
    75: { 
      description: "Heavy snow", 
      icon: "snow",
      bg: ["#e6dada", "#274046"],
      image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800"
    },
    80: { 
      description: "Rain showers", 
      icon: "rainy",
      bg: ["#373b44", "#4286f4"],
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800"
    },
    81: { 
      description: "Moderate showers", 
      icon: "rainy",
      bg: ["#373b44", "#4286f4"],
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800"
    },
    82: { 
      description: "Violent showers", 
      icon: "rainy",
      bg: ["#000046", "#1cb5e0"],
      image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800"
    },
    95: { 
      description: "Thunderstorm", 
      icon: "thunderstorm",
      bg: ["#0f0c29", "#302b63", "#24243e"],
      image: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=800"
    },
    96: { 
      description: "Thunderstorm + hail", 
      icon: "thunderstorm",
      bg: ["#0f0c29", "#302b63", "#24243e"],
      image: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=800"
    },
    99: { 
      description: "Severe thunderstorm", 
      icon: "thunderstorm",
      bg: ["#0f0c29", "#302b63", "#24243e"],
      image: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=800"
    },
  };
  return weatherMap[code] || { 
    description: "Unknown", 
    icon: "partly-sunny",
    bg: ["#4facfe", "#00f2fe"],
    image: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800"
  };
};


export default function Home(){
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [weather,setWeather] = useState<WeatherData | null>(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Fetch weather using coordinates
  const fetchWeatherByCoords = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      // Get city name from coordinates (reverse geocoding)
      const reverseGeoUrl = `${REVERSE_GEOCODING_URL}?lat=${latitude}&lon=${longitude}&format=json&zoom=18`;
      const reverseGeoRes = await fetch(reverseGeoUrl, {
        headers: { "User-Agent": "WeatherApp/1.0" },
      });
      const reverseGeoData = await reverseGeoRes.json();
      const address = reverseGeoData.address || {};
      // Try to get the most specific location name available
      const cityName = address.hamlet ||
                       address.village ||
                       address.suburb ||
                       address.neighbourhood ||
                       address.town ||
                       address.city ||
                       address.county ||
                       address.state_district ||
                       address.state ||
                       "Your Location";

      // Get weather data using coordinates
      const weatherUrl = `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code,is_day&daily=sunrise,sunset&hourly=temperature_2m,weather_code,is_day&timezone=auto&forecast_hours=24`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      if (!weatherData.current) {
        throw new Error("Weather data not available");
      }

      // Fetch air quality data
      let aqi = null;
      let pm25 = null;
      let pm10 = null;
      try {
        const aqiUrl = `${AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm2_5,pm10`;
        const aqiRes = await fetch(aqiUrl);
        const aqiData = await aqiRes.json();
        if (aqiData.current) {
          aqi = aqiData.current.european_aqi;
          pm25 = aqiData.current.pm2_5;
          pm10 = aqiData.current.pm10;
        }
      } catch (e) {
        console.log("Air quality data not available");
      }

      // Process hourly forecast
      const hourlyForecast: HourlyForecast[] = [];
      if (weatherData.hourly) {
        const times = weatherData.hourly.time || [];
        const temps = weatherData.hourly.temperature_2m || [];
        const codes = weatherData.hourly.weather_code || [];
        const isDayArr = weatherData.hourly.is_day || [];
        
        for (let i = 0; i < Math.min(24, times.length); i++) {
          hourlyForecast.push({
            time: times[i],
            temp: temps[i],
            weatherCode: codes[i],
            isDay: isDayArr[i] === 1,
          });
        }
      }

      // Get local time at the location
      const localTime = new Date().toLocaleString("en-US", {
        timeZone: weatherData.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const localDate = new Date().toLocaleString("en-US", {
        timeZone: weatherData.timezone,
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      setWeather({
        name: cityName,
        temp: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        pressure: Math.round(weatherData.current.surface_pressure),
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCode: weatherData.current.weather_code,
        timezone: weatherData.timezone,
        isDay: weatherData.current.is_day === 1,
        localTime: `${localDate} • ${localTime}`,
        sunrise: weatherData.daily?.sunrise?.[0]?.split("T")[1] || "06:00",
        sunset: weatherData.daily?.sunset?.[0]?.split("T")[1] || "18:00",
        aqi,
        pm25,
        pm10,
        hourlyForecast,
      });
      setCity(cityName);
      setQuery(cityName);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather using city name (with fallback search using Nominatim for small places)
  const fetchWeather = async (cityName: string) => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Try Open-Meteo geocoding first
      const geoUrl = `${GEOCODING_URL}?name=${encodeURIComponent(cityName)}&count=5`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      let latitude: number;
      let longitude: number;
      let name: string;

      if (geoData.results && geoData.results.length > 0) {
        // Found in Open-Meteo
        ({ latitude, longitude, name } = geoData.results[0]);
      } else {
        // Fallback: Use Nominatim for smaller places (villages, hamlets)
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
        const nominatimRes = await fetch(nominatimUrl, {
          headers: { "User-Agent": "WeatherApp/1.0" },
        });
        const nominatimData = await nominatimRes.json();

        if (!nominatimData || nominatimData.length === 0) {
          throw new Error("Location not found. Try adding district or state (e.g., 'Kurichy, Kottayam')");
        }

        latitude = parseFloat(nominatimData[0].lat);
        longitude = parseFloat(nominatimData[0].lon);
        name = nominatimData[0].display_name.split(",")[0];
      }

      // Step 2: Get weather data using coordinates
      const weatherUrl = `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code,is_day&daily=sunrise,sunset&hourly=temperature_2m,weather_code,is_day&timezone=auto&forecast_hours=24`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      if (!weatherData.current) {
        throw new Error("Weather data not available");
      }

      // Fetch air quality data
      let aqi = null;
      let pm25 = null;
      let pm10 = null;
      try {
        const aqiUrl = `${AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm2_5,pm10`;
        const aqiRes = await fetch(aqiUrl);
        const aqiData = await aqiRes.json();
        if (aqiData.current) {
          aqi = aqiData.current.european_aqi;
          pm25 = aqiData.current.pm2_5;
          pm10 = aqiData.current.pm10;
        }
      } catch (e) {
        console.log("Air quality data not available");
      }

      // Process hourly forecast
      const hourlyForecast: HourlyForecast[] = [];
      if (weatherData.hourly) {
        const times = weatherData.hourly.time || [];
        const temps = weatherData.hourly.temperature_2m || [];
        const codes = weatherData.hourly.weather_code || [];
        const isDayArr = weatherData.hourly.is_day || [];
        
        for (let i = 0; i < Math.min(24, times.length); i++) {
          hourlyForecast.push({
            time: times[i],
            temp: temps[i],
            weatherCode: codes[i],
            isDay: isDayArr[i] === 1,
          });
        }
      }

      // Get local time at the location
      const localTime = new Date().toLocaleString("en-US", {
        timeZone: weatherData.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const localDate = new Date().toLocaleString("en-US", {
        timeZone: weatherData.timezone,
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      setWeather({
        name,
        temp: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        pressure: Math.round(weatherData.current.surface_pressure),
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCode: weatherData.current.weather_code,
        timezone: weatherData.timezone,
        isDay: weatherData.current.is_day === 1,
        localTime: `${localDate} • ${localTime}`,
        sunrise: weatherData.daily?.sunrise?.[0]?.split("T")[1] || "06:00",
        sunset: weatherData.daily?.sunset?.[0]?.split("T")[1] || "18:00",
        aqi,
        pm25,
        pm10,
        hourlyForecast,
      });
      setCity(name);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Request location permission and get current location
  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      setLocationStatus("Requesting location permission...");

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        setLocationStatus(null);
        setError("Location permission denied. Search for a city manually.");
        setLoading(false);
        return;
      }

      setLocationStatus("Getting your location...");
      
      // Try to get last known location first (faster)
      let location = await Location.getLastKnownPositionAsync();
      
      // If no last known location, get current position with timeout
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
          timeInterval: 10000,
        });
      }

      if (!location) {
        throw new Error("Could not determine location");
      }

      setLocationStatus(null);
      await fetchWeatherByCoords(location.coords.latitude, location.coords.longitude);
    } catch (e) {
      setLocationStatus(null);
      console.log("Location error:", e);
      setError("Could not get location. Search for a city manually.");
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleSubmit = () =>{
    if (!query.trim()) return;
    fetchWeather(query.trim());
    Keyboard.dismiss(); // hide keyboard on submit
  };

  const temp = weather?.temp ?? 0;
  const isDay = weather?.isDay ?? true;
  const weatherInfo = getWeatherInfo(weather?.weatherCode ?? 0, isDay);
  const description = weatherInfo.description;
  const icon = weatherInfo.icon;
  const bgColors = weatherInfo.bg;
  const bgImage = weatherInfo.image;
  const humidity = weather?.humidity ?? 0;
  const pressure = weather?.pressure ?? 0;
  const windSpeed = weather?.windSpeed ?? 0;
  const sunrise = weather?.sunrise ?? "06:00";
  const sunset = weather?.sunset ?? "18:00";
  const locationTime = weather?.localTime ?? "";
  const aqi = weather?.aqi ?? null;
  const pm25 = weather?.pm25 ?? null;
  const pm10 = weather?.pm10 ?? null;
  const aqiInfo = getAqiInfo(aqi);
  const hourlyForecast = weather?.hourlyForecast ?? [];

  // Format hour for display
  const formatHour = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: bgImage }}
        className="flex-1"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="px-6 pt-14">
              {/* Search Bar */}
              <View className="flex-row items-center bg-white/20 backdrop-blur-lg px-4 py-3 rounded-2xl border border-white/30">
                <Ionicons name="search" size={20} color="white" />
                <TextInput
                  placeholder="Search city..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  className="text-white flex-1 ml-3 text-base"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="search"
                />
                <Pressable onPress={requestLocationPermission} className="ml-2">
                  <Ionicons name="location" size={22} color="white" />
                </Pressable>
              </View>

              {/* Error message */}
              {error && (
                <View className="bg-red-500/30 backdrop-blur-lg mt-4 p-3 rounded-xl border border-red-400/50">
                  <Text className="text-white text-center">{error}</Text>
                </View>
              )}
            </View>

            {/* Loading indicator */}
            {loading && (
              <View className="items-center justify-center mt-40">
                <View className="bg-white/20 backdrop-blur-lg p-8 rounded-3xl">
                  <ActivityIndicator size="large" color="#fff" />
                  <Text className="text-white mt-4 text-center font-medium">
                    {locationStatus || "Loading weather..."}
                  </Text>
                </View>
              </View>
            )}

            {/* Weather content */}
            {!loading && weather && (
              <>
                {/* Main Weather Display */}
                <View className="items-center mt-8 px-6">
                  {/* Location Time */}
                  <Text className="text-white/80 text-base">{locationTime}</Text>
                  
                  {/* Day/Night Indicator */}
                  <View className="flex-row items-center mt-2 bg-white/20 px-4 py-1.5 rounded-full">
                    <Ionicons 
                      name={isDay ? "sunny" : "moon"} 
                      size={16} 
                      color={isDay ? "#FFD700" : "#E6E6FA"} 
                    />
                    <Text className="text-white/90 text-sm ml-2 font-medium">
                      {isDay ? "Daytime" : "Nighttime"}
                    </Text>
                  </View>

                  {/* Weather Icon */}
                  <View className="my-6">
                    <View className={`p-6 rounded-full ${isDay ? "bg-yellow-400/20" : "bg-indigo-400/20"}`}>
                      <Ionicons name={icon as any} size={80} color="white" />
                    </View>
                  </View>

                  {/* Temperature */}
                  <Text className="text-white text-8xl font-extralight">
                    {Math.round(temp)}°
                  </Text>

                  {/* City Name */}
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="location-sharp" size={20} color="rgba(255,255,255,0.8)" />
                    <Text className="text-white text-2xl font-light ml-2">
                      {city}
                    </Text>
                  </View>

                  {/* Description */}
                  <Text className="text-white/70 text-lg mt-1 capitalize">
                    {description}
                  </Text>
                </View>

                {/* Weather Details Card */}
                <View className="mx-6 mt-10">
                  <View className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                    <Text className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wider">
                      Weather Details
                    </Text>
                    
                    <View className="flex-row justify-between">
                      {/* Humidity */}
                      <View className="items-center flex-1">
                        <View className="bg-white/20 p-3 rounded-2xl mb-3">
                          <Ionicons name="water" size={28} color="white" />
                        </View>
                        <Text className="text-white text-2xl font-semibold">
                          {humidity}%
                        </Text>
                        <Text className="text-white/60 text-sm mt-1">Humidity</Text>
                      </View>

                      {/* Wind */}
                      <View className="items-center flex-1">
                        <View className="bg-white/20 p-3 rounded-2xl mb-3">
                          <Ionicons name="speedometer" size={28} color="white" />
                        </View>
                        <Text className="text-white text-2xl font-semibold">
                          {Math.round(windSpeed)}
                        </Text>
                        <Text className="text-white/60 text-sm mt-1">km/h</Text>
                      </View>

                      {/* Pressure */}
                      <View className="items-center flex-1">
                        <View className="bg-white/20 p-3 rounded-2xl mb-3">
                          <Ionicons name="thermometer" size={28} color="white" />
                        </View>
                        <Text className="text-white text-2xl font-semibold">
                          {pressure}
                        </Text>
                        <Text className="text-white/60 text-sm mt-1">hPa</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Additional Info Cards */}
                <View className="flex-row mx-6 mt-4 gap-4">
                  {/* Sunrise Card */}
                  <View className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                    <View className="flex-row items-center">
                      <Ionicons name="sunny" size={20} color="#FFD700" />
                      <Text className="text-white/70 text-sm ml-2">Sunrise</Text>
                    </View>
                    <Text className="text-white text-2xl font-semibold mt-2">
                      {sunrise}
                    </Text>
                  </View>

                  {/* Sunset Card */}
                  <View className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                    <View className="flex-row items-center">
                      <Ionicons name="moon" size={20} color="#E6E6FA" />
                      <Text className="text-white/70 text-sm ml-2">Sunset</Text>
                    </View>
                    <Text className="text-white text-2xl font-semibold mt-2">
                      {sunset}
                    </Text>
                  </View>
                </View>

                {/* Feels Like & UV Cards */}
                <View className="flex-row mx-6 mt-4 gap-4">
                  {/* Feels Like Card */}
                  <View className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                    <View className="flex-row items-center">
                      <Ionicons name="body" size={20} color="rgba(255,255,255,0.7)" />
                      <Text className="text-white/70 text-sm ml-2">Feels Like</Text>
                    </View>
                    <Text className="text-white text-2xl font-semibold mt-2">
                      {Math.round(temp)}°C
                    </Text>
                  </View>

                  {/* Day/Night Duration Card */}
                  <View className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                    <View className="flex-row items-center">
                      <Ionicons name={isDay ? "sunny-outline" : "moon-outline"} size={20} color="rgba(255,255,255,0.7)" />
                      <Text className="text-white/70 text-sm ml-2">{isDay ? "Day" : "Night"}</Text>
                    </View>
                    <Text className="text-white text-2xl font-semibold mt-2">
                      {isDay ? "☀️ Active" : "🌙 Rest"}
                    </Text>
                  </View>
                </View>

                {/* 24-Hour Forecast */}
                {hourlyForecast.length > 0 && (
                  <View className="mt-6">
                    <View className="px-6 mb-3">
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.8)" />
                        <Text className="text-white/80 text-sm font-semibold ml-2 uppercase tracking-wider">
                          24-Hour Forecast
                        </Text>
                      </View>
                    </View>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                    >
                      {hourlyForecast.map((hour, index) => {
                        const hourWeather = getWeatherInfo(hour.weatherCode, hour.isDay);
                        const isNow = index === 0;
                        return (
                          <View 
                            key={hour.time}
                            className={`items-center p-4 rounded-2xl border ${
                              isNow 
                                ? "bg-white/30 border-white/40" 
                                : "bg-white/15 border-white/20"
                            }`}
                            style={{ minWidth: 70 }}
                          >
                            <Text className={`text-sm font-medium ${isNow ? "text-white" : "text-white/70"}`}>
                              {isNow ? "Now" : formatHour(hour.time)}
                            </Text>
                            <View className="my-3">
                              <Ionicons 
                                name={hourWeather.icon as any} 
                                size={28} 
                                color={isNow ? "white" : "rgba(255,255,255,0.85)"} 
                              />
                            </View>
                            <Text className={`text-lg font-semibold ${isNow ? "text-white" : "text-white/90"}`}>
                              {Math.round(hour.temp)}°
                            </Text>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Air Quality Card */}
                {aqi !== null && (
                  <View className="mx-6 mt-6">
                    <View className={`${aqiInfo.bgColor} backdrop-blur-xl rounded-3xl p-5 border border-white/20`}>
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                          <Ionicons name="leaf" size={22} color={aqiInfo.color} />
                          <Text className="text-white/80 text-sm font-semibold ml-2 uppercase tracking-wider">
                            Air Quality
                          </Text>
                        </View>
                        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: aqiInfo.color }}>
                          <Text className="text-black font-bold text-sm">{aqiInfo.label}</Text>
                        </View>
                      </View>
                      
                      <View className="flex-row justify-between">
                        {/* AQI */}
                        <View className="items-center flex-1">
                          <Text className="text-white text-3xl font-bold" style={{ color: aqiInfo.color }}>
                            {aqi}
                          </Text>
                          <Text className="text-white/60 text-xs mt-1">EU AQI</Text>
                        </View>

                        {/* PM2.5 */}
                        <View className="items-center flex-1">
                          <Text className="text-white text-2xl font-semibold">
                            {pm25?.toFixed(1)}
                          </Text>
                          <Text className="text-white/60 text-xs mt-1">PM2.5 µg/m³</Text>
                        </View>

                        {/* PM10 */}
                        <View className="items-center flex-1">
                          <Text className="text-white text-2xl font-semibold">
                            {pm10?.toFixed(1)}
                          </Text>
                          <Text className="text-white/60 text-xs mt-1">PM10 µg/m³</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Empty state */}
            {!loading && !weather && !error && (
              <View className="items-center justify-center mt-40">
                <Ionicons name="cloud-outline" size={80} color="rgba(255,255,255,0.5)" />
                <Text className="text-white/50 text-center mt-4 text-lg">
                  Search for a city to see the weather
                </Text>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}