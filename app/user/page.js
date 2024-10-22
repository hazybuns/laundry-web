'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
	Container,
	Box,
	Typography,
	Card,
	CardContent,
	CardActions,
	Button,
	Grid,
	CircularProgress,
	Snackbar,
	Alert,
	Divider,
} from '@mui/material';
import UserDash from '@/components/userDash';
import OrderDetailsModal from '@/components/OrderDetailsModal';

export default function UserLaundryView() {
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState(null);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const userIdFromUrl = searchParams.get('userId');
		const userIdFromStorage = localStorage.getItem('userId');
		const id = userIdFromUrl || userIdFromStorage;

		if (id) {
			setUserId(id);
		} else {
			console.error('User ID not found');
			setSnackbar({
				open: true,
				message: 'User ID not found. Please log in again.',
				severity: 'error',
			});
			// Redirect to login page after a short delay
			setTimeout(() => router.push('/'), 3000);
		}
	}, [searchParams, router]);

	useEffect(() => {
		const fetchTransactions = async () => {
			if (!userId) return;

			try {
				const response = await axios.get(`http://localhost/flutter/laundry/web_user_transac.php?user_id=${userId}`);
				const filteredTransactions = response.data.filter(
					(transaction) => transaction.status === 'Pending' || transaction.status === 'Ready to Pickup'
				);
				setTransactions(filteredTransactions);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching transactions:', error);
				setSnackbar({
					open: true,
					message: 'Failed to fetch transactions. Please try again later.',
					severity: 'error',
				});
				setLoading(false);
			}
		};

		fetchTransactions();
	}, [userId]);

	const handleCloseSnackbar = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbar({ ...snackbar, open: false });
	};

	const handleOpenModal = (transaction) => {
		setSelectedTransaction(transaction);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setSelectedTransaction(null);
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	return (
		<UserDash>
			<Container maxWidth='lg'>
				<Box sx={{ my: 4 }}>
					<Typography variant='h4' component='h1' gutterBottom style={{ color: 'black' }}>
						Your Laundry Transactions
					</Typography>
					<Divider sx={{ mb: 3 }} />
					{loading ? (
						<Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
							<CircularProgress />
						</Box>
					) : transactions.length > 0 ? (
						<Grid container spacing={3}>
							{transactions.map((transaction) => (
								<Grid item xs={12} sm={6} md={4} key={transaction.transaction_id}>
									<Card elevation={3} sx={{ height: '100%' }}>
										<CardContent>
											<Typography variant='h6' component='div' gutterBottom>
												Transaction ID: {transaction.transaction_id}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Quantity: {transaction.quantity}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Total Price: ₱{parseFloat(transaction.total_price).toFixed(2)}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Status: {transaction.status}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Payment Status: {transaction.payment_status}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Payment Date: {formatDate(transaction.payment_date)}
											</Typography>
										</CardContent>
										<CardActions>
											<Button size='small' color='primary' onClick={() => handleOpenModal(transaction)}>
												View Details
											</Button>
										</CardActions>
									</Card>
								</Grid>
							))}
						</Grid>
					) : (
						<Typography variant='body1' style={{ color: 'black' }}>
						No transactions found.
				</Typography>
					)}
				</Box>
			</Container>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
			{selectedTransaction && (
				<OrderDetailsModal open={modalOpen} handleClose={handleCloseModal} orderDetails={selectedTransaction} />
			)}
		</UserDash>
	);
}
