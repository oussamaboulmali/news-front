/**
 * Login Page Component
 * 
 * Handles user authentication with the following features:
 * - Username and password validation
 * - SQL injection detection
 * - Session management (handles concurrent sessions)
 * - Password visibility toggle
 * - Responsive design (mobile and desktop)
 * - Encrypted credential storage
 * - Security logging for suspicious activities
 * 
 * Security Features:
 * - Input sanitization and validation
 * - SQL injection detection
 * - Password strength validation (6-20 characters)
 * - Automatic blocking on suspicious activities
 * - Encrypted localStorage for credentials
 * 
 * @component
 * @requires @mui/material - UI components
 * @requires react-toastify - Toast notifications
 * @requires crypto-js - Encryption for secure storage
 * 
 * @example
 * <Login />
 */

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { ContextProvider } from "../../Context/contextProvider";
import { useContext, useEffect, useState } from "react";
import Logo from "../../assets/images/Logos/Logo-news.png";
import Session from "../../assets/images/session.png";
import { useAxios } from "../../services/useAxios";
import ConfirmDialog from "../../UI/Alerts/ConfirmDialogue";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { mdiAlertCircleOutline, mdiEye, mdiEyeOff } from "@mdi/js";
import { useMediaQuery } from "react-responsive";
import * as Gfunc from "../../helpers/Gfunc";
import Icon from "@mdi/react";
import log from "../../Log/costumLog";
import BgImage from "../../assets/images/Logos/bg.jpg";
import CryptoJS from "crypto-js";

const Login = () => {
  const { handleValidateLogin, baseUrl, prefixe, secretKey } =
    useContext(ContextProvider);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [icon, setIcon] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  // Utilisation de useAxios pour connecter
  const {
    response,
    loading,
    error,
    fetchData: fetchSignIn,
    clearData,
  } = useAxios({
    method: "post",
    url: baseUrl + "auth/login",
    body: {
      username: username,
      password: password,
    },
  });

  // Utilisation de useAxios pour fermer la premiere session ouverte
  const {
    response: CloseResponse,
    loading: CloseLoading,
    error: CloseError,
    fetchData: fetchCloseSession,
    clearData: CloseClearData,
  } = useAxios({
    method: "post",
    url: baseUrl + "auth/close",
    body: {
      sessionId: response?.data?.data?.sessionId,
      userId: response?.data?.data?.userId,
      username: username,
      password: password,
    },
  });

  const confirmOpenSesssion = (rsp) => {
    localStorage.setItem(
      "isLogged" + prefixe,
      CryptoJS.AES.encrypt("true", secretKey)
    );
    localStorage.setItem(
      "langId" + prefixe,
      CryptoJS.AES.encrypt(rsp?.data?.data?.lang?.toString(), secretKey)
    );
    localStorage.setItem(
      "username" + prefixe,
      CryptoJS.AES.encrypt(username, secretKey).toString()
    );
    handleValidateLogin(rsp?.data?.data?.lang);
  };

  //tester la response su service de connexion
  useEffect(() => {
    if (
      response &&
      response?.data?.success &&
      response.data.hasSession === false
    ) {
      confirmOpenSesssion(response);
    }
    if (
      response &&
      response.data.success === true &&
      response.data.hasSession === true
    ) {
      setOpenDialog(true);
      setMsg("Vous avez déjà une session, êtes-vous sûr de continuer ?");
      setIcon(Session);
    }
  }, [response, username]);

  //tester la response su service de connexion
  useEffect(() => {
    if (error) {
      setUsername("");
      setPassword("");
    }
  }, [error]);

  //tester la response de la fermeture d'une autre session ouverte
  useEffect(() => {
    if (CloseResponse && CloseResponse?.data?.success) {
      confirmOpenSesssion(CloseResponse);
    }
  }, [CloseResponse]);

  //tester la response su service de connexion
  useEffect(() => {
    if (CloseError) {
      toast.error(CloseError, {
        icon: mdiAlertCircleOutline,
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [CloseError]);

  const confirmAction = () => {
    fetchCloseSession();
  };

  const concleAction = () => {
    setUsername("");
    setPassword("");
    setOpenDialog(false);
    clearData();
  };

  /**
   * Handles login form submission with security validation
   * 
   * Performs the following checks:
   * 1. SQL injection detection on username and password
   * 2. Password length validation (6-20 characters)
   * 3. Logs suspicious activity attempts
   * 4. Triggers authentication request
   * 
   * @function handleLogin
   * @param {Event} event - Form submission event
   * @returns {void}
   * 
   * @security
   * - Detects and logs SQL injection attempts
   * - Validates password constraints
   * - Blocks IP on malicious input detection
   */
  const handleLogin = (event) => {
    event.preventDefault();

    // Security validation: Check for SQL injection and password constraints
    if (
      !Gfunc.detectSQLInjection(username) &&
      !Gfunc.detectSQLInjection(password) &&
      password.length >= 6 &&
      password.length <= 20
    ) {
      fetchSignIn();
    } else {
      if (password.length < 6 || password.length > 20) {
        setErrorMessage("Username or password incorrect");
        return;
      } else {
        // Log security violation attempt
        log.error(
          `Une tentative de saisie de balises HTML ou d'injection SQL dans le formulaire d'authentification.
          Informations de débogage :
          Nom d'utilisateur demandé : ${username}
          text saisi : ${password}`,
          "blocage",
          "Html Tags / Sql injection",
          220,
          "blockip"
        );
      }
    }
  };

  // Fonction pour alterner la visibilité d'un champ spécifique
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prevState) => !prevState);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Image d'arrière-plan */}
        <img
          src={BgImage}
          alt="Background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        />
        <Paper
          elevation={10}
          sx={{
            padding: !isMobile ? 4 : 2,
            textAlign: "start",
            borderRadius: 2,
            width: {
              xs: "90%",
              sm: "400px",
            },
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            margin: {
              xs: 2,
              sm: "auto",
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <img
              src={Logo}
              style={{ width: "350px", marginBottom: "16px" }}
              alt="Logo Aps"
            />
          </Box>

          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              marginBottom: 2,
              color: "#263949",
            }}
          >
            Welcome
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearData();
                setErrorMessage(null);
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type={showPasswords ? "text" : "password"}
              name="password"
              label="Password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearData();
                setErrorMessage(null);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility()}
                      edge="end"
                    >
                      <Icon
                        path={showPasswords ? mdiEye : mdiEyeOff}
                        size={1}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "#263949",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#1b2e3b",
                },
              }}
            >
              Sign in
            </Button>
            {loading && (
              <div
                style={{
                  width: "100%",
                  display: "grid",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </div>
            )}
            {(error || errorMessage) && (
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  color: "#e53935",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {error || errorMessage}
              </div>
            )}
          </Box>
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            sx={{ mt: 2, fontWeight: "600" }}
          >
            © Algeria Press Service {new Date().getFullYear()}
          </Typography>
        </Paper>
      </Box>
      <ConfirmDialog
        open={openDialog}
        message={msg}
        icon={""}
        confirmAction={confirmAction}
        concleAction={concleAction}
        confirmErrorMsg=""
        withInput={false}
        setNote={() => {}}
        note={""}
        obesrvation={""}
        warning={""}
        buttonConfirm={""}
        buttonCancle={""}
      >
        <img
          src={icon}
          alt="Session existe"
          style={{ width: "150px", color: "#4caf50" }}
        />
      </ConfirmDialog>
    </>
  );
};

export default Login;
