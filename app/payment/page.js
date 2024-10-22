// PaymentPage.js
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	Box,
	Paper,
	Modal,
	TextField,
	Typography,
	InputAdornment,
	Divider,
	Snackbar,
	Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import DashboardLayout from '@/components/dashboard';

const PaymentPage = () => {
	const [transactions, setTransactions] = useState([]);
	const [openModal, setOpenModal] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [cashTendered, setCashTendered] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'success',
	});

	// Fetch transactions with 'Pending' or 'Ready to Pick-Up' statuses
	useEffect(() => {
		fetchPendingTransactions();
	}, []);

	const fetchPendingTransactions = async () => {
		try {
			const response = await axios.get(
				'http://localhost/flutter/laundry/transac.php?action=fetch_transactions&status=pending_ready'
			);
			if (Array.isArray(response.data)) {
				setTransactions(response.data);
			} else {
				console.error('Expected an array, but got:', response.data);
			}
		} catch (error) {
			console.error('Error fetching transactions', error);
		}
	};

	const handleOpenModal = (transaction) => {
		setSelectedTransaction(transaction);
		setOpenModal(true);
		setCashTendered('');
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		setSelectedTransaction(null);
		setCashTendered('');
	};

	const handleCashTenderedChange = (event) => {
		setCashTendered(event.target.value);
	};

	const calculateChange = () => {
		if (!selectedTransaction || !cashTendered) return 0;
		const change = parseFloat(cashTendered) - parseFloat(selectedTransaction.total_price);
		return change > 0 ? change.toFixed(2) : 0;
	};

	// Function to format the date
	const formatDate = (dateString) => {
		const options = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		};
		return new Date(dateString).toLocaleDateString('en-US', options);
	};

	const handleCloseSnackbar = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbar({ ...snackbar, open: false });
	};

	// Handle the payment action (set payment status to "completed" and status to "Ready to Pick-Up")
	const handlePayment = async () => {
		if (!selectedTransaction) return;

		try {
			const response = await axios.post('http://localhost/flutter/laundry/transac.php', {
				action: 'update_payment_status',
				transaction_id: selectedTransaction.transaction_id,
				payment_status: 'completed',
				status: 'Picked-Up',
			});
			if (response.data.success) {
				setSnackbar({
					open: true,
					message: 'Payment completed successfully!',
					severity: 'success',
				});
				handleCloseModal();
				fetchPendingTransactions();
			} else {
				setSnackbar({
					open: true,
					message: 'Error updating payment status: ' + response.data.error,
					severity: 'error',
				});
			}
		} catch (error) {
			console.error('Error processing payment', error);
			setSnackbar({
				open: true,
				message: 'Error processing payment. Please try again.',
				severity: 'error',
			});
		}
	};

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const filteredTransactions = transactions.filter(
		(transaction) =>
			(transaction.status === 'Pending' || transaction.status === 'Ready to Pick-Up') &&
			transaction.user_name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<DashboardLayout>
			<Box sx={{ mb: 4 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<PaymentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
						<Typography
							variant='h4'
							component='h1'
							sx={{
								fontWeight: 'bold',
								background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}
						>
							Transactions
						</Typography>
					</Box>
					<TextField
						variant='outlined'
						placeholder='Search by customer name'
						value={searchTerm}
						onChange={handleSearchChange}
						sx={{ width: '300px' }}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>
				</Box>
				<Typography variant='subtitle1' sx={{ color: 'text.secondary', mb: 2 }}>
					Manage Pending and Ready-to-Pick-Up Items
				</Typography>
				<Divider sx={{ mb: 3 }} />
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Customer Name</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Total Price</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Date Created</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredTransactions.map((transaction) => (
							<TableRow key={transaction.transaction_id}>
								<TableCell sx={{ color: 'black' }}>{transaction.user_name}</TableCell>
								<TableCell sx={{ color: 'black' }}>{transaction.status}</TableCell>
								<TableCell sx={{ color: 'black' }}>₱{transaction.total_price}</TableCell>
								<TableCell sx={{ color: 'black' }}>{formatDate(transaction.created_at)}</TableCell>
								<TableCell>
									<Button variant='contained' color='primary' onClick={() => handleOpenModal(transaction)}>
										Pay
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Modal open={openModal} onClose={handleCloseModal}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 400,
						bgcolor: 'background.paper',
						boxShadow: 24,
						p: 4,
						borderRadius: 2,
						display: 'flex',
						flexDirection: 'column',
						gap: 3,
					}}
				>
					<Typography variant='h5' component='h2' sx={{ color: 'black', fontWeight: 'bold', mb: 2 }}>
						Payment Details
					</Typography>

					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography sx={{ color: 'black' }}>Total Due:</Typography>
						<Typography sx={{ color: 'black', fontWeight: 'bold', fontSize: '1.2rem' }}>
							₱{selectedTransaction?.total_price}
						</Typography>
					</Box>

					<TextField
						label='Cash Tendered'
						type='number'
						value={cashTendered}
						onChange={handleCashTenderedChange}
						fullWidth
						variant='outlined'
						InputProps={{
							startAdornment: <InputAdornment position='start'>₱</InputAdornment>,
							style: { color: 'black' },
						}}
						InputLabelProps={{
							style: { color: 'rgba(0, 0, 0, 0.6)' },
						}}
					/>

					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
						<Typography sx={{ color: 'black' }}>Change:</Typography>
						<Typography sx={{ color: 'green', fontWeight: 'bold', fontSize: '1.2rem' }}>
							₱{calculateChange()}
						</Typography>
					</Box>

					<Button
						variant='contained'
						color='primary'
						onClick={handlePayment}
						disabled={!cashTendered || parseFloat(cashTendered) < parseFloat(selectedTransaction?.total_price)}
						sx={{ mt: 2, py: 1.5, textTransform: 'none', fontSize: '1rem' }}
					>
						Complete Payment
					</Button>
				</Box>
			</Modal>

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
		</DashboardLayout>
	);
};

export default PaymentPage;
