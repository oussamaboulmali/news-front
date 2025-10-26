import React, { useEffect, useState, useContext, useRef } from "react";
import { Button, Divider, Slide, TextField } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { mdiPlus } from "@mdi/js";
import PropTypes from "prop-types";
import { Icon } from "@mdi/react";
import * as icons from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import { toast } from "react-toastify";
import { ContextProvider } from "../../Context/contextProvider";
import "../../assets/styles/drag-drop-input.css";
import { useMediaQuery } from "react-responsive";
import * as Gfunc from "../../helpers/Gfunc";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function Agencies_add({ data, setData }) {
  const { baseUrl, lang, prefixe, secretKey } = useContext(ContextProvider);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(null);
  const [nameAr, setNameAr] = useState(null);
  const [file, setFile] = useState(null);
  const [formdata, setFormData] = useState(null);
  const wrapperRef = useRef(null);
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  const validateAndSetFile = (file) => {
    // Vérification si un fichier a été sélectionné
    if (!file) return;

    // Vérification du type de fichier (uniquement images)
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide.", {
        icon: mdiAlertCircleOutline,
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }

    // Vérification de la taille du fichier (1 Mo max)
    const maxSize = 1 * 1024 * 1024; // convertir 1 Mo en octets
    if (file.size > maxSize) {
      toast.error("L'image ne doit pas dépasser 1 Mo.", {
        icon: icons.mdiAlertCircleOutline,
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }

    // Vérification si l'image est valide (pas corrompue)
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setFile(file); // L'image est valide, on l'enregistre
    };
    img.onerror = () => {
      toast.error("L'image semble être endommagée ou non prise en charge.", {
        icon: mdiAlertCircleOutline,
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    };
  };

  const onDragEnter = () => wrapperRef.current.classList.add("dragover");

  const onDragLeave = () => wrapperRef.current.classList.remove("dragover");

  //  Gestion du drag & drop
  const onDrop = (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du navigateur
    const newFile = e.dataTransfer.files[0];
    validateAndSetFile(newFile);
  };

  //  Gestion du fichier sélectionné via input
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const {
    response: Addresponse,
    loading: Addloading,
    error: Adderror,
    fetchData: AddAgency,
    clearData: AddClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "agencies/create",
    body: formdata,
  });

  const handleClickOpen = () => {
    setOpen(true);
    setName(null);
    setNameAr(null);
    setFile(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (Addresponse && Addresponse?.data?.success) {
      const newRow = {
        id_agency: Addresponse?.data?.data?.agencyId,
        name: name,
        name_ar: nameAr,
        url: Addresponse?.data?.data?.url,
        // created_by: localStorage.getItem("username" + prefixe),
        created_by: Gfunc.useDecryptedLocalStorage(
          "username" + prefixe,
          secretKey
        ),
        created_date: new Date(),
        state: false,
      };
      setData([newRow, ...data]);
      setOpen(false);
      AddClear();
      toast.success(Addresponse?.data?.message, {
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
      AddClear();
    }
  }, [Addresponse]);

  useEffect(() => {
    if (Adderror) {
      toast.error(Adderror, {
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
      AddClear();
    }
  }, [Adderror]);

  useEffect(() => {
    if (formdata) {
      AddAgency();
    }
  }, [formdata]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Veuillez ajouter un logo avant de continuer.", {
        icon: icons.mdiAlertCircleOutline,
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("name_ar", nameAr);
      formData.append("logo", file);

      setFormData(formData);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickOpen}
        size="small"
        startIcon={<Icon path={mdiPlus} size={0.8} />}
      >
        {lang?.add}
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: isMobile ? "300px" : "600px",
            height: "fit-content",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <p>{lang?.newAgencey}</p>
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
              label={lang?.agenceyName}
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              autoComplete="off"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              sx={{
                mt: 2,
                mb: 2,
              }}
            />
            <TextField
              label={lang?.agenceyNameAr}
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              autoComplete="off"
              required
              value={nameAr}
              onChange={(e) => {
                setNameAr(e.target.value);
              }}
              sx={{
                mt: 2,
                mb: 2,
              }}
            />
            <div
              ref={wrapperRef}
              className="drop-file-input"
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="drop-file-input__label">
                <Icon path={icons.mdiCloudArrowUp} size={4} color="blue" />
                <p>{lang?.logo}</p>
              </div>
              <input
                type="file"
                value=""
                accept="image/*"
                multiple={false}
                onChange={onFileChange}
              />
            </div>
            {file !== null ? (
              <div className="drop-file-preview__item__top">
                <div className="drop-file-preview__item">
                  <img src={URL?.createObjectURL(file)} alt={file?.name} />
                  <span
                    className="drop-file-preview__item__del"
                    onClick={() => setFile(null)}
                  >
                    x
                  </span>
                </div>
                <p>{file?.name}</p>
              </div>
            ) : null}
          </form>
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
Agencies_add.propTypes = {
  data: PropTypes.array.isRequired,
  setData: PropTypes.func.isRequired,
};
