import express, {Request, Response} from "express";import {createLocation, getAllLocation} from "../repository/locationsRepository";const locationRouter = express.Router();locationRouter.get('/', async (req: Request, res: Response) => {	//TODO : Check all argument validation	//TODO : Write the service rules		try {		const locations = await getAllLocation();		res.status(200).json(locations);	} catch (error) {		console.error('Error fetching locations:', error);		res.status(500).json({error: 'Internal Server Error'});	}});locationRouter.post('/', async (req: Request, res: Response) => {	//TODO : Check all argument validation	//TODO : Write the service rules		try {		const newLocation = await createLocation(req.body);		res.status(201).json(newLocation);	} catch (error) {		console.error('Error creating locations:', error);		res.status(500).json({error: 'Internal Server Error'});	}});export default locationRouter;