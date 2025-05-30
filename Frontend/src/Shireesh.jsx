import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Container, Paper, TextField, Button, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Alert
} from '@mui/material';

// const API_BASE = "http://10.11.25.153:5000"; // Match backend port
const API_BASE = "http://localhost:5000"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchProducts();
    }
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/register`, registerData);
      setMessage(response.data.message);
      setRegisterData({ username: '', password: '' });
      setShowLogin(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/login`, loginData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setLoginData({ username: '', password: '' });
      setMessage('Login successful!');
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setProducts([]);
    setMessage('Logged out');
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/products`, {
        headers: getAuthHeaders()
      });
      setProducts(response.data);
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        handleLogout();
        setMessage('Session expired. Please login again.');
      }
    }
  };

  const handleEditSave = async (id) => {
    try {
      await axios.put(`${API_BASE}/products/${id}`, editFormData, {
        headers: getAuthHeaders()
      });
      await fetchProducts();
      setEditRowId(null);
      setMessage('Product updated');
    } catch {
      setMessage('Update failed');
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`${API_BASE}/products/${id}`, {
        headers: getAuthHeaders()
      });
      setProducts(prev => prev.filter(p => p._id !== id));
      setMessage('Product deleted');
    } catch {
      setMessage('Delete failed');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Product App
          </Typography>
          {!isAuthenticated ? (
            <Box>
              <Button color="inherit" onClick={() => setShowLogin(true)}>Login</Button>
              <Button color="inherit" onClick={() => setShowLogin(false)}>Register</Button>
            </Box>
          ) : (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="md">
        {message && <Alert severity="info" sx={{ my: 2 }}>{message}</Alert>}

        {!isAuthenticated ? (
          <Paper sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              {showLogin ? 'Login' : 'Register'}
            </Typography>
            <form onSubmit={showLogin ? handleLogin : handleRegister}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={showLogin ? loginData.username : registerData.username}
                onChange={(e) => showLogin 
                  ? setLoginData({...loginData, username: e.target.value})
                  : setRegisterData({...registerData, username: e.target.value})}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={showLogin ? loginData.password : registerData.password}
                onChange={(e) => showLogin 
                  ? setLoginData({...loginData, password: e.target.value})
                  : setRegisterData({...registerData, password: e.target.value})}
              />
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ mt: 2 }}
              >
                {showLogin ? 'Login' : 'Register'}
              </Button>
            </form>
          </Paper>
        ) : (
          <>
            <TextField
              fullWidth
              label="Search Products"
              variant="outlined"
              margin="normal"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>In Stock</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.inStock ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <Button 
                            color="primary" 
                            onClick={() => {
                              setEditRowId(product._id);
                              setEditFormData(product);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            color="error" 
                            onClick={() => handleDeleteClick(product._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredProducts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Container>
    </>
  );
}

export default App;
