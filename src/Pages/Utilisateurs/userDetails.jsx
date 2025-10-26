import React, { useEffect, useState, useContext, useRef } from "react";
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
import _ from "lodash";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const TransitionAr = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

function User_details({ row }) {
  const arrayCloned = _.cloneDeep(row);
  const { baseUrl, lang, prefixe, secretKey } = useContext(ContextProvider);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState({ type: null, index: null });
  const [editValue, setEditValue] = useState("");
  const [updateValue, setUpdateValue] = useState({});

  const handleEditClick = (type, index, value) => {
    setEditIndex({ type, index });
    setEditValue(value);
  };

  const handleSave = () => {
    let updatedBody = {};
    if (
      editIndex.type === "contact_emails" ||
      editIndex.type === "contact_numbers"
    ) {
      const parsedArray = JSON.parse(row[editIndex?.type] || "[]");
      if (parsedArray.length === 0) {
        // Si le tableau est vide, on remplace l'index par la nouvelle valeur et remplie les autres indices par "---"
        parsedArray[editIndex?.index] = editValue;
      } else {
        // Si le tableau n'est pas vide, on remplace uniquement l'index spécifié
        parsedArray[editIndex?.index] = editValue;
      }
      row[editIndex?.type] = JSON.stringify(parsedArray);
      updatedBody = {
        ...updateValue.body,
        [editIndex.type]: JSON.stringify(parsedArray),
      };
    } else {
      updatedBody = {
        ...updateValue.body,
        [editIndex.type]: editValue,
      };
      row[editIndex.type] = editValue;
    }

    setUpdateValue({
      row: arrayCloned,
      method: "put",
      url: baseUrl + "users/update",
      body: {
        ...updatedBody,
        userId: row.id_user,
      },
    });

    // Réinitialise les états initiale
    setEditIndex({ type: null, index: null });
    setEditValue("");
  };

  const handleCancel = () => {
    setEditIndex({ type: null, index: null });
    setEditValue("");
  };

  // Utilisation de useAxios pour changer le mot de passe
  const {
    response: UpdateResponse,
    loading: UpdateLoading,
    error: UpdateError,
    fetchData: UpdateUser,
    clearData: UpdateClearData,
  } = useAxios({
    method: updateValue?.method,
    url: updateValue?.url,
    body: updateValue?.body,
  });

  const handleClickOpen = () => {
    setOpen(true);
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
    }
    UpdateClearData();
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
      Object.keys(updateValue.body).forEach((key) => {
        if (key !== "userId") {
          if (key in row) {
            if (key === "contact_emails" || key === "contact_numbers") {
              row[key] = updateValue.row[key];
            } else {
              row[key] = updateValue.row[key];
            }
          }
        }
      });
      UpdateClearData();
    }
  }, [UpdateError]);

  //valider le formulaire
  const handleSubmit = (event) => {
    event.preventDefault();
    if (updateValue) {
      UpdateUser();
    }
  };

  return (
    <>
      <Icon
        path={icons.mdiDetails}
        onClick={handleClickOpen}
        size={1}
        title={lang?.userDetails}
      />

      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={
          Gfunc.useDecryptedLocalStorage("langId" + prefixe, secretKey) === "1"
            ? TransitionAr
            : Transition
        }
        transitionDuration={500}
        PaperProps={{
          style: {
            position: "fixed",
            top: 0,
            right:
              Gfunc.useDecryptedLocalStorage("langId" + prefixe, secretKey) !==
                "1" && 0,
            left:
              Gfunc.useDecryptedLocalStorage("langId" + prefixe, secretKey) ===
                "1" && 0,
            width: "350px",
            height: "100%",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <p>{lang?.userMoreDetails + " " + row.username}</p>
            <Icon
              path={icons.mdiClose}
              size={0.9}
              style={{ color: "gray", cursor: "pointer" }}
              onClick={handleClose}
            />
          </div>
        </DialogTitle>
        <DialogContent>
          <div>
            <div>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  gridGap: "5px",
                  justifyContent: "start",
                  marginBottom: "8px",
                }}
              >
                <Icon
                  path={icons.mdiAccount}
                  size={0.9}
                  style={{
                    color: "gray",
                  }}
                />
                <b
                  style={{
                    color: "gray",
                  }}
                >
                  {lang?.User}
                </b>
              </div>
              <Divider />
              {row.username ? row.username : "---"}
            </div>
            <br />
            <div>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  gridGap: "5px",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gridGap: "5px",
                  }}
                >
                  <Icon
                    path={icons.mdiAccountTie}
                    size={0.9}
                    style={{
                      color: "gray",
                    }}
                  />
                  <b style={{ color: "gray" }}>{lang?.visavis}</b>
                </div>
              </div>
              <Divider />
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "15px 0",
                }}
              >
                {editIndex.type === "contact" ? (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      size="small"
                      margin="none"
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <Icon
                      path={icons.mdiCheck}
                      size={1}
                      style={{ color: "green", cursor: "pointer" }}
                      onClick={handleSave}
                    />
                    <Icon
                      path={icons.mdiCancel}
                      size={1}
                      style={{ color: "red", cursor: "pointer" }}
                      onClick={handleCancel}
                    />
                  </div>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>
                      {row.contact ? row.contact : "---"}
                    </span>
                    <Icon
                      path={icons.mdiPencil}
                      size={0.8}
                      style={{
                        cursor: "pointer",
                        color: "black",
                      }}
                      onClick={() =>
                        handleEditClick("contact", undefined, row.contact)
                      }
                    />
                  </>
                )}
              </div>
            </div>
            <br />
            <div>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  gridGap: "5px",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gridGap: "5px",
                  }}
                >
                  <Icon
                    path={icons.mdiFunction}
                    size={0.9}
                    style={{
                      color: "gray",
                    }}
                  />
                  <b style={{ color: "gray" }}>{lang?.fonction}</b>
                </div>
              </div>
              <Divider />
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {editIndex.type === "fonction" ? (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      size="small"
                      margin="none"
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <Icon
                      path={icons.mdiCheck}
                      size={1}
                      style={{ color: "green", cursor: "pointer" }}
                      onClick={handleSave}
                    />
                    <Icon
                      path={icons.mdiCancel}
                      size={1}
                      style={{ color: "red", cursor: "pointer" }}
                      onClick={handleCancel}
                    />
                  </div>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>
                      {row.fonction ? row.fonction : "---"}
                    </span>
                    <Icon
                      path={icons.mdiPencil}
                      size={0.8}
                      style={{
                        cursor: "pointer",
                        color: "black",
                      }}
                      onClick={() =>
                        handleEditClick("fonction", undefined, row.fonction)
                      }
                    />
                  </>
                )}
              </div>
            </div>
            <br />
          </div>
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiEmail}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.email}
              </b>
            </div>
            <Divider />
            {(() => {
              const parsedArray = JSON.parse(
                row.contact_emails || '["---","---","---"]'
              );

              // Si le tableau a moins de 3 éléments, complétez-le avec "---"
              while (parsedArray.length < 3) {
                parsedArray.push("---");
              }

              return parsedArray.map((email, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "15px 0",
                  }}
                >
                  {editIndex.type === "contact_emails" &&
                  editIndex.index === index ? (
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        size="small"
                        margin="none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          flex: 1,
                          marginRight: "8px",
                        }}
                      />
                      <Icon
                        path={icons.mdiCheck}
                        size={1}
                        style={{ color: "green", cursor: "pointer" }}
                        onClick={handleSave}
                      />
                      <Icon
                        path={icons.mdiCancel}
                        size={1}
                        style={{ color: "red", cursor: "pointer" }}
                        onClick={handleCancel}
                      />
                    </div>
                  ) : (
                    <>
                      <span style={{ flex: 1 }}>{email}</span>
                      <Icon
                        path={icons.mdiPencil}
                        size={0.8}
                        style={{
                          cursor: "pointer",
                          color: "black",
                        }}
                        onClick={() =>
                          handleEditClick("contact_emails", index, email)
                        }
                      />
                    </>
                  )}
                </div>
              ));
            })()}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiPhone}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.phoneNumber}
              </b>
            </div>
            <Divider />
            {(() => {
              const parsedArray = JSON.parse(
                row.contact_numbers || '["---","---","---"]'
              );

              // Si le tableau a moins de 3 éléments, complétez-le avec "---"
              while (parsedArray.length < 3) {
                parsedArray.push("---");
              }

              return parsedArray.map((number, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "15px 0",
                  }}
                >
                  {editIndex.type === "contact_numbers" &&
                  editIndex.index === index ? (
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        size="small"
                        margin="none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          flex: 1,
                          marginRight: "8px",
                        }}
                      />
                      <Icon
                        path={icons.mdiCheck}
                        size={1}
                        style={{ color: "green", cursor: "pointer" }}
                        onClick={handleSave}
                      />
                      <Icon
                        path={icons.mdiCancel}
                        size={1}
                        style={{ color: "red", cursor: "pointer" }}
                        onClick={handleCancel}
                      />
                    </div>
                  ) : (
                    <>
                      <span style={{ flex: 1 }}>{number}</span>
                      <Icon
                        path={icons.mdiPencil}
                        size={0.8}
                        style={{
                          cursor: "pointer",
                          color: "black",
                        }}
                        onClick={() =>
                          handleEditClick("contact_numbers", index, number)
                        }
                      />
                    </>
                  )}
                </div>
              ));
            })()}
          </div>
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiCalendar}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.created_date + " / " + lang?.created_by}
              </b>
            </div>
            <Divider />
            {(row.register_date
              ? Gfunc.formaterDate(row.register_date)
              : "---") +
              " /  " +
              (row.register_by ? row.register_by : "---")}
          </div>
          <br />

          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiCalendar}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.modified_date + " / " + lang?.modified_by}
              </b>
            </div>
            <Divider />
            {(row.modified_date
              ? Gfunc.formaterDate(row.modified_date)
              : "---") +
              " / " +
              (row.modified_by ? row.modified_by : "---")}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiCalendar}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.trash_date + " / " + lang?.by}
              </b>
            </div>
            <Divider />
            {(row.trash_date ? Gfunc.formaterDate(row.trash_date) : "---") +
              " /  " +
              (row.trash_by ? row.trash_by : "---")}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiCalendar}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.activate_date + " / " + lang?.by}
              </b>
            </div>
            <Divider />
            {(row.activate_date
              ? Gfunc.formaterDate(row.activate_date)
              : "---") +
              " / " +
              (row.activate_by ? row.activate_by : "---")}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiCalendar}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.desactivate_date + " / " + lang?.by}
              </b>
            </div>
            <Divider />
            {(row.desactivate_date
              ? Gfunc.formaterDate(row.desactivate_date)
              : "---") +
              " / " +
              (row.deactivated_by ? row.deactivated_by : "---")}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiBlockHelper}
                size={0.8}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.blocked_date + " / " + lang?.blocked_code}
              </b>
            </div>
            <Divider />
            {(row.blocked_date ? Gfunc.formaterDate(row.blocked_date) : "---") +
              " / " +
              (row.block_code ? row.block_code : "---")}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiBlockHelper}
                size={0.8}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.unblocked_date + " / " + lang?.by}
              </b>
            </div>
            <Divider />
            {(row.unblocked_date
              ? Gfunc.formaterDate(row.unblocked_date)
              : "---") +
              " / " +
              (row.unblocked_by ? row.unblocked_by : "---")}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gridGap: "5px",
                }}
              >
                <Icon
                  path={icons.mdiNoteOutline}
                  size={0.9}
                  style={{
                    color: "gray",
                  }}
                />
                <b style={{ color: "gray" }}>{lang?.note}</b>
              </div>
            </div>
            <Divider />
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "15px 0",
              }}
            >
              <span style={{ flex: 1 }}>{row.note ? row.note : "---"}</span>
            </div>
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiClockTimeEightOutline}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.refresh_time}
              </b>
            </div>
            <Divider />
            {row.refresh_time}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={icons.mdiClockTimeEightOutline}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                {lang?.connexion_attemps}
              </b>
            </div>
            <Divider />
            {row.login_attempts}
          </div>
          <br />
        </DialogContent>
        <DialogActions className="DialogActions">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSubmit}
            startIcon={<Icon path={icons["mdiCheck"]} size={0.8} />}
          >
            {lang?.validate}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
// Validation des props avec PropTypes
User_details.propTypes = {
  row: PropTypes.object.isRequired,
};

export default User_details;
