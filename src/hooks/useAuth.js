import { useSelector, useDispatch } from "react-redux";
import { logout, loginUserThunk, registerUserThunk, updateProfileThunk } from "../features/auth/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const handleLogin = async (credentials) => {
    return dispatch(loginUserThunk(credentials)).unwrap();
  };

  const handleRegister = async (userData) => {
    return dispatch(registerUserThunk(userData)).unwrap();
  };

  const handleUpdateProfile = async (profileData) => {
    return dispatch(updateProfileThunk(profileData)).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    updateProfile: handleUpdateProfile,
    logout: handleLogout,
  };
};

export default useAuth;
