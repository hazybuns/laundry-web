import React, { useEffect, useState } from 'react';
import {
	Modal,
	Box,
	Typography,
	TextField,
	Select,
	MenuItem,
	Button,
	Grid,
	InputLabel,
	FormControl,
} from '@mui/material';
import axios from 'axios';

const TransactionModal = ({ visible, onClose, onSuccess }) => {
	const [userId, setUserId] = useState('');
	const [customerName, setCustomerName] = useState('');
	const [clothId, setClothId] = useState('');
	const [detergentId, setDetergentId] = useState('');
	const [quantity, setQuantity] = useState(0);
	const [totalPrice, setTotalPrice] = useState(0);
	const [userOptions, setUserOptions] = useState([]);
	const [clothOptions, setClothOptions] = useState([]);
	const [detergentOptions, setDetergentOptions] = useState([]);

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const usersResponse = await axios.get('http://localhost/flutter/laundry/transac.php?action=fetch_users');
				setUserOptions(usersResponse.data);

				const clothsResponse = await axios.get('http://localhost/flutter/laundry/transac.php?action=fetch_cloths');
				setClothOptions(clothsResponse.data);

				const detergentsResponse = await axios.get(
					'http://localhost/flutter/laundry/transac.php?action=fetch_detergents'
				);
				setDetergentOptions(detergentsResponse.data);
			} catch (error) {
				console.error('Error fetching options', error);
			}
		};

		fetchOptions();
	}, []);

	useEffect(() => {
		const cloth = clothOptions.find((c) => c.id === clothId);
		const detergent = detergentOptions.find((d) => d.id === detergentId);

		const clothPrice = cloth ? parseFloat(cloth.price_per_item) : 0;
		const detergentPrice = detergent ? parseFloat(detergent.price) : 0;

		const qty = parseFloat(quantity) || 0;

		// Calculate total price
		const newTotalPrice = qty * clothPrice + detergentPrice;
		setTotalPrice(isNaN(newTotalPrice) ? 0 : newTotalPrice);
	}, [quantity, clothId, detergentId, clothOptions, detergentOptions]);

	const handleSubmit = async () => {
		try {
			const response = await axios.post('http://localhost/flutter/laundry/transac.php?action=add_transaction', {
				user_id: userId,
				cloth_id: clothId,
				detergent_id: detergentId,
				quantity: quantity,
			});

			if (response && response.data) {
				console.log('Transaction added successfully', response.data);
				message.success('Transaction added successfully!'); // Add success notification
				resetForm(); // Reset the form after a successful submission
				onClose(); // Close the modal
				window.location.reload(); // Refresh the page
			} else {
				console.error('Unexpected response structure', response);
			}
		} catch (error) {
			if (error.response) {
				console.error('API response error:', error.response.data);
				message.error('Failed to add transaction. Please try again.'); // Add error notification
			} else if (error.request) {
				console.error('No response received:', error.request);
			} else {
				console.error('Error:', error.message);
			}
		}
	};

	const resetForm = () => {
		setUserId('');
		setClothId('');
		setDetergentId('');
		setQuantity(0);
		setTotalPrice(0);
		setCustomerName('');
	};

	return (
		<Modal open={visible} onClose={onClose}>
			<Box
				sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 600,
					bgcolor: 'background.paper',
					boxShadow: 24,
					p: 4,
					borderRadius: 2,
					color: 'black',
				}}
			>
				<Typography variant='h6' component='h2' gutterBottom sx={{ color: 'black' }}>
					Add Transaction
				</Typography>
				<form onSubmit={handleSubmit}>
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<FormControl fullWidth>
								<InputLabel sx={{ color: 'black' }}>Customer Name</InputLabel>
								<Select
									value={userId}
									onChange={(e) => {
										setUserId(e.target.value);
										const selectedUser = userOptions.find((user) => user.user_id === e.target.value);
										setCustomerName(selectedUser ? selectedUser.name : '');
									}}
									label='Customer Name'
									required
									sx={{ color: 'black' }}
								>
									{userOptions.map((user) => (
										<MenuItem key={user.user_id} value={user.user_id}>
											{user.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={6}>
							<FormControl fullWidth>
								<InputLabel sx={{ color: 'black' }}>Cloth</InputLabel>
								<Select
									value={clothId}
									onChange={(e) => setClothId(e.target.value)}
									label='Cloth'
									required
									sx={{ color: 'black' }}
								>
									{clothOptions.map((cloth) => (
										<MenuItem key={cloth.id} value={cloth.id}>
											{cloth.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={6}>
							<FormControl fullWidth>
								<InputLabel sx={{ color: 'black' }}>Detergent</InputLabel>
								<Select
									value={detergentId}
									onChange={(e) => setDetergentId(e.target.value)}
									label='Detergent'
									required
									sx={{ color: 'black' }}
								>
									{detergentOptions.map((detergent) => (
										<MenuItem key={detergent.id} value={detergent.id}>
											{detergent.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={6}>
							<TextField
								fullWidth
								label='Kilograms'
								type='number'
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
								required
								InputLabelProps={{ sx: { color: 'black' } }}
								InputProps={{ sx: { color: 'black' } }}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant='subtitle1' sx={{ color: 'black' }}>
								Total Price: {totalPrice.toFixed(2)} PHP
							</Typography>
						</Grid>
					</Grid>
					<Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
						<Button onClick={onClose} sx={{ mr: 1, color: 'black' }}>
							Cancel
						</Button>
						<Button type='submit' variant='contained' color='primary'>
							Add Transaction
						</Button>
					</Box>
				</form>
			</Box>
		</Modal>
	);
};

export default TransactionModal;
