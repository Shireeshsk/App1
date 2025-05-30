import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Container, Paper, TextField, Button, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Alert
} from '@mui/material';

const server = "10.11.25.153";
const API_BASE = `http://${server}:5000`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const { token } = JSON.parse(auth);
      if (token) {
        setIsAuthenticated(true);
        fetchProducts();
      }
    }
  }, []);

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const getAuthHeaders = () => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const { token } = JSON.parse(auth);
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/register`, registerData);
      showMessage(response.data.message, 'success');
      setRegisterData({ username: '', password: '' });
      setShowLogin(true);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Registration failed', 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/login`, loginData);
      const { token } = response.data;
      localStorage.setItem('auth', JSON.stringify({ token }));
      setIsAuthenticated(true);
      setLoginData({ username: '', password: '' });
      showMessage('Login successful!', 'success');
      fetchProducts();
    } catch (error) {
      showMessage(error.response?.data?.error || 'Login failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    setProducts([]);
    showMessage('Logged out', 'info');
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
        showMessage('Session expired. Please login again.', 'error');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
    setPage(0);
  };

  const handleEditClick = (product) => {
    setEditRowId(product._id);
    setEditFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      inStock: product.inStock
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'inStock' ? value === 'yes' : value
    }));
  };

  const handleSaveClick = async (id) => {
    try {
      await axios.put(`${API_BASE}/products/${id}`, editFormData, {
        headers: getAuthHeaders()
      });
      await fetchProducts();
      setEditRowId(null);
      showMessage('Product updated', 'success');
    } catch {
      showMessage('Update failed', 'error');
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`${API_BASE}/products/${id}`, {
        headers: getAuthHeaders()
      });
      setProducts(prev => prev.filter(p => p._id !== id));
      showMessage('Product deleted', 'success');
    } catch {
      showMessage('Delete failed', 'error');
    }
  };

  return (
    <>
      {/* Top Blue Header */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">Product App</Typography>
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

      {/* Auth Pages */}
      {!isAuthenticated ? (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
          <Typography variant="h4" gutterBottom>{showLogin ? 'Login' : 'Register'}</Typography>
          {message && <Alert severity={messageType} sx={{ mb: 2 }}>{message}</Alert>}

          <Box component="form" onSubmit={showLogin ? handleLogin : handleRegister}>
            <TextField
              fullWidth
              label="Username"
              value={showLogin ? loginData.username : registerData.username}
              onChange={(e) => showLogin
                ? setLoginData({ ...loginData, username: e.target.value })
                : setRegisterData({ ...registerData, username: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={showLogin ? loginData.password : registerData.password}
              onChange={(e) => showLogin
                ? setLoginData({ ...loginData, password: e.target.value })
                : setRegisterData({ ...registerData, password: e.target.value })}
              margin="normal"
              required
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              {showLogin ? 'Login' : 'Register'}
            </Button>
          </Box>
        </Container>
      ) : (
        // Product Table Page
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>Product List</Typography>

          {message && <Alert severity={messageType} sx={{ mb: 2 }}>{message}</Alert>}

          <TextField
            label="Search Products by Name"
            variant="outlined"
            fullWidth
            value={searchInput}
            onChange={handleSearchInput}
            sx={{ mb: 2 }}
          />

          <Paper>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#1976d2' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Price</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Category</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">In Stock</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(product => {
                    const isEditing = editRowId === product._id;
                    return (
                      <TableRow key={product._id}>
                        <TableCell>
                          {isEditing ? (
                            <TextField name="name" value={editFormData.name} onChange={handleInputChange} size="small" />
                          ) : product.name}
                        </TableCell>
                        <TableCell align="right">
                          {isEditing ? (
                            <TextField name="price" value={editFormData.price} onChange={handleInputChange} size="small" />
                          ) : `$${product.price.toFixed(2)}`}
                        </TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <TextField name="category" value={editFormData.category} onChange={handleInputChange} size="small" />
                          ) : product.category}
                        </TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <TextField
                              name="inStock"
                              select
                              SelectProps={{ native: true }}
                              value={editFormData.inStock ? 'yes' : 'no'}
                              onChange={handleInputChange}
                              size="small"
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </TextField>
                          ) : product.inStock ? 'Yes' : 'No'}
                        </TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <Button variant="contained" size="small" onClick={() => handleSaveClick(product._id)}>Save</Button>
                          ) : (
                            <>
                              <Button variant="outlined" size="small" onClick={() => handleEditClick(product)} sx={{ mr: 1 }}>Edit</Button>
                              <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteClick(product._id)}>Delete</Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredProducts.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        </Container>
      )}
    </>
  );
}

export default App;
