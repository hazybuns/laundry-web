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
	Container,
	Paper,
	IconButton,
	Modal,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Grid,
	Typography,
	Checkbox,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardLayout from '@/components/dashboard';
import TransactionModal from '@/components/addTransacModal'; // Modal for adding transactions

const TransactionApp = () => {
	const [transactions, setTransactions] = useState([]); // Store transactions
	const [showModal, setShowModal] = useState(false); // Modal for adding new transactions
	const [showEditModal, setShowEditModal] = useState(false); // Modal for editing transactions
	const [currentTransaction, setCurrentTransaction] = useState(null); // Current transaction being edited
	const [clothOptions, setClothOptions] = useState([]); // Store cloth options
	const [detergentOptions, setDetergentOptions] = useState([]); // Store detergent options
	const [userOptions, setUserOptions] = useState([]); // Store user options
	const [selectedTransactions, setSelectedTransactions] = useState([]);
	const [bulkStatus, setBulkStatus] = useState('');

	// Fetch initial data on mount
	useEffect(() => {
		fetchData();
		fetchTransactions();
	}, []);

	// Fetch cloths, detergents, and users
	const fetchData = async () => {
		try {
			const [clothRes, detergentRes, userRes] = await Promise.all([
				axios.get('http://localhost/flutter/laundry/transac.php?action=fetch_cloths'),
				axios.get('http://localhost/flutter/laundry/transac.php?action=fetch_detergents'),
				axios.get('http://localhost/flutter/laundry/transac.php?action=fetch_users'),
			]);
			setClothOptions(clothRes.data);
			setDetergentOptions(detergentRes.data);
			setUserOptions(userRes.data);
		} catch (error) {
			console.error('Error fetching data', error);
		}
	};

	// Fetch transactions
	const fetchTransactions = async () => {
		try {
			const response = await axios.get(
				'http://localhost/flutter/laundry/transac.php?action=fetch_pending_transactions'
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

	// Handle editing a transaction
	const handleEdit = (transaction) => {
		setCurrentTransaction(transaction);
		setShowEditModal(true); // Show the edit modal
	};

	// Update the handleDelete function
	const handleDelete = async (transactionId) => {
		if (window.confirm('Are you sure you want to delete this transaction?')) {
			try {
				const response = await axios.post('http://localhost/flutter/laundry/transac.php', {
					action: 'delete_transaction',
					id: transactionId,
				});
				console.log(response.data); // Log the response for debugging
				fetchTransactions(); // Refresh transactions after deletion
			} catch (error) {
				console.error('Error deleting transaction', error);
			}
		}
	};

	// Handle adding a new transaction
	const handleAddTransaction = async (newTransaction) => {
		try {
			const response = await axios.post(
				'http://localhost/flutter/laundry/transac.php?action=add_transaction',
				newTransaction
			);
			if (response.data.message) {
				console.log(response.data.message); // Success message
				fetchTransactions(); // Refresh transactions list
			} else if (response.data.error) {
				console.error('Error adding transaction:', response.data.error);
			}
		} catch (error) {
			console.error('Error adding transaction:', error);
		} finally {
			setShowModal(false); // Close the modal after saving
		}
	};

	// Handle saving edits to a transaction
	// Handle saving edits to a transaction
	const handleSaveEdit = async (updatedTransaction) => {
		try {
			const response = await axios.put(
				'http://localhost/flutter/laundry/edit.php?action=update_transaction',
				{
					transaction_id: updatedTransaction.transaction_id,
					user_id: updatedTransaction.user_id,
					cloth_id: updatedTransaction.cloth_id,
					detergent_id: updatedTransaction.detergent_id,
					quantity: updatedTransaction.quantity,
					total_price: updatedTransaction.total_price,
					status: updatedTransaction.status,
				},
				{
					headers: {
						'Content-Type': 'application/json', // Ensure correct content type
					},
				}
			);

			if (response.data.message) {
				console.log(response.data.message); // Log successful update
				fetchTransactions(); // Refresh transactions list
			} else if (response.data.error) {
				console.error('Error updating transaction:', response.data.error);
			}
		} catch (error) {
			console.error('Error updating transaction:', error);
		} finally {
			setShowEditModal(false); // Close the edit modal after saving
		}
	};

	const handleCheckboxChange = (event, transactionId) => {
		if (event.target.checked) {
			setSelectedTransactions([...selectedTransactions, transactionId]);
		} else {
			setSelectedTransactions(selectedTransactions.filter((id) => id !== transactionId));
		}
	};

	const handleBulkStatusChange = (event) => {
		setBulkStatus(event.target.value);
	};

	const handleBulkUpdate = async () => {
		if (selectedTransactions.length === 0 || !bulkStatus) {
			alert('Please select transactions and a status to update.');
			return;
		}

		try {
			const response = await axios.put('http://localhost/flutter/laundry/edit.php?action=bulk_update_status', {
				transaction_ids: selectedTransactions,
				status: bulkStatus,
			});

			if (response.data.message) {
				console.log(response.data.message);
				fetchTransactions(); // Refresh transactions list
				setSelectedTransactions([]);
				setBulkStatus('');
			} else if (response.data.error) {
				console.error('Error updating transactions:', response.data.error);
			}
		} catch (error) {
			console.error('Error updating transactions:', error);
		}
	};

	// Define columns for the transaction table
	const columns = [
		{
			title: 'Select',
			field: 'checkbox',
			render: (rowData) => (
				<Checkbox
					checked={selectedTransactions.includes(rowData.transaction_id)}
					onChange={(event) => handleCheckboxChange(event, rowData.transaction_id)}
				/>
			),
		},
		{
			title: 'Customer Name',
			field: 'user_id',
			render: (rowData) => {
				const user = userOptions.find((user) => user.user_id === rowData.user_id);
				return user ? user.name : rowData.user_id;
			},
		},
		{
			title: 'Cloth',
			field: 'cloth_id',
			render: (rowData) => {
				const cloth = clothOptions.find((cloth) => cloth.id === rowData.cloth_id);
				return cloth ? cloth.name : rowData.cloth_id;
			},
		},
		{
			title: 'Detergent',
			field: 'detergent_id',
			render: (rowData) => {
				const detergent = detergentOptions.find((detergent) => detergent.id === rowData.detergent_id);
				return detergent ? detergent.name : rowData.detergent_id;
			},
		},
		{
			title: 'Kilograms',
			field: 'quantity',
		},
		{
			title: 'Total Price',
			field: 'total_price',
		},
		{
			title: 'Status',
			field: 'status',
			render: (rowData) => rowData.status,
		},
		{
			title: 'Actions',
			field: 'actions',
			render: (rowData) => (
				<Box>
					<IconButton color='primary' onClick={() => handleEdit(rowData)}>
						<EditIcon />
					</IconButton>
					<IconButton color='secondary' onClick={() => handleDelete(rowData.id)}>
						<DeleteIcon />
					</IconButton>
				</Box>
			),
		},
	];

	return (
		<DashboardLayout>
			<Container>
				{/* Add Transaction Button */}
				<Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
					<Button variant='contained' onClick={() => setShowModal(true)}>
						Add Transaction
					</Button>
					<Box display='flex' alignItems='center'>
						<FormControl sx={{ minWidth: 120, mr: 2 }}>
							<InputLabel id='bulk-status-label'>Status</InputLabel>
							<Select
								labelId='bulk-status-label'
								value={bulkStatus}
								onChange={handleBulkStatusChange}
								label='Bulk Status'
							>
								<MenuItem value='Pending'>Pending</MenuItem>
								<MenuItem value='Ready to Pick-Up'>Ready to Pick-Up</MenuItem>
							</Select>
						</FormControl>
						<Button variant='contained' onClick={handleBulkUpdate}>
							Update
						</Button>
					</Box>
				</Box>

				{/* Transaction Table */}
				<TableContainer component={Paper} mb={3}>
					<Table>
						<TableHead>
							<TableRow>
								{columns.map((column) => (
									<TableCell key={column.title}>{column.title}</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{transactions.map((transaction, index) => (
								<TableRow key={index}>
									{columns.map((column) => (
										<TableCell key={column.field}>
											{column.field === 'actions' ? (
												<Box>
													<IconButton color='primary' onClick={() => handleEdit(transaction)}>
														<EditIcon />
													</IconButton>
													<IconButton color='secondary' onClick={() => handleDelete(transaction.transaction_id)}>
														<DeleteIcon />
													</IconButton>
												</Box>
											) : column.render ? (
												column.render(transaction)
											) : (
												transaction[column.field]
											)}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

				{/* Transaction Modal for Adding */}
				<TransactionModal visible={showModal} onClose={() => setShowModal(false)} onSuccess={handleAddTransaction} />

				{/* Edit Transaction Modal */}
				<Modal
					open={showEditModal}
					onClose={() => setShowEditModal(false)}
					aria-labelledby='edit-transaction-title'
					aria-describedby='edit-transaction-description'
				>
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
						}}
					>
						<Typography variant='h6' component='h2' id='edit-transaction-title' gutterBottom>
							Edit Transaction
						</Typography>
						<Box component='form' noValidate autoComplete='off'>
							<Grid container spacing={2}>
								{/* Customer (User) Field */}
								<Grid item xs={6}>
									<FormControl fullWidth>
										<InputLabel id='customer-label'>Customer</InputLabel>
										<Select
											labelId='customer-label'
											value={currentTransaction?.user_id || ''}
											onChange={(e) =>
												setCurrentTransaction({
													...currentTransaction,
													user_id: e.target.value,
												})
											}
											required
										>
											{userOptions.map((user) => (
												<MenuItem key={user.user_id} value={user.user_id}>
													{user.name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Cloth Field */}
								<Grid item xs={6}>
									<FormControl fullWidth>
										<InputLabel id='cloth-label'>Cloth</InputLabel>
										<Select
											labelId='cloth-label'
											value={currentTransaction?.cloth_id || ''}
											onChange={(e) =>
												setCurrentTransaction({
													...currentTransaction,
													cloth_id: e.target.value,
												})
											}
											required
										>
											{clothOptions.map((cloth) => (
												<MenuItem key={cloth.id} value={cloth.id}>
													{cloth.name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Detergent Field */}
								<Grid item xs={6}>
									<FormControl fullWidth>
										<InputLabel id='detergent-label'>Detergent</InputLabel>
										<Select
											labelId='detergent-label'
											value={currentTransaction?.detergent_id || ''}
											onChange={(e) =>
												setCurrentTransaction({
													...currentTransaction,
													detergent_id: e.target.value,
												})
											}
											required
										>
											{detergentOptions.map((detergent) => (
												<MenuItem key={detergent.id} value={detergent.id}>
													{detergent.name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Quantity Field */}
								<Grid item xs={6}>
									<TextField
										label='Kilograms'
										variant='outlined'
										type='number'
										value={currentTransaction?.quantity || ''}
										onChange={(e) =>
											setCurrentTransaction({
												...currentTransaction,
												quantity: e.target.value,
											})
										}
										fullWidth
										required
									/>
								</Grid>

								{/* Total Price Field (Read-Only) */}
								<Grid item xs={6}>
									<TextField
										label='Total Price'
										variant='outlined'
										type='number'
										value={currentTransaction?.total_price || ''}
										InputProps={{
											readOnly: true,
										}}
										fullWidth
										required
									/>
								</Grid>

								{/* Status Field */}
								<Grid item xs={6}>
									<FormControl fullWidth>
										<InputLabel id='status-select-label'>Status</InputLabel>
										<Select
											labelId='status-select-label'
											value={currentTransaction ? currentTransaction.status : ''}
											onChange={(e) =>
												setCurrentTransaction((prev) => ({
													...prev,
													status: e.target.value,
												}))
											}
										>
											<MenuItem value='Pending'>Pending</MenuItem>
											<MenuItem value='Ready to Pick-Up'>Ready to Pick-Up</MenuItem>
										</Select>
									</FormControl>
								</Grid>
							</Grid>

							<Box display='flex' justifyContent='flex-end' mt={2}>
								<Button
									variant='contained'
									color='primary'
									onClick={() => {
										handleSaveEdit(currentTransaction); // Save the edited transaction
									}}
								>
									Save
								</Button>
							</Box>
						</Box>
					</Box>
				</Modal>
			</Container>
		</DashboardLayout>
	);
};

export default TransactionApp;
