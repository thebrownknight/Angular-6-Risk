const standardMap = {
    name: 'standard',
    regions: [
        {
            name: 'North America',
            id: 'na',
            defaultColor: '#f4f4e8',
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
            defaultColor: '#0088db',
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
        }
    ]
};

export { standardMap };
