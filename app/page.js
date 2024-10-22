'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
	Container,
	Box,
	TextField,
	Button,
	Typography,
	Card,
	CardContent,
	IconButton,
	InputAdornment,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	CircularProgress,
	Snackbar,
	Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, LocalLaundryService as LaundryIcon } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';

const theme = createTheme({
	palette: {
		primary: {
			main: '#1976d2',
		},
		background: {
			default: '#f5f5f5',
		},
	},
});

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [hover, setHover] = useState(false);
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [show, setShow] = useState(false);
	const [name, setName] = useState('');
	const [showRegPassword, setShowRegPassword] = useState(false);
	const [pass, setPass] = useState('');
	const [role, setRole] = useState('user');
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
	const [adminAlert, setAdminAlert] = useState({ open: false, message: '' });

	const handleMouseEnter = () => setHover(true);
	const handleMouseLeave = () => setHover(false);

	const buttonStyle = {
		width: '100%',
		borderRadius: '12px',
		padding: '0.75rem',
		fontWeight: '600',
		color: '#fff',
		backgroundColor: hover ? '#388e3c' : '#4caf50',
		borderColor: hover ? '#388e3c' : '#4caf50',
		boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
		transition: 'background-color 0.3s, transform 0.3s',
		transform: hover ? 'scale(1.05)' : 'scale(1)',
	};

	const handleLogin = async () => {
		const url = 'http://localhost/flutter/laundry/connection.php';
		const formData = new FormData();
		formData.append('action', 'login');
		formData.append('email', email);
		formData.append('password', password);

		setLoading(true);

		try {
			const response = await axios.post(url, formData);
			const data = response.data;

			if (data.message === 'Login successful') {
				// Set auth-token cookie here
				document.cookie = `auth-token=${data.token}; path=/;`;

				if (data.role === 'user') {
					setSnackbar({ open: true, message: 'Login Successful! Redirecting...', severity: 'success' });
					localStorage.setItem('userId', data.id);

					setTimeout(() => {
						router.push(`/user?userId=${data.id}`);
						setLoading(false);
					}, 2000);
				} else if (data.role === 'admin') {
					setAdminAlert({
						open: true,
						message: 'Admin login is not allowed here. Please use the admin login page.',
					});
					setLoading(false);
				} else {
					setSnackbar({ open: true, message: 'Invalid user role. Please contact support.', severity: 'error' });
					setLoading(false);
				}
			} else {
				setSnackbar({ open: true, message: data.error || 'Invalid credentials. Please try again.', severity: 'error' });
				setLoading(false);
			}
		} catch (error) {
			console.error('Error:', error);
			setSnackbar({ open: true, message: 'An error occurred. Please try again later.', severity: 'error' });
			setLoading(false);
		}
	};

	const handleRegistration = async () => {
		if (!isPasswordStrong(pass)) {
			Swal.fire({
				icon: 'error',
				title: 'Weak Password',
				text: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.',
				confirmButtonColor: '#FFA500',
			});
			return;
		}

		const url = 'http://localhost/flutter/laundry/connection.php';

		const formData = new FormData();
		formData.append('action', 'checkEmail');
		formData.append('email', email);

		try {
			const emailCheckResponse = await axios.post(url, formData);
			if (emailCheckResponse.data.exists) {
				setShow(false); // Close the modal before showing the alert
				Swal.fire({
					icon: 'error',
					title: 'Email Already Exists',
					text: 'The email address is already registered. Please use a different email.',
					confirmButtonColor: '#FFA500',
				});
				return;
			}

			formData.set('action', 'register');
			formData.append('name', name);
			formData.append('password', pass);
			formData.append('role', 'user'); // Always set role to "user"

			const response = await axios.post(url, formData);
			if (response.data.message === 'User registered successfully') {
				Swal.fire({
					icon: 'success',
					title: 'Registration Successful!',
					text: 'You have successfully registered as a user!',
					confirmButtonColor: '#FFA500',
				});
				setShow(false); // Close the modal after successful registration
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Registration Failed',
					text: response.data.error || 'Please try again!',
					confirmButtonColor: '#FFA500',
				});
			}
		} catch (error) {
			console.error('Error:', error);
			Swal.fire({
				icon: 'error',
				title: 'An Error Occurred',
				text: 'Something went wrong. Please try again later.',
				confirmButtonColor: '#FFA500',
			});
		}
	};

	const isPasswordStrong = (password) => {
		const minLength = 8;
		const hasUpperCase = /[A-Z]/;
		const hasLowerCase = /[a-z]/;
		const hasNumber = /[0-9]/;
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

		return (
			password.length >= minLength &&
			hasUpperCase.test(password) &&
			hasLowerCase.test(password) &&
			hasNumber.test(password) &&
			hasSpecialChar.test(password)
		);
	};

	const PasswordStrengthMessage = ({ password }) => {
		const getStrength = () => {
			if (password.length === 0) return '';
			if (password.length < 8) return 'Weak';
			if (!/[A-Z]/.test(password)) return 'Weak';
			if (!/[a-z]/.test(password)) return 'Weak';
			if (!/[0-9]/.test(password)) return 'Weak';
			if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Weak';
			return 'Strong';
		};

		const strength = getStrength();
		let color;
		switch (strength) {
			case 'Weak':
				color = 'red';
				break;
			case 'Strong':
				color = 'green';
				break;
			default:
				color = 'grey';
				break;
		}

		return <div style={{ color }}>{`Password Strength: ${strength}`}</div>;
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		handleLogin();
	};

	const handleKeyPress = useCallback(
		(event) => {
			if (event.key === 'Enter') {
				handleSubmit(event);
			}
		},
		[handleSubmit]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [handleKeyPress]);

	return (
		<ThemeProvider theme={theme}>
			<Box
				sx={{
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'linear-gradient(45deg, #ffffff 0%, #1976d2 100%)',
				}}
			>
				<Container maxWidth='xs'>
					<Card
						elevation={6}
						sx={{
							borderRadius: 4,
							overflow: 'hidden',
							backdropFilter: 'blur(10px)',
							backgroundColor: 'rgba(255, 255, 255, 0.8)',
						}}
					>
						<CardContent sx={{ p: 4 }}>
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
								<Typography component='h1' variant='h4' fontWeight='bold' color='primary.main' gutterBottom>
									Welcome Back!
								</Typography>
								<LaundryIcon sx={{ fontSize: 64, color: 'primary.main', mt: 2 }} />
							</Box>
							<Box component='form' onSubmit={handleSubmit} noValidate>
								<TextField
									margin='normal'
									required
									fullWidth
									id='email'
									label='Email Address'
									name='email'
									autoComplete='email'
									autoFocus
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									variant='outlined'
									sx={{ mb: 2 }}
								/>
								<TextField
									margin='normal'
									required
									fullWidth
									name='password'
									label='Password'
									type={showPassword ? 'text' : 'password'}
									id='password'
									autoComplete='current-password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									variant='outlined'
									sx={{ mb: 3 }}
									InputProps={{
										endAdornment: (
											<InputAdornment position='end'>
												<IconButton
													aria-label='toggle password visibility'
													onClick={() => setShowPassword(!showPassword)}
													edge='end'
												>
													{showPassword ? <VisibilityOff /> : <Visibility />}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>
								<Button
									type='submit'
									fullWidth
									variant='contained'
									sx={{
										mt: 2,
										mb: 3,
										py: 1.5,
										fontSize: '1.1rem',
										borderRadius: 2,
										boxShadow: '0 4px 6px rgba(25, 118, 210, 0.25)',
										'&:hover': {
											boxShadow: '0 6px 8px rgba(25, 118, 210, 0.35)',
										},
									}}
									disabled={loading}
								>
									{loading ? <CircularProgress size={24} /> : 'Login'}
								</Button>
								<Box sx={{ textAlign: 'center' }}>
									<Typography variant='body1'>
										Don&apos;t have an account?{' '}
										<Button
											color='primary'
											onClick={() => setShow(true)}
											sx={{ fontWeight: 'bold', textTransform: 'none' }}
										>
											Register
										</Button>
									</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Container>

				{/* Registration Dialog */}
				<Dialog open={show} onClose={() => setShow(false)} PaperProps={{ style: { borderRadius: 16 } }}>
					<DialogTitle>Register</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin='dense'
							id='name'
							label='Name'
							type='text'
							fullWidth
							value={name}
							onChange={(e) => setName(e.target.value)}
							variant='outlined'
							sx={{ mb: 2 }}
						/>
						<TextField
							margin='dense'
							id='reg-email'
							label='Email Address'
							type='email'
							fullWidth
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							variant='outlined'
							sx={{ mb: 2 }}
						/>
						<TextField
							margin='dense'
							id='reg-password'
							label='Password'
							type={showRegPassword ? 'text' : 'password'}
							fullWidth
							value={pass}
							onChange={(e) => setPass(e.target.value)}
							variant='outlined'
							sx={{ mb: 2 }}
							InputProps={{
								endAdornment: (
									<InputAdornment position='end'>
										<IconButton
											aria-label='toggle password visibility'
											onClick={() => setShowRegPassword(!showRegPassword)}
											edge='end'
										>
											{showRegPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
						<PasswordStrengthMessage password={pass} />
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 3 }}>
						<Button onClick={() => setShow(false)} variant='outlined'>
							Cancel
						</Button>
						<Button onClick={handleRegistration} disabled={loading} variant='contained'>
							{loading ? <CircularProgress size={24} /> : 'Register'}
						</Button>
					</DialogActions>
				</Dialog>

				{/* Admin Login Alert */}
				{adminAlert.open && (
					<Alert
						severity='error'
						onClose={() => setAdminAlert({ ...adminAlert, open: false })}
						sx={{
							position: 'fixed',
							top: 16,
							left: '50%',
							transform: 'translateX(-50%)',
							width: 'auto',
							maxWidth: '90%',
						}}
					>
						{adminAlert.message}
					</Alert>
				)}

				{/* Snackbar for notifications */}
				<Snackbar
					open={snackbar.open}
					autoHideDuration={6000}
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				>
					<Alert
						onClose={() => setSnackbar({ ...snackbar, open: false })}
						severity={snackbar.severity}
						sx={{ width: '100%' }}
					>
						{snackbar.message}
					</Alert>
				</Snackbar>
			</Box>
		</ThemeProvider>
	);
}
