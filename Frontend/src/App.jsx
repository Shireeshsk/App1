import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TablePagination, Typography, Box, useTheme 
} from '@mui/material';

function App() {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    axios.get('http://10.11.8.205:5000/products')
      .then(res => setProducts(res.data));
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      
      <Paper elevation={3} sx={{ borderRadius: 4 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="product table">
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Name</TableCell>
                <TableCell 
                  align="right" 
                  sx={{ fontWeight: 600, fontSize: '1.1rem' }}
                >
                  Price
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ fontWeight: 600, fontSize: '1.1rem' }}
                >
                  Category
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ fontWeight: 600, fontSize: '1.1rem' }}
                >
                   In Stock
                </TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {products
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product, idx) => (
                  <TableRow 
                    key={idx}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                      '&:hover': { backgroundColor: theme.palette.action.selected }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                    <TableCell align="right">
                      ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
                      {product.category}
                    </TableCell>
                    <TableCell align="center">
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
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={products.length}
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