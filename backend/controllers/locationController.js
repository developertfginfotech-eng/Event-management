const fs = require('fs');
const path = require('path');

// Load location data
const locationsPath = path.join(__dirname, '../data/locations.json');
let locationData = null;

// Load data on first use
const getLocationData = () => {
  if (!locationData) {
    const rawData = fs.readFileSync(locationsPath);
    locationData = JSON.parse(rawData);
  }
  return locationData;
};

/**
 * @desc    Search for countries
 * @route   GET /api/locations/countries
 * @access  Private
 */
exports.searchCountries = async (req, res) => {
  try {
    const { query } = req.query;
    const data = getLocationData();

    let countries = data.countries;

    // Filter by search query if provided
    if (query) {
      const searchTerm = query.toLowerCase();
      countries = countries.filter((country) =>
        country.name.toLowerCase().includes(searchTerm) ||
        country.code.toLowerCase().includes(searchTerm)
      );
    }

    // Return country names and codes only
    const results = countries.map((country) => ({
      name: country.name,
      code: country.code,
    }));

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching countries',
      error: error.message,
    });
  }
};

/**
 * @desc    Search for states by country
 * @route   GET /api/locations/states
 * @access  Private
 */
exports.searchStates = async (req, res) => {
  try {
    const { country, query } = req.query;

    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Country parameter is required',
      });
    }

    const data = getLocationData();

    // Find the country
    const countryData = data.countries.find(
      (c) => c.name.toLowerCase() === country.toLowerCase() ||
             c.code.toLowerCase() === country.toLowerCase()
    );

    if (!countryData) {
      return res.status(404).json({
        success: false,
        message: 'Country not found',
      });
    }

    let states = countryData.states;

    // Filter by search query if provided
    if (query) {
      const searchTerm = query.toLowerCase();
      states = states.filter((state) =>
        state.name.toLowerCase().includes(searchTerm) ||
        state.code.toLowerCase().includes(searchTerm)
      );
    }

    // Return state names and codes only
    const results = states.map((state) => ({
      name: state.name,
      code: state.code,
    }));

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching states',
      error: error.message,
    });
  }
};

/**
 * @desc    Search for cities by state and country
 * @route   GET /api/locations/cities
 * @access  Private
 */
exports.searchCities = async (req, res) => {
  try {
    const { country, state, query } = req.query;

    if (!country || !state) {
      return res.status(400).json({
        success: false,
        message: 'Country and state parameters are required',
      });
    }

    const data = getLocationData();

    // Find the country
    const countryData = data.countries.find(
      (c) => c.name.toLowerCase() === country.toLowerCase() ||
             c.code.toLowerCase() === country.toLowerCase()
    );

    if (!countryData) {
      return res.status(404).json({
        success: false,
        message: 'Country not found',
      });
    }

    // Find the state
    const stateData = countryData.states.find(
      (s) => s.name.toLowerCase() === state.toLowerCase() ||
             s.code.toLowerCase() === state.toLowerCase()
    );

    if (!stateData) {
      return res.status(404).json({
        success: false,
        message: 'State not found',
      });
    }

    let cities = stateData.cities;

    // Filter by search query if provided
    if (query) {
      const searchTerm = query.toLowerCase();
      cities = cities.filter((city) =>
        city.toLowerCase().includes(searchTerm)
      );
    }

    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching cities',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all location data (countries with states and cities)
 * @route   GET /api/locations/all
 * @access  Private
 */
exports.getAllLocations = async (req, res) => {
  try {
    const data = getLocationData();

    res.status(200).json({
      success: true,
      data: data.countries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching location data',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a specific country with all its states and cities
 * @route   GET /api/locations/country/:name
 * @access  Private
 */
exports.getCountryDetails = async (req, res) => {
  try {
    const { name } = req.params;
    const data = getLocationData();

    const country = data.countries.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() ||
             c.code.toLowerCase() === name.toLowerCase()
    );

    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found',
      });
    }

    res.status(200).json({
      success: true,
      data: country,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching country details',
      error: error.message,
    });
  }
};

/**
 * @desc    Smart location search - searches across countries, states, and cities
 * @route   GET /api/locations/search
 * @access  Private
 */
exports.smartSearch = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required',
      });
    }

    const data = getLocationData();
    const searchTerm = query.toLowerCase();
    const results = [];

    // Search through all locations
    data.countries.forEach((country) => {
      // Check country match
      if (country.name.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'country',
          country: country.name,
          display: country.name,
        });
      }

      // Check state matches
      country.states.forEach((state) => {
        if (state.name.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'state',
            country: country.name,
            state: state.name,
            display: `${state.name}, ${country.name}`,
          });
        }

        // Check city matches
        state.cities.forEach((city) => {
          if (city.toLowerCase().includes(searchTerm)) {
            results.push({
              type: 'city',
              country: country.name,
              state: state.name,
              city: city,
              display: `${city}, ${state.name}, ${country.name}`,
            });
          }
        });
      });
    });

    // Limit results
    const limitedResults = results.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      count: limitedResults.length,
      total: results.length,
      data: limitedResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing smart search',
      error: error.message,
    });
  }
};
