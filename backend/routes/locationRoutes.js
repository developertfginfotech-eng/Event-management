const express = require('express');
const {
  searchCountries,
  searchStates,
  searchCities,
  getAllLocations,
  getCountryDetails,
  smartSearch,
} = require('../controllers/locationController');

const router = express.Router();
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Search endpoints for autocomplete
router.get('/countries', searchCountries);
router.get('/states', searchStates);
router.get('/cities', searchCities);

// Smart search across all location types
router.get('/search', smartSearch);

// Get all locations or specific country
router.get('/all', getAllLocations);
router.get('/country/:name', getCountryDetails);

module.exports = router;
