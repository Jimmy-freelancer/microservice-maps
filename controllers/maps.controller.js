const mapService = require('../services/maps.service');
const { validationResult } = require('express-validator');


module.exports.getCoordinates = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.query;

    try {
        const coordinates = await mapService.getAddressCoordinate(address);
        if(!coordinates){
            return res.status(400).json({ message: 'Map Api Key expired' });
        }
        res.status(200).json(coordinates);
    } catch (error) {
        res.status(404).json({ message: 'Coordinates not found' });
    }
}

module.exports.getDistanceTime = async (req, res, next) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { origin, destination } = req.query;

        const distanceTime = await mapService.getDistanceTime(origin, destination);
        if(!distanceTime){
            return res.status(400).json({ message: 'Distance and Time not found' });
        }
        res.status(200).json(distanceTime);

    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports.getAutoCompleteSuggestions = async (req, res, next) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return;
        }
        
        const { input } = req.query;
        const suggestions = await mapService.getAutoCompleteSuggestions(input);
        console.log(suggestions);
        if(!suggestions){
            return res.status(400).json({ message: 'Map Api Key expired' });
        }
        res.status(200).json(suggestions);
        
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports.getTrafficData = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { origin, destination } = req.query;

        if (!origin || !destination) {
            return res.status(400).json({ message: "Origin and Destination are required" });
        }

        const traffic = await mapService.getTrafficData(origin, destination);
        if(!traffic){
            return res.status(400).json({ message: 'Traffic data not found' });
        }
        return res.status(200).json(traffic);

    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}