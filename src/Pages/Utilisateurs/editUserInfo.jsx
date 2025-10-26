import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Slide,
  Divider,
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Icon from "@mdi/react";
import User from "../../assets/images/user.png";
import {
  mdiAlertCircleOutline,
  mdiChevronDown,
  mdiChevronUp,
  mdiClose,
  mdiContentSaveCheck,
  mdiEye,
  mdiEyeOff,
} from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import { ContextProvider } from "../../Context/contextProvider";
import { toast } from "react-toastify";
import * as Gfunc from "../../helpers/Gfunc";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import log from "../../Log/costumLog";
import CryptoJS from "crypto-js";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const EditUserInfos = ({ isSidebarOpen }) => {
  const navigate = useNavigate();
  const {
    baseUrl,
    lang: translations,
    prefixe,
    secretKey,
  } = useContext(ContextProvider);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(null);
  const [agencyName, setAgencyName] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(null);
  const [newPassword, setNewPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [initialeValues, setInitialeValues] = useState({
    email: "",
    phone: "",
    agencyName: "",
    langue: "",
  });
  const [errors, setErrors] = useState({ email: "", phone: "" });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    newPassword: false,
    confirmPassword: false,
  });
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const lang = [
    { id: 1, name: "عربي" },
    { id: 2, name: "Français" },
    { id: 3, name: "English" },
  ];

  // Fonction pour alterner la visibilité d'un champ spécifique
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Utilisation de useAxios pour connecter
  const {
    response: responseDetails,
    loading: loadingDetails,
    error: errorDetails,
    fetchData: getDetails,
    clearData: clearDataDetails,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/detailme",
    body: {},
  });

  // Utilisation de useAxios pour connecter
  const {
    response: responseUpdate,
    loading: laoadingUpdate,
    error: errorUpdate,
    fetchData: getUpdate,
    clearData: clearDataUpdate,
  } = useAxios({
    method: "put",
    url: baseUrl + "users/updateme",
    body: {
      //username: localStorage .getItem("username"),
      ...(tel && { phone_number: tel }),
      designation: agencyName,
      ...(email && { email: email }),
      lang: language?.id,
      ...(newPassword && { newPassword }),
      ...(password && { oldPassword: password }),
    },
  });

  //remplir les champs par une valeur initiale
  useEffect(() => {
    if (isInitialLoad && responseDetails && responseDetails?.data?.success) {
      const idToFind = responseDetails?.data?.data?.lang;
      const language = lang.find((lang) => lang.id === idToFind);
      setEmail(responseDetails?.data?.data?.email);
      setTel(responseDetails?.data?.data?.phone_number);
      setAgencyName(responseDetails?.data?.data?.designation);
      setLanguage({
        id: parseInt(responseDetails?.data?.data?.lang),
        name: language?.name,
      });
      setInitialeValues({
        email: responseDetails?.data?.data?.email,
        phone: responseDetails?.data?.data?.phone_number,
        agencyName: responseDetails?.data?.data?.designation,
        langue: language?.name,
      });
      setIsInitialLoad(false);
    }
  }, [responseDetails, lang, isInitialLoad]);

  //mise a jour avec success
  useEffect(() => {
    if (responseUpdate && responseUpdate?.data?.success) {
      if (language?.name !== initialeValues?.langue) {
        localStorage.setItem(
          "langId" + prefixe,
          CryptoJS.AES.encrypt(language?.id.toString(), secretKey)
        );
        document.documentElement.setAttribute(
          "dir",
          language?.id === "1" ? "rtl" : "ltr"
        );
        navigate(0);
      } else {
        toast.success(responseUpdate?.data?.message, {
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

      setOpen(false);
      clearDataUpdate();
    }
  }, [responseUpdate]);

  //mise a jour avec erreur
  useEffect(() => {
    if (errorUpdate) {
      toast.error(errorUpdate, {
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
  }, [errorUpdate]);

  const handleOpen = () => {
    getDetails();
    setOpen(true);
    setConfirmPassword("");
    setPassword(""), setNewPassword("");
  };

  const handleClose = () => {
    setOpen(false);
    clearDataDetails();
    setErrors({});
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      Gfunc.detectSQLInjection(email) ||
      Gfunc.detectSQLInjection(tel) ||
      Gfunc.detectSQLInjection(agencyName) ||
      Gfunc.detectSQLInjection(password) ||
      Gfunc.detectSQLInjection(confirmPassword) ||
      Gfunc.detectSQLInjection(newPassword)
    ) {
      log.error(
        `Une tentative de saisie de balises HTML ou d'injection SQL dans le formulaire de modification des informations personnelles.
          Informations de débogage :
          Nom d'utilisateur demandé : ${Gfunc.useDecryptedLocalStorage(
            "username" + prefixe,
            secretKey
          )}
          Mot de passe saisi : ${password}
          Nouveau mot de passe saisi : ${newPassword}
          Confimrer le nouveau mot de passe saisi : ${confirmPassword}
          `,
        "blocage",
        "Html Tags / Sql injection",
        220
      );
      return; // On arrête l'exécution de la soumission
    }

    // Validation des champs avec détection d'injection SQL
    const emailError =
      email && !Gfunc.validateEmail(email) ? "Adresse email invalide" : "";
    const phoneError =
      tel && !Gfunc.validatePhone(tel)
        ? "Le numéro doit contenir exactement 10 chiffres"
        : "";

    // Validation des mots de passe
    const passwordError =
      password && newPassword && password === newPassword
        ? "Le mot de passe et le nouveau mot de passe doivent être différents"
        : "";
    const confirmPasswordError =
      newPassword && confirmPassword && newPassword !== confirmPassword
        ? "Le mot de passe confirmé doit correspondre au nouveau mot de passe"
        : "";
    setErrors({
      email: emailError,
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // Vérification des changements
    const hasEmailChanged = email !== initialeValues?.email;
    const hasPhoneChanged = tel !== initialeValues?.phone;
    const hasAgencyNameChanged = agencyName !== initialeValues?.agencyName;
    const hasLangChanged = language?.id !== initialeValues?.langue;
    const hasNewPasswordEntered =
      newPassword && confirmPassword && password !== newPassword;

    // Soumission si les champs sont valides et au moins un champ est modifié
    if (
      !emailError &&
      !phoneError &&
      !passwordError &&
      !confirmPasswordError &&
      (hasEmailChanged ||
        hasPhoneChanged ||
        hasNewPasswordEntered ||
        hasAgencyNameChanged ||
        hasLangChanged)
    ) {
      getUpdate();
    } else {
      toast.error("Vous devez renseigner au moins un champ.", {
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
  };

  return (
    <>
      <div className="infos" onClick={handleOpen}>
        <Avatar
          src={User}
          sx={{
            height: isSidebarOpen ? "70px" : "30px",
            width: isSidebarOpen ? "70px" : "30px",
            backgroundColor: "#55b4e5",
            padding: isSidebarOpen ? "8px" : "3px",
            margin: "auto",
          }}
        />
        <div
          style={{
            display: "flex",
            gridGap: "8px",
            alignItems: "center",
            fontSize: !isSidebarOpen ? "12px" : "",
          }}
        >
          <p
            title={Gfunc.useDecryptedLocalStorage(
              "username" + prefixe,
              secretKey
            )}
          >
            {Gfunc.useDecryptedLocalStorage("username" + prefixe, secretKey)
              ?.length > 7
              ? Gfunc.useDecryptedLocalStorage(
                  "username" + prefixe,
                  secretKey
                )?.substring(0, 7) + "..."
              : Gfunc.useDecryptedLocalStorage("username" + prefixe, secretKey)}
          </p>
          <Icon path={open ? mdiChevronUp : mdiChevronDown} size={1} />
        </div>
      </div>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: isMobile ? "300px" : "600px",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <p>{translations?.userPreferences}</p>
            <Icon
              path={mdiClose}
              size={0.9}
              style={{ color: "gray", cursor: "pointer" }}
              onClick={handleClose}
            />
          </div>
          <Divider />
        </DialogTitle>

        <DialogContent>
          <form id="formValidate" onSubmit={handleSubmit}>
            <Autocomplete
              fullWidth
              filterSelectedOptions
              size="small"
              margin="none"
              options={lang}
              getOptionLabel={(option) => option.name}
              value={language}
              onChange={(event, newValues) => {
                setLanguage(newValues);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={translations?.language}
                  //placeholder="Choisir une langue"
                />
              )}
              sx={{
                mt: 2,
                mb: 2,
              }}
            />

            <TextField
              //placeholder="Votre Nom"
              label={translations?.name}
              variant="outlined"
              size="small"
              fullWidth
              autoComplete="off"
              value={agencyName}
              onChange={(e) => {
                setAgencyName(e.target.value);
              }}
              sx={{
                mb: 2,
              }}
            />
            <TextField
              //placeholder="Votre Numéro de téléphone"
              label={translations?.phoneNumber}
              variant="outlined"
              margin="small"
              size="small"
              fullWidth
              autoComplete="off"
              value={tel}
              onChange={(e) => {
                setTel(e.target.value);
                errors["phone"] = "";
              }}
              error={errors?.phone}
              helperText={errors?.phone}
              sx={{
                mb: 2,
              }}
            />
            <TextField
              //placeholder="Votre email"
              label={translations?.email}
              variant="outlined"
              size="small"
              fullWidth
              autoComplete="off"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                errors["email"] = "";
              }}
              error={errors?.email}
              helperText={errors?.email}
              sx={{
                mb: 2,
              }}
            />
            <Divider
              sx={{
                mb: 2,
              }}
            >
              {translations?.userPassword}
            </Divider>
            <TextField
              //placeholder="Votre mot de passe"
              type={showPasswords.password ? "text" : "password"}
              label={translations?.password}
              variant="outlined"
              margin="small"
              size="small"
              fullWidth
              autoComplete="off"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              sx={{
                mb: 2,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("password")}
                      edge="end"
                    >
                      <Icon
                        path={showPasswords.password ? mdiEye : mdiEyeOff}
                        size={1}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              //placeholder="Votre nouveau mot de passe"
              type={showPasswords.newPassword ? "text" : "password"}
              label={translations?.newPassword}
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              autoComplete="off"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
              error={errors?.password}
              helperText={errors?.password}
              sx={{
                mb: 2,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("newPassword")}
                      edge="end"
                    >
                      <Icon
                        path={showPasswords.newPassword ? mdiEye : mdiEyeOff}
                        size={1}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              //placeholder="Votre nouveau mot de passe"
              type={showPasswords.confirmPassword ? "text" : "password"}
              label={translations?.confirmPassword}
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              autoComplete="off"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                errors["confirmPassword"] = "";
              }}
              error={errors?.confirmPassword}
              helperText={errors?.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        togglePasswordVisibility("confirmPassword")
                      }
                      edge="end"
                    >
                      <Icon
                        path={
                          showPasswords.confirmPassword ? mdiEye : mdiEyeOff
                        }
                        size={1}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </DialogContent>
        <DialogActions className="DialogActions">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="small"
            form="formValidate"
            startIcon={
              <Icon
                path={mdiContentSaveCheck}
                size={0.8}
                style={{ marginLeft: "10px" }}
              />
            }
            sx={{ ml: "10px" }}
          >
            {translations?.validate}
          </Button>
          <Button
            //color="secondary"
            variant="outlined"
            size="small"
            onClick={handleClose}
          >
            {translations?.cancel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Validation des props avec PropTypes
EditUserInfos.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default EditUserInfos;
