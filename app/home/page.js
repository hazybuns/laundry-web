'use client';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Card, Typography } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import DashboardLayout from '@/components/dashboard';

const DashboardStats = () => {
	const [dailyIncome, setDailyIncome] = useState(null);
	const [customerCount, setCustomerCount] = useState(null);
	const [monthlyIncome, setMonthlyIncome] = useState(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const [dailyIncomeResponse, customerCountResponse, monthlyIncomeResponse] = await Promise.all([
					axios.get('http://localhost/flutter/laundry/dashboard.php?action=dailyIncome'),
					axios.get('http://localhost/flutter/laundry/dashboard.php?action=customerCount'),
					axios.get('http://localhost/flutter/laundry/dashboard.php?action=monthlyIncome'),
				]);

				setDailyIncome(dailyIncomeResponse.data?.total ?? 0);
				setCustomerCount(customerCountResponse.data?.count ?? 0);
				setMonthlyIncome(monthlyIncomeResponse.data?.total ?? 0);
			} catch (error) {
				console.error('Error fetching dashboard stats:', error);
			}
		};

		fetchStats();
	}, []);

	const StatCard = ({ title, value, description }) => (
		<Col md={4}>
			<Card
				sx={{
					textAlign: 'center',
					padding: '20px',
					marginBottom: '20px',
					backgroundColor: '#ffffff',
					boxShadow: 2,
					borderRadius: 2,
				}}
			>
				<Typography variant='h5' gutterBottom>
					{title}
				</Typography>
				<Typography variant='h4' color='primary'>
					{value}
				</Typography>
				<Typography variant='body2'>{description}</Typography>
			</Card>
		</Col>
	);

	return (
		<DashboardLayout>
			<Container fluid className='mt-5'>
				<Row className='justify-content-center'>
					<StatCard
						title='Daily Income'
						value={`₱${dailyIncome !== null && !isNaN(dailyIncome) ? dailyIncome.toFixed(2) : '0.00'}`}
						description='Total income for today'
					/>
					<StatCard
						title='Customer Count'
						value={customerCount !== null ? customerCount : '0'}
						description='Total customers served today'
					/>
					<StatCard
						title='Monthly Income'
						value={`₱${monthlyIncome !== null && !isNaN(monthlyIncome) ? monthlyIncome.toFixed(2) : '0.00'}`}
						description='Total income for this month'
					/>
				</Row>
			</Container>
		</DashboardLayout>
	);
};

export default DashboardStats;
