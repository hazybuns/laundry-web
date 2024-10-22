import React from 'react';
import { Modal, Box, Typography, Card, CardContent, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	boxShadow: 24,
	p: 4,
	borderRadius: 2,
};

const OrderDetailsModal = ({ open, handleClose, orderDetails }) => {
	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby='order-details-modal-title'
			aria-describedby='order-details-modal-description'
		>
			<Box sx={style}>
				<Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
					<Typography variant='h6' id='order-details-modal-title'>
						Order Details
					</Typography>
					<IconButton onClick={handleClose}>
						<CloseIcon />
					</IconButton>
				</Box>
				<Divider sx={{ mb: 2 }} />
				<Card elevation={0}>
					<CardContent>
						<Typography variant='subtitle1' gutterBottom>
							Order ID: {orderDetails.transaction_id}
						</Typography>
						<Typography color='text.secondary' gutterBottom>
							Quantity: {orderDetails.quantity}
						</Typography>
						<Typography color='text.secondary' gutterBottom>
							Total Price: ₱{parseFloat(orderDetails.total_price).toFixed(2)}
						</Typography>
						<Typography color='text.secondary' gutterBottom>
							Status: {orderDetails.status}
						</Typography>
						<Typography color='text.secondary' gutterBottom>
							Payment Status: {orderDetails.payment_status}
						</Typography>
						<Typography color='text.secondary' gutterBottom>
							Completion Date: {formatDate(orderDetails.payment_date)}
						</Typography>
					</CardContent>
				</Card>
			</Box>
		</Modal>
	);
};

export default OrderDetailsModal;
