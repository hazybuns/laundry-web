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
} from '@mui/material';
import UserDash from '@/components/userDash';
import OrderDetailsModal from '@/components/OrderDetailsModal';

export default function CompletedOrdersView() {
	const [completedOrders, setCompletedOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState(null);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
	const [selectedOrder, setSelectedOrder] = useState(null);
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
			setTimeout(() => router.push('/'), 3000);
		}
	}, [searchParams, router]);

	useEffect(() => {
		const fetchCompletedOrders = async () => {
			if (!userId) return;

			try {
				const response = await axios.get(`http://localhost/flutter/laundry/web_user_transac.php?user_id=${userId}`);
				const filteredOrders = response.data.filter((order) => order.status === 'Picked-Up');
				setCompletedOrders(filteredOrders);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching completed orders:', error);
				setSnackbar({
					open: true,
					message: 'Failed to fetch completed orders. Please try again later.',
					severity: 'error',
				});
				setLoading(false);
			}
		};

		fetchCompletedOrders();
	}, [userId]);

	const handleCloseSnackbar = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbar({ ...snackbar, open: false });
	};

	const handleOpenModal = (order) => {
		setSelectedOrder(order);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setSelectedOrder(null);
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
						Completed Orders
					</Typography>
					{loading ? (
						<Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
							<CircularProgress />
						</Box>
					) : completedOrders.length > 0 ? (
						<Grid container spacing={3}>
							{completedOrders.map((order) => (
								<Grid item xs={12} sm={6} md={4} key={order.transaction_id}>
									<Card elevation={3}>
										<CardContent>
											<Typography variant='h6' component='div' gutterBottom>
												Order ID: {order.transaction_id}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Quantity: {order.quantity}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Total Price: ₱{parseFloat(order.total_price).toFixed(2)}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Status: {order.status}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Payment Status: {order.payment_status}
											</Typography>
											<Typography color='text.secondary' gutterBottom>
												Completion Date: {formatDate(order.payment_date)}
											</Typography>
										</CardContent>
										<CardActions>
											<Button size='small' color='primary' onClick={() => handleOpenModal(order)}>
												View Details
											</Button>
										</CardActions>
									</Card>
								</Grid>
							))}
						</Grid>
					) : (
						<Typography variant='body1'>No completed orders found.</Typography>
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
			{selectedOrder && (
				<OrderDetailsModal open={modalOpen} handleClose={handleCloseModal} orderDetails={selectedOrder} />
			)}
		</UserDash>
	);
}
