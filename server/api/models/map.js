const mongoose = require('mongoose');

// Represents one territory's information
// 1) Name of territory
// 2) ID of territory
// 3) Nearby territories that can be accessed from the current one
let territorySchema = new mongoose.Schema({
    territoryName: String,
    territoryID: String,
    nearbyTerritories: [String]
});

// Represents a full region/continent that contains territories
// 1) Name of region
// 2) ID of region
// 3) The territories within the region
let regionSchema = new mongoose.Schema({
    regionName: String,
    regionID: String,
    territories: [territorySchema]
});

// Represents the actual map
// 1) Name of map
// 2) The regions/continents in the map
// 3) The individual territories within the map
let mapSchema = new mongoose.Schema({
    name: String,
    regions: [regionSchema],
    territories: [territorySchema]
});

mongoose.model('Map', mapSchema);