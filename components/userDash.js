'use client';
import React, { useState } from 'react';
import {
	AppBar,
	Toolbar,
	IconButton,
	Typography,
	Drawer,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	CssBaseline,
	Box,
	Divider,
	useMediaQuery,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Button,
} from '@mui/material';
import {
	Home as HomeIcon,
	Receipt as OrdersIcon,
	Logout as LogoutIcon,
	Menu as MenuIcon,
	LocalLaundryService as LaundryLogoIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

const drawerWidth = 280;

const UserDash = ({ children }) => {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
	const isMobile = useMediaQuery('(max-width: 900px)');
	const router = useRouter();
	const pathname = usePathname();

	const handleLogoutClick = () => {
		setLogoutDialogOpen(true);
	};

	const handleLogoutConfirm = () => {
		setLogoutDialogOpen(false);
		// Implement your logout logic here
		router.push('/');
	};

	const handleLogoutCancel = () => {
		setLogoutDialogOpen(false);
	};

	const toggleDrawer = () => setDrawerOpen(!drawerOpen);

	const handleMenuItemClick = (link) => {
		if (isMobile) {
			setDrawerOpen(false);
		}
		router.push(link);
	};

	const drawerItems = [
		{ text: 'Dashboard', icon: <HomeIcon />, link: '/user' },
		{ text: 'Completed Orders', icon: <OrdersIcon />, link: '/orders' },
	];

	const drawerStyles = {
		width: drawerWidth,
		flexShrink: 0,
		'& .MuiDrawer-paper': {
			width: drawerWidth,
			boxSizing: 'border-box',
		},
	};

	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />

			{/* Sidebar Drawer */}
			<Drawer
				variant={isMobile ? 'temporary' : 'persistent'}
				open={drawerOpen || !isMobile}
				onClose={toggleDrawer}
				sx={{
					...drawerStyles,
					zIndex: isMobile ? 1400 : 1000,
					'& .MuiDrawer-paper': {
						...drawerStyles['& .MuiDrawer-paper'],
						zIndex: isMobile ? 1400 : 1000,
					},
				}}
			>
				{/* Logo Section */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '20px 0',
						flexDirection: 'column',
					}}
				>
					<LaundryLogoIcon sx={{ fontSize: 60, color: '#1976D2' }} />
					<Typography variant='h6' sx={{ marginTop: 1 }}>
						Laundry Shop System
					</Typography>
				</Box>

				<Divider />

				{/* Sidebar Links */}
				<List>
					{drawerItems.map((item, index) => (
						<ListItem
							button
							key={index}
							onClick={() => handleMenuItemClick(item.link)}
							sx={{
								backgroundColor: pathname === item.link ? '#1976D2' : 'transparent',
								'&:hover': {
									backgroundColor: pathname === item.link ? '#1565C0' : 'rgba(0, 0, 0, 0.04)',
								},
							}}
						>
							<ListItemIcon sx={{ color: pathname === item.link ? 'white' : 'inherit' }}>{item.icon}</ListItemIcon>
							<ListItemText
								primary={item.text}
								sx={{
									'& .MuiListItemText-primary': {
										color: pathname === item.link ? 'white' : 'inherit',
									},
								}}
							/>
						</ListItem>
					))}
				</List>
			</Drawer>

			{/* AppBar */}
			<AppBar
				position='fixed'
				sx={{
					zIndex: (theme) => theme.zIndex.drawer + 1,
					width: { sm: `calc(100% - ${drawerWidth}px)` },
					ml: { sm: `${drawerWidth}px` },
				}}
			>
				<Toolbar>
					<IconButton color='inherit' edge='start' onClick={toggleDrawer} sx={{ mr: 2, display: { sm: 'none' } }}>
						<MenuIcon />
					</IconButton>
					<Typography variant='h6' sx={{ flexGrow: 1 }}>
						Laundry System
					</Typography>
					<IconButton color='inherit' onClick={handleLogoutClick}>
						<LogoutIcon />
					</IconButton>
				</Toolbar>
			</AppBar>

			{/* Main Content */}
			<Box
				component='main'
				sx={{
					flexGrow: 1,
					p: 3,
					mt: '64px',
					width: { sm: `calc(100% - ${drawerWidth}px)` },
				}}
			>
				{children}
			</Box>

			{/* Logout Confirmation Dialog */}
			<Dialog
				open={logoutDialogOpen}
				onClose={handleLogoutCancel}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
			>
				<DialogTitle id='alert-dialog-title'>{'Confirm Logout'}</DialogTitle>
				<DialogContent>
					<DialogContentText id='alert-dialog-description'>Are you sure you want to log out?</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleLogoutCancel} color='primary'>
						Cancel
					</Button>
					<Button onClick={handleLogoutConfirm} color='primary' autoFocus>
						Logout
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default UserDash;
