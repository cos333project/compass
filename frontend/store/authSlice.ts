// import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// interface AuthResponse {
//     authenticated: boolean;
//   }
  
// // Async Thunk for checking authentication
// export const checkAuthentication = createAsyncThunk(
//   'auth/checkAuthentication',
//   async () => {
//     const response = await fetch(`http://localhost:8000/auth/is_authenticated/`, {
//       credentials: 'include',
//     });
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const data: AuthResponse = await response.json();
//     return data.authenticated;
//   }
// );

// interface AuthState {
//     isLoggedIn: boolean;
//     hasCheckedAuthentication: boolean;
//     error: string | null;
//   }
  
//   const initialState: AuthState = {
//     isLoggedIn: false,
//     hasCheckedAuthentication: false,
//     error: null,
//   };
  
//   const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {},
//     extraReducers: (builder) => {
//       builder
//         .addCase(checkAuthentication.pending, (state) => {
//           state.hasCheckedAuthentication = false;
//         })
//         .addCase(checkAuthentication.fulfilled, (state, action) => {
//           state.isLoggedIn = action.payload;
//           state.hasCheckedAuthentication = true;
//         })
//         .addCase(checkAuthentication.rejected, (state, action) => {
//           state.hasCheckedAuthentication = true;
//           state.error = action.error.message || null;
//         });
//     },
//   });  

// export default authSlice.reducer;
  