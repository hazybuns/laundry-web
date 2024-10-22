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

const CreateClothesTable = () => {
	const [clothType, setClothType] = useState('');
	const [pricePerItem, setPricePerItem] = useState('');
	const [error, setError] = useState(null);
	const [clothes, setClothes] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchText, setSearchText] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

	useEffect(() => {
		const fetchClothes = async () => {
			try {
				const response = await axios.get('http://localhost/flutter/laundry/cloths.php');
				setClothes(response.data);
			} catch (err) {
				console.error('Error fetching clothes:', err);
				setError('Failed to fetch clothes.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchClothes();
	}, []);

	const handleAddCloth = async (e) => {
		e.preventDefault();

		if (!clothType || !pricePerItem) {
			setError('Please fill out all fields.');
			return;
		}

		const clothData = {
			cloth_type: clothType,
			price_per_item: parseFloat(pricePerItem),
		};

		try {
			const response = await axios.post('http://localhost/flutter/laundry/cloths.php', clothData);
			if (response.data.message) {
				setSnackbar({ open: true, message: response.data.message, severity: 'success' });
				setError(null);
				setClothes((prev) => [...prev, { ...clothData, cloth_id: response.data.cloth_id }]);
				setClothType('');
				setPricePerItem('');
			} else if (response.data.error) {
				setError(response.data.error);
				setSnackbar({ open: true, message: response.data.error, severity: 'error' });
			}
		} catch (err) {
			console.error('Error adding cloth:', err);
			setError('Failed to add cloth due to an error.');
			setSnackbar({ open: true, message: 'Failed to add cloth due to an error.', severity: 'error' });
		}
	};

	const filteredClothes = clothes
		.filter((cloth) => cloth.cloth_type.toLowerCase().includes(searchText.toLowerCase()))
		.sort((a, b) => a.cloth_type.localeCompare(b.cloth_type));

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
								Add Cloth
							</Typography>
							<Box component='form' onSubmit={handleAddCloth} noValidate sx={{ mt: 1 }}>
								<TextField
									margin='normal'
									required
									fullWidth
									id='clothType'
									label='Cloth Type'
									name='clothType'
									autoFocus
									value={clothType}
									onChange={(e) => setClothType(e.target.value)}
								/>
								<TextField
									margin='normal'
									required
									fullWidth
									name='pricePerItem'
									label='Price Per Item'
									type='number'
									id='pricePerItem'
									InputProps={{
										startAdornment: <InputAdornment position='start'>₱</InputAdornment>,
									}}
									value={pricePerItem}
									onChange={(e) => setPricePerItem(e.target.value)}
								/>
								<Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
									Add Cloth
								</Button>
							</Box>
						</Paper>
					</Grid>
					<Grid item xs={12} md={6}>
						<Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
							<Typography component='h2' variant='h6' color='primary' gutterBottom>
								List of Clothes
							</Typography>
							<TextField
								margin='normal'
								fullWidth
								id='search'
								label='Search by type'
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
											<TableCell>Cloth Type</TableCell>
											<TableCell align='right'>Price Per Item</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{isLoading ? (
											<TableRow>
												<TableCell colSpan={2} align='center'>
													Loading...
												</TableCell>
											</TableRow>
										) : filteredClothes.length === 0 ? (
											<TableRow>
												<TableCell colSpan={2} align='center'>
													No clothes added yet.
												</TableCell>
											</TableRow>
										) : (
											filteredClothes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cloth) => (
												<TableRow key={cloth.cloth_id}>
													<TableCell>{cloth.cloth_type}</TableCell>
													<TableCell align='right'>₱{parseFloat(cloth.price_per_item).toFixed(2)}</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</TableContainer>
							<TablePagination
								rowsPerPageOptions={[5, 10, 25]}
								component='div'
								count={filteredClothes.length}
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

export default CreateClothesTable;
