import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Slide,
  TextField,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Icon } from "@mdi/react";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { ContextProvider } from "../../Context/contextProvider";
import log from "../../Log/costumLog";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

function Rest_password({ row }) {
  const { baseUrl, lang } = useContext(ContextProvider);
  const [open, setOpen] = useState(false);
  // const [openDialog, setOpenDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    newPassword: false,
  });

  // Fonction pour alterner la visibilité d'un champ spécifique
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Utilisation de useAxios pour changer le mot de passe
  const {
    response: UpdateResponse,
    loading: UpdateLoading,
    error: UpdateError,
    fetchData: UpdatePassword,
    clearData: UpdateClearData,
  } = useAxios({
    method: "put",
    url: baseUrl + "users/reset",
    body: {
      userId: row.id_user,
      password: confirmPassword,
    },
  });

  const handleClickOpen = () => {
    if (row.state !== 0 && row.state !== 3) {
      setOpen(true);
    }
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (UpdateResponse && UpdateResponse?.data?.success) {
      toast.success(UpdateResponse?.data?.message, {
        icon: icons["mdiCheck"],
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setOpen(false);
      UpdateClearData();
    }
  }, [UpdateResponse]);

  useEffect(() => {
    if (UpdateError) {
      toast.error(UpdateError, {
        icon: icons["mdiAlertCircleOutline"],
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
  }, [UpdateError]);

  //valider le formulaire
  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      Gfunc.detectSQLInjection(newPassword) ||
      Gfunc.detectSQLInjection(confirmPassword)
    ) {
      log.error(
        `Une tentative de saisie de balises HTML ou d'injection SQL dans le formulaire de réinitialisation du mot de passe.
              Informations de débogage :
              Nom d'utilisateur : ${row.username}
              Nouveau mot de passe saisi : ${newPassword}
              Confimrer le nouveau mot de passe saisi : ${confirmPassword}
              `,
        "blocage",
        "Html Tags / Sql injection",
        220
      );
      return; // On arrête l'exécution de la soumission
    }

    if (
      Gfunc.TwoEqualeString(newPassword, confirmPassword) &&
      newPassword.length >= 6 &&
      newPassword.length <= 20 &&
      confirmPassword.length >= 6 &&
      confirmPassword.length <= 20
    ) {
      UpdatePassword();
    } else {
      toast.error(
        "Les mots de passe ne sont pas identiques ou la taille erroné, Veuillez réessayer.",
        {
          icon: icons["mdiAlertCircleOutline"],
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  return (
    <>
      <Icon
        path={icons["mdiAccountKey"]}
        onClick={handleClickOpen}
        style={{
          color: row.state === 0 || row.state === 3 ? "gray" : "#00A88E",
          cursor: row.state === 0 || row.state === 3 ? "wait" : "pointer",
          height: "24px",
          width: "24px",
        }}
      />

      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: "600px",
            height: "fit-content",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <p>{lang?.userRestPassword + " " + row.username}</p>
            <Icon
              path={icons.mdiClose}
              size={0.9}
              style={{ color: "gray", cursor: "pointer" }}
              onClick={handleClose}
            />
          </div>
          <Divider />
        </DialogTitle>
        <DialogContent>
          <form id="formValidate" onSubmit={handleSubmit}>
            <TextField
              label={lang?.newPassword}
              type={showPasswords.password ? "text" : "password"}
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              required
              autoComplete="off"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
              sx={{
                mb: 2,
                mt: 2,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("password")}
                      edge="end"
                    >
                      <Icon
                        path={
                          showPasswords.password
                            ? icons.mdiEye
                            : icons.mdiEyeOff
                        }
                        size={1}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={lang?.confirmPassword}
              type={showPasswords.newPassword ? "text" : "password"}
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              required
              autoComplete="off"
              /* error={errors?.confirmPassword?.[0]}
              helperText={errors?.confirmPassword?.[1]} */
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("newPassword")}
                      edge="end"
                    >
                      <Icon
                        path={
                          showPasswords.newPassword
                            ? icons.mdiEye
                            : icons.mdiEyeOff
                        }
                        size={1}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
          {/* <DialogConfirm
            open={openDialog}
            //id={response?.data?.data?.userId}
            icon={icon}
            grid={4}
            message={message}
            confirmCloseSession={confirmUpdateData}
            consoleCloseSession={consoleUpdateData}
            placement="auto"
          /> */}
        </DialogContent>
        <DialogActions className="DialogActions">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="small"
            form="formValidate"
            startIcon={<Icon path={icons["mdiCheck"]} size={0.8} />}
          >
            {lang?.validate}
          </Button>
          <Button variant="outlined" size="small" onClick={handleClose}>
            {lang?.cancel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
// Validation des props avec PropTypes
Rest_password.propTypes = {
  row: PropTypes.object.isRequired,
};

export default Rest_password;
