const standardMap = {
    name: 'standard',
    regions: [
        {
            name: 'North America',
            id: 'na',
            defaultColor: '#f4f4e8',
            extraTroopsWeight: 5,
            territories: {
                'alaska': {
                    name: 'Alaska',
                    nearbyTerritories: ['northwest_territory', 'alberta', 'asia_kamchatka']
                },
                'alberta': {
                    name: 'Alberta',
                    nearbyTerritories: ['alaska', 'northwest_territory', 'ontario', 'western_united_states']
                },
                'central_america': {
                    name: 'Central America',
                    nearbyTerritories: ['western_united_states', 'eastern_united_states', 'venezuela']
                },
                'eastern_united_states': {
                    name: 'Eastern United States',
                    nearbyTerritories: ['central_america', 'western_united_states', 'quebec', 'ontario']
                },
                'greenland': {
                    name: 'Greenland',
                    nearbyTerritories: ['northwest_territory', 'ontario', 'quebec', 'eur_iceland']
                },
                'northwest_territory': {
                    name: 'Northwest Territory',
                    nearbyTerritories: ['alaska', 'alberta', 'greenland', 'ontario']
                },
                'ontario': {
                    name: 'Ontario',
                    nearbyTerritories: ['alberta', 'northwest_territory', 'greenland', 'quebec',
                    'eastern_united_states', 'western_united_states']
                },
                'quebec': {
                    name: 'Quebec',
                    nearbyTerritories: ['ontario', 'eastern_united_states', 'greenland']
                },
                'western_united_states': {
                    name: 'Western United States',
                    nearbyTerritories: ['alberta', 'central_america', 'eastern_united_states', 'ontario']
                }
            }
        },
        {
            name: 'South America',
            id: 'sa',
            defaultColor: '#acf0f2',
            extraTroopsWeight: 2,
            territories: {
                'argentina': {
                    name: 'Argentina',
                    nearbyTerritories: ['brazil', 'peru']
                },
                'brazil': {
                    name: 'Brazil',
                    nearbyTerritories: ['venezuela', 'peru', 'argentina', 'north_africa']
                },
                'peru': {
                    name: 'Peru',
                    nearbyTerritories: ['venezuela', 'brazil', 'argentina']
                },
                'venezuela': {
                    name: 'Venezuela',
                    nearbyTerritories: ['central_america', 'peru', 'brazil']
                }
            }
        },
        {
            name: 'Europe',
            id: 'eur',
            defaultColor: '#91aa9d',
            extraTroopsWeight: 5,
            territories: {
                'great_britain': {
                    name: 'Great Britain',
                    nearbyTerritories: ['iceland', 'northern_europe', 'scandinavia', 'western_europe']
                },
                'iceland': {
                    name: 'Iceland',
                    nearbyTerritories: ['greenland', 'great_britain', 'scandinavia']
                },
                'northern_europe': {
                    name: 'Northern Europe',
                    nearbyTerritories: ['great_britain', 'scandinavia', 'western_europe', 'southern_europe', 'ukraine']
                },
                'scandinavia': {
                    name: 'Scandinavia',
                    nearbyTerritories: ['great_britain', 'iceland', 'northern_europe',  'ukraine']
                },
                'southern_europe': {
                    name: 'Southern Europe',
                    nearbyTerritories: ['egypt', 'north_africa', 'middle_east',  'western_europe', 'northern_europe', 'ukraine']
                },
                'ukraine': {
                    name: 'Ukraine',
                    nearbyTerritories: ['ural', 'afghanistan', 'middle_east', 'scandinavia', 'northern_europe', 'southern_europe']
                },
                'western_europe': {
                    name: 'Western Europe',
                    nearbyTerritories: ['north_africa', 'great_britain', 'northern_europe', 'southern_europe']
                }
            }
        },
        {
            name: 'Africa',
            id: 'afr',
            defaultColor: '#fff0a5',
            extraTroopsWeight: 3,
            territories: {
                'congo': {
                    name: 'Congo',
                    nearbyTerritories: ['north_africa', 'south_africa', 'east_africa']
                },
                'east_africa': {
                    name: 'East Africa',
                    nearbyTerritories: ['middle_east', 'egypt', 'madagascar', 'congo', 'south_africa']
                },
                'egypt': {
                    name: 'Egypt',
                    nearbyTerritories: ['southern_europe', 'middle_east', 'east_africa', 'north_africa']
                },
                'madagascar': {
                    name: 'Madagascar',
                    nearbyTerritories: ['east_africa', 'south_africa']
                },
                'north_africa': {
                    name: 'North Africa',
                    nearbyTerritories: ['brazil', 'western_europe', 'southern_europe', 'egypt', 'congo', 'east_africa']
                },
                'south_africa': {
                    name: 'South Africa',
                    nearbyTerritories: ['congo', 'east_africa', 'madagascar']
                }
            }
        },
        {
            name: 'Asia',
            id: 'asia',
            defaultColor: '#c77966',
            extraTroopsWeight: 7,
            territories: {
                'afghanistan': {
                    name: 'Afghanistan',
                    nearbyTerritories: ['ukraine', 'middle_east', 'ural', 'china', 'india']
                },
                'china': {
                    name: 'China',
                    nearbyTerritories: ['siam', 'india', 'afghanistan', 'ural', 'siberia', 'mongolia']
                },
                'india': {
                    name: 'India',
                    nearbyTerritories: ['middle_east', 'afghanistan', 'china', 'siam']
                },
                'irkutsk': {
                    name: 'Irkutsk',
                    nearbyTerritories: ['siberia', 'yakutsk', 'kamchatka', 'mongolia']
                },
                'japan': {
                    name: 'Japan',
                    nearbyTerritories: ['kamchatka', 'mongolia']
                },
                'kamchatka': {
                    name: 'Kamchatka',
                    nearbyTerritories: ['alaska', 'yakutsk', 'irkutsk', 'mongolia']
                },
                'middle_east': {
                    name: 'Middle East',
                    nearbyTerritories: ['east_africa', 'egypt', 'southern_europe', 'ukraine', 'afghanistan', 'india']
                },
                'mongolia': {
                    name: 'Mongolia',
                    nearbyTerritories: ['japan', 'china', 'siberia', 'irkutsk', 'kamchatka']
                },
                'siam': {
                    name: 'Siam',
                    nearbyTerritories: ['indonesia', 'india', 'china']
                },
                'siberia': {
                    name: 'Siberia',
                    nearbyTerritories: ['ural', 'yakutsk', 'irkutsk', 'mongolia', 'china']
                },
                'ural': {
                    name: 'Ural',
                    nearbyTerritories: ['ukraine', 'siberia', 'china', 'afghanistan']
                },
                'yakutsk': {
                    name: 'Yakutsk',
                    nearbyTerritories: ['siberia', 'kamchatka', 'irkutsk']
                }
            }
        },
        {
            name: 'Australia',
            id: 'aus',
            defaultColor: '#ff974f',
            extraTroopsWeight: 2,
            territories: {
                'eastern_australia': {
                    name: 'Eastern Australia',
                    nearbyTerritories: ['new_guinea', 'western_australia']
                },
                'indonesia': {
                    name: 'Indonesia',
                    nearbyTerritories: ['siam', 'new_guinea', 'western_australia']
                },
                'new_guinea': {
                    name: 'New Guinea',
                    nearbyTerritories: ['eastern_australia', 'indonesia', 'western_australia']
                },
                'western_australia': {
                    name: 'Western Australia',
                    nearbyTerritories: ['new_guinea', 'eastern_australia', 'indonesia']
                }
            }
        }
    ]
};

export { standardMap };
