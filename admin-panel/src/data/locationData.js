// Location data for autocomplete
export const countries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
  'Brazil',
  'Mexico',
  'Italy',
  'Spain',
  'South Korea',
  'Russia',
  'Indonesia',
  'Turkey',
  'Saudi Arabia',
  'Argentina',
  'South Africa',
  'Netherlands',
  'Switzerland',
  'Sweden',
  'Poland',
  'Belgium',
  'Norway',
  'Austria',
  'UAE',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Philippines',
  'Vietnam',
  'Bangladesh',
  'Pakistan',
  'Egypt',
  'Nigeria',
  'Kenya',
  'Israel',
  'New Zealand',
  'Ireland',
  'Denmark',
  'Finland',
  'Portugal',
  'Greece',
  'Czech Republic',
  'Romania',
  'Chile',
  'Colombia',
  'Peru'
]

export const statesByCountry = {
  'India': [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
    'Puducherry',
    'Chandigarh',
    'Jammu and Kashmir',
    'Ladakh'
  ],
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ],
  'United Kingdom': [
    'England', 'Scotland', 'Wales', 'Northern Ireland'
  ],
  'Canada': [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
    'Prince Edward Island', 'Quebec', 'Saskatchewan'
  ],
  'Australia': [
    'New South Wales', 'Victoria', 'Queensland', 'South Australia',
    'Western Australia', 'Tasmania', 'Northern Territory',
    'Australian Capital Territory'
  ]
}

export const citiesByState = {
  // India - Maharashtra
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli',
    'Aurangabad', 'Solapur', 'Bhiwandi', 'Amravati', 'Navi Mumbai',
    'Kolhapur', 'Ulhasnagar', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola',
    'Latur', 'Dhule', 'Ahmednagar', 'Ichalkaranji', 'Parbhani', 'Panvel',
    'Yavatmal', 'Achalpur', 'Osmanabad', 'Nanded', 'Satara', 'Wardha'
  ],
  // India - Karnataka
  'Karnataka': [
    'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Davanagere',
    'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar',
    'Hospet', 'Gadag-Betigeri', 'Robertsonpet', 'Hassan', 'Bhadravati',
    'Chitradurga', 'Udupi', 'Kolar', 'Mandya', 'Chikmagalur', 'Gangavati',
    'Bagalkot', 'Ranebennuru'
  ],
  // India - Delhi
  'Delhi': [
    'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
    'Central Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi',
    'South West Delhi', 'Shahdara'
  ],
  // India - Tamil Nadu
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Tirunelveli', 'Tiruppur', 'Ranipet', 'Nagercoil', 'Thanjavur',
    'Vellore', 'Kancheepuram', 'Erode', 'Tiruvannamalai', 'Pollachi',
    'Rajapalayam', 'Sivakasi', 'Pudukkottai', 'Neyveli', 'Nagapattinam',
    'Viluppuram', 'Tiruchengode', 'Vaniyambadi', 'Theni', 'Arakkonam'
  ],
  // India - Gujarat
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
    'Junagadh', 'Gandhidham', 'Nadiad', 'Morbi', 'Surendranagar', 'Bharuch',
    'Anand', 'Porbandar', 'Godhra', 'Veraval', 'Patan', 'Palanpur',
    'Valsad', 'Vapi', 'Gondal', 'Navsari', 'Dahod'
  ],
  // USA - California
  'California': [
    'Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno',
    'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim',
    'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Chula Vista',
    'Fremont', 'San Bernardino', 'Modesto', 'Fontana', 'Oxnard',
    'Moreno Valley', 'Huntington Beach', 'Glendale', 'Santa Clarita',
    'Garden Grove', 'Oceanside', 'Rancho Cucamonga', 'Santa Rosa',
    'Ontario', 'Elk Grove'
  ],
  // USA - Texas
  'Texas': [
    'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso',
    'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland',
    'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'Pasadena',
    'McKinney', 'Mesquite', 'McAllen', 'Killeen', 'Frisco', 'Waco',
    'Carrollton', 'Denton'
  ],
  // USA - New York
  'New York': [
    'New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse',
    'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica',
    'White Plains', 'Hempstead', 'Troy', 'Niagara Falls', 'Binghamton',
    'Freeport', 'Valley Stream'
  ],
  // UK - England
  'England': [
    'London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Newcastle',
    'Sheffield', 'Bristol', 'Leicester', 'Nottingham', 'Coventry',
    'Bradford', 'Southampton', 'Brighton', 'Plymouth', 'Reading',
    'Oxford', 'Cambridge', 'York', 'Norwich', 'Canterbury', 'Bath',
    'Durham', 'Winchester', 'Exeter'
  ],
  // Add more cities for other states as needed
}

export const getStatesForCountry = (country) => {
  return statesByCountry[country] || []
}

export const getCitiesForState = (state) => {
  return citiesByState[state] || []
}
