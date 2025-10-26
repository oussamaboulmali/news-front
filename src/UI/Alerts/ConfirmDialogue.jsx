import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import Icon from "@mdi/react";
import { useMediaQuery } from "react-responsive";

const ConfirmDialog = ({
  open,
  message,
  icon,
  confirmAction,
  concleAction,
  children,
  warning,
  buttonConfirm,
  buttonCancle,
  withInput,
  note,
  setNote,
  confirmErrorMsg,
}) => {
  const [confirmError, setConfirmError] = useState(null);
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  const handleOnConfirm = () => {
    if (withInput) {
      if (note.length >= 5) {
        confirmAction(note);
      } else {
        setConfirmError(confirmErrorMsg);
      }
    } else {
      confirmAction();
    }
  };

  const handleOnConcle = () => {
    concleAction();
  };

  return (
    <Dialog open={open} onClose={handleOnConcle}>
      <DialogContent>
        <Box
          display={isMobile ? "block" : "flex"}
          alignItems="center"
          justifyContent={"center"}
          px={2}
          pt={2}
        >
          {/* En mode mobile, on centre l'icône horizontalement */}
          <Box
            sx={{
              display: "flex",
              justifyContent: isMobile ? "center" : "flex-start",
              mb: isMobile ? 2 : 0,
            }}
          >
            {children ? (
              children
            ) : (
              <Icon path={icon} style={{ color: "red" }} />
            )}
          </Box>
          <Box
            sx={{
              marginLeft: isMobile ? 0 : "30px",
              display: "grid",
              gridGap: "10px",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            <Typography variant="h4" color="black">
              {warning || "Avertissement"}
            </Typography>
            <Typography variant="p" color="primary">
              {message}
            </Typography>
            {withInput && (
              <TextField
                label="Note de changement d'état"
                variant="outlined"
                fullWidth
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setConfirmError(null);
                }}
                multiline
                rows={3}
                style={{ marginTop: "15px" }}
                error={confirmError ? true : false}
                helperText={
                  <span dangerouslySetInnerHTML={{ __html: confirmError }} />
                }
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnConcle} variant="outlined">
          {buttonCancle || "Annuler"}
        </Button>
        <Button onClick={handleOnConfirm} variant="contained" color="primary">
          {buttonConfirm || "Confirmer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Validation des props avec PropTypes
ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  buttonConfirm: PropTypes.string.isRequired,
  buttonCancle: PropTypes.string.isRequired,
  obesrvation: PropTypes.string.isRequired,
  note: PropTypes.string.isRequired,
  setNote: PropTypes.func.isRequired,
  confirmAction: PropTypes.func.isRequired,
  concleAction: PropTypes.func.isRequired,
  children: PropTypes.node,
  withInput: PropTypes.bool.isRequired,
  confirmErrorMsg: PropTypes.string.isRequired,
};

export default ConfirmDialog;
