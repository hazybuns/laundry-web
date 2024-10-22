'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard';
import {
	Container,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Box,
	TextField,
	MenuItem,
	Button,
} from '@mui/material';
import * as XLSX from 'xlsx';

const DashboardStats = () => {
	const [transactions, setTransactions] = useState([]);
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

	useEffect(() => {
		fetchTransactions();
	}, [selectedMonth, selectedYear]);

	const fetchTransactions = async () => {
		try {
			const month = selectedMonth.toString().padStart(2, '0');
			const year = selectedYear.toString();
			const response = await axios.get(
				`http://localhost/flutter/laundry/transac.php?action=fetchCompletedTransactions&month=${year}-${month}`
			);
			console.log(response.data);
			setTransactions(response.data.transactions || []);
		} catch (error) {
			console.error('Error fetching transactions:', error);
		}
	};

	const months = [
		{ value: 1, label: 'January' },
		{ value: 2, label: 'February' },
		{ value: 3, label: 'March' },
		{ value: 4, label: 'April' },
		{ value: 5, label: 'May' },
		{ value: 6, label: 'June' },
		{ value: 7, label: 'July' },
		{ value: 8, label: 'August' },
		{ value: 9, label: 'September' },
		{ value: 10, label: 'October' },
		{ value: 11, label: 'November' },
		{ value: 12, label: 'December' },
	];

	const exportToExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(
			transactions.map((t) => ({
				'Customer Name': t.customerName,
				Date: new Date(t.date).toLocaleDateString(),
				Amount: `₱${parseFloat(t.amount).toFixed(2)}`,
				Status: t.status,
			}))
		);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

		// Generate buffer
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

		// Save to file
		const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		const fileName = `Transactions_${months.find((m) => m.value === selectedMonth).label}_${selectedYear}.xlsx`;

		if (window.navigator && window.navigator.msSaveOrOpenBlob) {
			// For IE
			window.navigator.msSaveOrOpenBlob(data, fileName);
		} else {
			// For other browsers
			const link = document.createElement('a');
			link.href = window.URL.createObjectURL(data);
			link.download = fileName;
			link.click();
		}
	};

	return (
		<DashboardLayout>
			<Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
				<Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, gap: 2 }}>
					<TextField
						select
						label='Month'
						value={selectedMonth}
						onChange={(e) => setSelectedMonth(e.target.value)}
						sx={{ width: 200 }}
					>
						{months.map((month) => (
							<MenuItem key={month.value} value={month.value}>
								{month.label}
							</MenuItem>
						))}
					</TextField>
					<TextField
						label='Year'
						type='number'
						value={selectedYear}
						onChange={(e) => setSelectedYear(e.target.value)}
						sx={{ width: 100 }}
					/>
					<Button variant='contained' color='primary' onClick={exportToExcel}>
						Export to Excel
					</Button>
				</Box>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label='transaction table'>
						<TableHead>
							<TableRow>
								<TableCell>Customer Name</TableCell>
								<TableCell>Date</TableCell>
								<TableCell>Amount</TableCell>
								<TableCell>Status</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{transactions.length > 0 ? (
								transactions.map((transaction) => (
									<TableRow key={transaction.id}>
										<TableCell>{transaction.customerName}</TableCell>
										<TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
										<TableCell>{`₱${parseFloat(transaction.amount).toFixed(2)}`}</TableCell>
										<TableCell>{transaction.status}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={4} align='center'>
										<Typography variant='body1'>No completed transactions found for this month.</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Container>
		</DashboardLayout>
	);
};

export default DashboardStats;
