import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  DialogTitle,
  DialogActions,
  Divider,
} from "@mui/material";
import Icon from "@mdi/react";
import defaultImage from "../../assets/images/defaultImage.png";
import { mdiPencil } from "@mdi/js";
import {} from "react";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import { ContextProvider } from "../../Context/contextProvider";
import { toast } from "react-toastify";
import { mdiAlertCircleOutline } from "@mdi/js";
import PropTypes from "prop-types";

const Agencies_Image = ({ row, setData, data }) => {
  const { baseUrl, ImageUrl, lang } = useContext(ContextProvider);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(row?.url);
  const [formData, setFormData] = useState(null);

  //useAxios pour modifier une image
  const {
    response: UpdateResponse,
    loading: Updateloading,
    error: UpdateError,
    fetchData: UpdateImage,
    clearData: UpdateClear,
  } = useAxios({
    method: "put",
    url: baseUrl + "agencies/update",
    body: formData,
  });

  const handleClickOpen = () => {
    setOpen(true);
    setFile(null);
    setImageSrc(row?.url);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  //
  useEffect(() => {
    if (UpdateResponse && UpdateResponse.data.success) {
      setImageSrc(UpdateResponse?.data?.data?.url);
      const updatedData = data.map((elem) =>
        elem.id_agency === row.id_agency
          ? {
              ...elem,
              url: UpdateResponse?.data?.data?.url,
            }
          : elem
      );
      setData(updatedData);
      setOpen(false);
    }
  }, [UpdateResponse]);

  //appler api de modification d'une image
  useEffect(() => {
    if (formData) {
      UpdateImage();
    }
  }, [formData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("agencyId", row?.id_agency);
    formData.append("logo", file);
    setFormData(formData);
  };

  return (
    <div>
      <img
        src={`${ImageUrl}logos/${imageSrc}`}
        alt={row?.name}
        style={{ width: "50px", height: "50px" }}
        onClick={handleClickOpen}
        onError={handleImageError}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: "800px",
            height: "auto",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <p>{lang?.updateImageTitle + " " + row?.name}</p>
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
          <form id="formValidatee" onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                gridGap: "10px",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <Button
                variant="contained"
                component="label"
                startIcon={
                  <Icon
                    path={mdiPencil}
                    size={1}
                    style={{ marginLeft: "10px" }}
                  />
                }
              >
                {lang?.updateImage}
                <input
                  type="file"
                  hidden
                  accept="image/*" // Filtre les fichiers dès la sélection
                  onChange={(event) => {
                    const selectedFile = event.target.files[0];

                    // Vérification si un fichier a été sélectionné
                    if (!selectedFile) return;

                    // Vérification du type de fichier (uniquement images)
                    if (!selectedFile.type.startsWith("image/")) {
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
                    if (selectedFile.size > maxSize) {
                      toast.error("L'image ne doit pas dépasser 1 Mo.", {
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

                    // Vérification si l'image est valide (pas corrompue)
                    const img = new Image();
                    img.src = URL.createObjectURL(selectedFile);
                    img.onload = () => {
                      setFile(selectedFile);
                    };
                    img.onerror = () => {
                      toast.error(
                        "L'image semble être endommagée ou non prise en charge.",
                        {
                          icon: mdiAlertCircleOutline,
                          position: "bottom-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          theme: "light",
                        }
                      );
                    };
                  }}
                />
              </Button>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                {file && <p>{file.name}</p>}
              </div>
            </div>
            <div>
              <img
                src={
                  file
                    ? URL.createObjectURL(file)
                    : `${ImageUrl}logos/${imageSrc}`
                }
                alt="Selected"
                style={{ width: "100%" }}
                id="image-updater"
                key={Math.random()}
                onError={handleImageError}
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions className="DialogActions">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="small"
            form="formValidatee"
            startIcon={<Icon path={icons["mdiCheck"]} size={0.8} />}
          >
            {lang?.validate}
          </Button>
          <Button variant="outlined" size="small" onClick={handleClose}>
            {lang?.cancel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
// Validation des props avec PropTypes
Agencies_Image.propTypes = {
  row: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  setData: PropTypes.func.isRequired,
};
export default Agencies_Image;
