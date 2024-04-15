import express, {Request, Response} from "express";import {createPerson, getAllPerson, getPersonById, updatePerson} from "../repository/personRepository";const personRouter = express.Router();personRouter.get('/', async (req: Request, res: Response) => {	//TODO : Check all argument validation	//TODO : Write the service rules		try {		const persons = await getAllPerson();		res.status(200).json(persons);	} catch (error) {		console.error('Error fetching persons:', error);		res.status(500).json({error: 'Internal Server Error'});	}});personRouter.get('/:id', async (req: Request, res: Response) => {	//TODO : Check all argument validation	//TODO : Write the service rules		try {		const person = await getPersonById(req.params.id);		if (!person) {			return res.status(404).json({ error: 'Person not found' });		}		res.status(200).json(person);	} catch (error) {		console.error('Error fetching person by ID:', error);		res.status(500).json({ error: 'Internal Server Error' });	}});personRouter.post('/', async (req: Request, res: Response) => {	//TODO : Check all argument validation	//TODO : Write the service rules		try {		const newPerson = await createPerson(req.body);		res.status(201).json(newPerson);	} catch (error) {		console.error('Error creating person:', error);		res.status(500).json({error: 'Internal Server Error'});	}});personRouter.patch('/:id', async (req: Request, res: Response) => {	// TODO: Check all argument validation	// TODO: Write the service rules		try {		const { id } = req.params;		const updatedPerson = await updatePerson(id, req.body);				if (!updatedPerson) {			return res.status(404).json({ error: 'Person not found' });		}				res.status(200).json(updatedPerson);	} catch (error) {		console.error('Error updating person:', error);		res.status(500).json({ error: 'Internal Server Error' });	}});export default personRouter;