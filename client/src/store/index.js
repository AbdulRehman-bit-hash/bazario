import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import cartReducer from './slices/cartSlice.js';
import productsReducer from './slices/productsSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
  },
});
