import express, { Request, Response } from 'express';import Stripe from 'stripe';import {	createDonation,	getAllDonation,	getDonationById,	getDonationsByUserId,	updateDonation} from '../repository/donationRepository';import { addMonths } from 'date-fns';import {prisma} from "../index";import PDFDocument from 'pdfkit';const donationRouter = express.Router();const stripe = new Stripe('sk_test_51PAYakGNSIKaQBU9pSy67gIi627DV10OYHHc5lr7TnZptVISScLpgqc0nQfKqA5nTo9PqourKhyUr8gdJ6eujseE00p0hZIgZ2');donationRouter.get('/', async (req: Request, res: Response) => {	try {		const donations = await getAllDonation();		res.status(200).json(donations);	} catch (error) {		console.error('Error fetching donations:', error);		res.status(500).json({ error: 'Internal Server Error' });	}});donationRouter.get('/:id', async (req: Request, res: Response) => {	try {		const donation = await getDonationById(req.params.id);		if (!donation) {			return res.status(404).json({ error: 'Donation not found' });		}		res.status(200).json(donation);	} catch (error) {		console.error('Error fetching donation by ID:', error);		res.status(500).json({ error: 'Internal Server Error' });	}});donationRouter.get('/user/:userId', async (req: Request, res: Response) => {	try {		const userId = req.params.userId;		const userDonations = await getDonationsByUserId(userId);		if (userDonations.length === 0) {			return res.status(404).json({ error: 'No donations found for this user' });		}		res.status(200).json(userDonations);	} catch (error) {		console.error('Error fetching donations by user ID:', error);		res.status(500).json({ error: 'Internal Server Error' });	}});donationRouter.post('/', async (req: Request, res: Response) => {	try {		const newDonation = await createDonation(req.body);		res.status(201).json(newDonation);	} catch (error) {		console.error('Error creating donation:', error);		res.status(500).json({ error: 'Internal Server Error' });	}});donationRouter.patch('/:id', async (req: Request, res: Response) => {	try {		const { id } = req.params;		const updatedDonation = await updateDonation(id, req.body);				if (!updatedDonation) {			return res.status(404).json({ error: 'Donation not found' });		}				res.status(200).json(updatedDonation);	} catch (error) {		console.error('Error updating donation:', error);		res.status(500).json({ error: 'Internal Server Error' });	}});donationRouter.post('/create-checkout-session', async (req: Request, res: Response) => {	const { amount, userId, type, paymentMethod, message } = req.body;		try {		const session = await stripe.checkout.sessions.create({			payment_method_types: ['card'],			line_items: [				{					price_data: {						currency: 'eur',						product_data: {							name: 'Donation',							metadata: {								userId,								type,								paymentMethod,								message,							},						},						unit_amount: amount,					},					quantity: 1,				},			],			mode: 'payment',			success_url: 'http://localhost:3001/',			cancel_url: 'http://localhost:3001/',		});				console.log('Checkout session created successfully:', session.id);				const transactionDate = new Date();				const donation = await prisma.donation.create({			data: {				status: 'active',				type,				paymentMethod,				message,				amount: amount / 100,				transactionDate,				url: session.url ?? 'default_url',				person: {					connect: { id: userId },				},			},		});				res.status(200).json({ id: session.id, donation });	} catch (err) {		console.error(err);		res.status(500).json({ error: 'An error occurred while creating the checkout session' });	}});donationRouter.get('/generate-pdf/:donationId', async (req: Request, res: Response) => {	try {		const { donationId } = req.params;				// Fetch the donation data from the database		const donation = await prisma.donation.findUnique({			where: {				id: donationId,			},			include: {				person: true, // Include the related person data			},		});				if (!donation) {			return res.status(404).json({ error: 'Donation not found' });		}				// Create a new PDF document		const pdfDoc = new PDFDocument();				// Generate the PDF content based on the fetched data		pdfDoc.text(`Donation ID: ${donation.id}`);		pdfDoc.text(`Status: ${donation.status}`);		pdfDoc.text(`Type: ${donation.type}`);		pdfDoc.text(`Payment Method: ${donation.paymentMethod}`);		pdfDoc.text(`Message: ${donation.message || 'N/A'}`);		pdfDoc.text(`Amount: ${donation.amount}`);		pdfDoc.text(`Transaction Date: ${donation.transactionDate.toLocaleString()}`);		pdfDoc.text(`Person: ${donation.person.firstName} ${donation.person.lastName}`);		// Add more content as needed				// Set the response headers		res.setHeader('Content-Type', 'application/pdf');		res.setHeader('Content-Disposition', 'attachment; filename="donation-receipt.pdf"');				// Pipe the PDF document to the response		pdfDoc.pipe(res);		pdfDoc.end();	} catch (error) {		console.error('Error generating PDF:', error);		res.status(500).json({ error: 'Internal Server Error' });	}});export default donationRouter;