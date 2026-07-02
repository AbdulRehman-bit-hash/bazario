import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (slug, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${slug}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    pagination: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.products;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProduct.pending, (s) => { s.loading = true; s.currentProduct = null; })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.loading = false; s.currentProduct = a.payload; })
      .addCase(fetchProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export default productsSlice.reducer;
