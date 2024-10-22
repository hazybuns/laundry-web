'use client';
import React, { useState, useEffect } from 'react';
import {
	Container,
	Grid,
	Paper,
	Typography,
	TextField,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	InputAdornment,
	Box,
	Snackbar,
	Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import Dashboard from '@/components/dashboard';

const CreateDetergentsTable = () => {
	const [detergentName, setDetergentName] = useState('');
	const [price, setPrice] = useState('');
	const [error, setError] = useState(null);
	const [detergents, setDetergents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchText, setSearchText] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

	useEffect(() => {
		const fetchDetergents = async () => {
			try {
				const response = await axios.get('http://localhost/flutter/laundry/detergent.php');
				setDetergents(response.data);
			} catch (err) {
				console.error('Error fetching detergents:', err);
				setError('Failed to fetch detergents.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchDetergents();
	}, []);

	const handleAddDetergent = async (e) => {
		e.preventDefault();

		if (!detergentName || !price) {
			setError('Please fill out all fields.');
			return;
		}

		const detergentData = {
			detergent_name: detergentName,
			price: parseFloat(price),
		};

		try {
			const response = await axios.post('http://localhost/flutter/laundry/detergent.php', detergentData);
			if (response.data.message) {
				setSnackbar({ open: true, message: response.data.message, severity: 'success' });
				setError(null);
				setDetergents((prev) => [...prev, { ...detergentData, detergent_id: response.data.detergent_id }]);
				setDetergentName('');
				setPrice('');
			} else if (response.data.error) {
				setError(response.data.error);
				setSnackbar({ open: true, message: response.data.error, severity: 'error' });
			}
		} catch (err) {
			console.error('Error adding detergent:', err);
			setError('Failed to add detergent due to an error.');
			setSnackbar({ open: true, message: 'Failed to add detergent due to an error.', severity: 'error' });
		}
	};

	const filteredDetergents = detergents
		.filter((detergent) => detergent.detergent_name.toLowerCase().includes(searchText.toLowerCase()))
		.sort((a, b) => a.detergent_name.localeCompare(b.detergent_name));

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<Dashboard>
			<Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
				<Grid container spacing={3}>
					<Grid item xs={12} md={6}>
						<Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
							<Typography component='h2' variant='h6' color='primary' gutterBottom>
								Add Detergent
							</Typography>
							<Box component='form' onSubmit={handleAddDetergent} noValidate sx={{ mt: 1 }}>
								<TextField
									margin='normal'
									required
									fullWidth
									id='detergentName'
									label='Detergent Name'
									name='detergentName'
									autoFocus
									value={detergentName}
									onChange={(e) => setDetergentName(e.target.value)}
								/>
								<TextField
									margin='normal'
									required
									fullWidth
									name='price'
									label='Price'
									type='number'
									id='price'
									InputProps={{
										startAdornment: <InputAdornment position='start'>₱</InputAdornment>,
									}}
									value={price}
									onChange={(e) => setPrice(e.target.value)}
								/>
								<Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
									Add Detergent
								</Button>
							</Box>
						</Paper>
					</Grid>
					<Grid item xs={12} md={6}>
						<Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
							<Typography component='h2' variant='h6' color='primary' gutterBottom>
								List of Detergents
							</Typography>
							<TextField
								margin='normal'
								fullWidth
								id='search'
								label='Search by name'
								name='search'
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								InputProps={{
									endAdornment: (
										<InputAdornment position='end'>
											<SearchIcon />
										</InputAdornment>
									),
								}}
							/>
							<TableContainer>
								<Table size='small'>
									<TableHead>
										<TableRow>
											<TableCell>Detergent Name</TableCell>
											<TableCell align='right'>Price</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{isLoading ? (
											<TableRow>
												<TableCell colSpan={2} align='center'>
													Loading...
												</TableCell>
											</TableRow>
										) : filteredDetergents.length === 0 ? (
											<TableRow>
												<TableCell colSpan={2} align='center'>
													No detergents added yet.
												</TableCell>
											</TableRow>
										) : (
											filteredDetergents
												.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
												.map((detergent) => (
													<TableRow key={detergent.detergent_id}>
														<TableCell>{detergent.detergent_name}</TableCell>
														<TableCell align='right'>₱{parseFloat(detergent.price).toFixed(2)}</TableCell>
													</TableRow>
												))
										)}
									</TableBody>
								</Table>
							</TableContainer>
							<TablePagination
								rowsPerPageOptions={[5, 10, 25]}
								component='div'
								count={filteredDetergents.length}
								rowsPerPage={rowsPerPage}
								page={page}
								onPageChange={handleChangePage}
								onRowsPerPageChange={handleChangeRowsPerPage}
							/>
						</Paper>
					</Grid>
				</Grid>
			</Container>
			<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
				<Alert
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					severity={snackbar.severity}
					sx={{ width: '100%' }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Dashboard>
	);
};

export default CreateDetergentsTable;
