import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { AUTH } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { clearAuthData, getStoredUser, getToken, setAuthData } from '../../utils/authStorage';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ identifier, password, role }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(AUTH.LOGIN, { identifier, password, role });
      const payload = {
        user: res.data.user,
        token: res.data.token,
      };
      setAuthData(payload);
      return payload;
    } catch (err) {
      return rejectWithValue(
        getApiErrorMessage(err, 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(AUTH.REGISTER, userData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const payload = {
        user: res.data.user,
        token: res.data.token,
      };
      setAuthData(payload);
      return payload;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'خطأ في إنشاء الحساب'));
    }
  }
);

/** تحديث بيانات المستخدم من السيرفر (بعد ريفريش أو للمزامنة). */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await axiosInstance.get(AUTH.ME);
      const user = res.data.user;
      setAuthData({ token, user });
      return user;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

// استرجاع اليوزر من storage لو موجود
const parsedUser = getStoredUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: parsedUser,
    token: getToken() || null,
    role: parsedUser?.role || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      clearAuthData();
    },
    clearError: (state) => {
      state.error = null;
    },
    /** بعد حفظ الملف الشخصي أو أي تحديث محلي للكائن user */
    setAuthUser: (state, action) => {
      if (!action.payload) return;
      state.user = action.payload;
      if (state.token) {
        setAuthData({ token: state.token, user: action.payload });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.role = action.payload.role ?? state.role;
        }
      })
      .addCase(fetchCurrentUser.rejected, () => {});
  },
});

export const { logout, clearError, setAuthUser } = authSlice.actions;
export default authSlice.reducer;