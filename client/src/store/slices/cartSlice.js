import { createSlice } from '@reduxjs/toolkit';

// ─────────────────────────────────────────────────────────────────────────
// PER-USER CART STORAGE
//
// Problem this solves:
// The cart used to live under one single shared key ("bazario_cart") in
// localStorage, with no idea who was logged in. That meant:
//   1. Logging out never cleared the cart (only the user object was removed)
//   2. Switching accounts on the same browser showed the PREVIOUS
//      account's cart, because there was only ever one shared bucket
//
// Fix: the cart key now includes the current user's id, e.g.
//   "bazario_cart_64fa21..."   for a logged-in user
//   "bazario_cart_guest"      for nobody logged in
// Each account gets its own isolated cart that persists across refreshes,
// but never crosses over to a different account.
// ─────────────────────────────────────────────────────────────────────────

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('bazario_user') || 'null');
    return user?._id || 'guest';
  } catch {
    return 'guest';
  }
}

function getCartKey() {
  return `bazario_cart_${getCurrentUserId()}`;
}

function loadCart() {
  const saved = localStorage.getItem(getCartKey());
  return saved ? JSON.parse(saved) : [];
}

function saveCart(items) {
  localStorage.setItem(getCartKey(), JSON.stringify(items));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.product._id === product._id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        state.items.push({ product, quantity });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.product._id !== action.payload);
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (item) item.quantity = quantity;
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem(getCartKey());
    },
    // Called right after login/logout/account-switch to load the
    // correct cart for whoever is now signed in (or the guest cart
    // if nobody is signed in).
    reloadCartForCurrentUser: (state) => {
      state.items = loadCart();
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  reloadCartForCurrentUser,
} = cartSlice.actions;

// Selectors
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => {
    const price = i.product.discountPrice || i.product.price;
    return sum + price * i.quantity;
  }, 0);

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export default cartSlice.reducer;
