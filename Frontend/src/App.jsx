import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Typography, Box, useTheme, TextField, Button
} from '@mui/material';

function App() {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get('http://10.11.8.205:5000/products');
    setProducts(res.data);
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
    await axios.put(`http://10.11.8.205:5000/products/${id}`, editFormData);
    await fetchProducts();
    setEditRowId(null);
  };

  const handleDeleteClick = async (id) => {
    await axios.delete(`http://10.11.8.205:5000/products/${id}`);
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '40px auto', padding: theme.spacing(3) }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 600,
          textAlign: 'center',
          mb: 4
        }}
      >
        Product Catalog
      </Typography>

      <TextField
        label="Search Products by Name"
        variant="outlined"
        fullWidth
        value={searchInput}
        onChange={handleSearchInput}
        sx={{ mb: 2 }}
      />

      <Paper elevation={3} sx={{ borderRadius: 4 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="product table">
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Price</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Category</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>In Stock</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => {
                  const isEditing = editRowId === product._id;

                  return (
                    <TableRow
                      key={product._id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                        '&:hover': { backgroundColor: theme.palette.action.selected }
                      }}
                    >
                      <TableCell>
                        {isEditing ? (
                          <TextField
                            name="name"
                            value={editFormData.name}
                            onChange={handleInputChange}
                            size="small"
                          />
                        ) : (
                          product.name
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {isEditing ? (
                          <TextField
                            name="price"
                            type="number"
                            value={editFormData.price}
                            onChange={handleInputChange}
                            size="small"
                          />
                        ) : (
                          `$${product.price.toFixed(2)}`
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {isEditing ? (
                          <TextField
                            name="category"
                            value={editFormData.category}
                            onChange={handleInputChange}
                            size="small"
                          />
                        ) : (
                          product.category
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {isEditing ? (
                          <TextField
                            name="inStock"
                            select
                            value={editFormData.inStock ? 'yes' : 'no'}
                            onChange={handleInputChange}
                            SelectProps={{ native: true }}
                            size="small"
                          >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </TextField>
                        ) : (
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 4,
                              backgroundColor: product.inStock
                                ? theme.palette.success.light
                                : theme.palette.error.light,
                              color: product.inStock
                                ? theme.palette.success.contrastText
                                : theme.palette.error.contrastText,
                              fontWeight: 500
                            }}
                          >
                            {product.inStock ? 'Yes' : 'No'}
                          </Box>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {isEditing ? (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleSaveClick(product._id)}
                          >
                            Save
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleEditClick(product)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClick(product._id)}
                              sx={{ ml: 1 }}
                            >
                              Delete
                            </Button>
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
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-selectLabel': { fontWeight: 500 },
            '& .MuiTablePagination-displayedRows': { fontWeight: 500 }
          }}
        />
      </Paper>
    </Box>
  );
}

export default App;
