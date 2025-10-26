import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Autocomplete,
  Button,
  Checkbox,
  Divider,
  Grid2,
  Slide,
  TextField,
} from "@mui/material";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import PropTypes from "prop-types";
import { Icon } from "@mdi/react";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import { toast } from "react-toastify";
import { ContextProvider } from "../../Context/contextProvider";
import { StyledFieldset } from "../../assets/Styled/StyledFieldset";
import { StyledLegend } from "../../assets/Styled/StyledLegend";
import DataTable from "react-data-table-component";
import { customStyles } from "../../assets/styles/datatable_costum";
import ConfirmDialog from "../../UI/Alerts/ConfirmDialogue";
import { WidthType } from "docx";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function Agencies_user({ row }) {
  const { baseUrl, emptyData, lang, prefixe, secretKey } =
    useContext(ContextProvider);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [selectUsers, setSelectUsers] = useState([]);
  const [options, setOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userId, setUserId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState("");

  const userIdRef = useRef(userId);
  const {
    response: AllAgencyResponse,
    loading: AllAgencyloading,
    error: AllAgencyError,
    fetchData: GetAllAgency,
    clearData: AllAgencyClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "agencies/detail",
    body: { agencyId: parseInt(row?.id_agency) },
  });

  const {
    response: OtherAgencyResponse,
    loading: OtherAgencyloading,
    error: OtherAgencyError,
    fetchData: GetOtherAgency,
    clearData: OtherAgencyClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "agencies/other",
    body: { agencyId: parseInt(row?.id_agency) },
  });

  const {
    response: AddUserResponse,
    loading: AddUserloading,
    error: AddUserError,
    fetchData: AddUser,
    clearData: AddUserClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "agencies/users",
    body: {
      agencyId: parseInt(row.id_agency),
      users: selectUsers.map((el) => el.id_user),
    },
  });

  // Utilisation de useAxios pour assigner des nouveaux previleges
  const {
    response: DeleteResponse,
    loading: DeleteLaoding,
    error: DeleteError,
    fetchData: DeleteAgency,
    clearData: DeleteClear,
  } = useAxios({
    method: "put",
    url: baseUrl + "agencies/users",
    body: { agencyId: row?.id_agency, userId: userId },
  });

  useEffect(() => {
    if (!OtherAgencyResponse && open) {
      GetOtherAgency();
    }
  }, [OtherAgencyResponse, open]);

  useEffect(() => {
    if (OtherAgencyResponse && OtherAgencyResponse?.data?.success) {
      const tab = OtherAgencyResponse?.data?.data.filter(
        (el) => el.service !== "Coopération"
      );
      setOptions(tab);
    }
  }, [OtherAgencyResponse]);

  useEffect(() => {
    if (!AllAgencyResponse && open) {
      GetAllAgency();
    }
  }, [AllAgencyResponse, open]);

  useEffect(() => {
    if (AllAgencyResponse && AllAgencyResponse?.data?.success) {
      setData(AllAgencyResponse?.data?.data?.users);
    }
  }, [AllAgencyResponse]);

  useEffect(() => {
    if (AddUserResponse && AddUserResponse?.data?.success) {
      setSelectUsers([]);
      toast.success(AddUserResponse?.data?.message, {
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
      const newArray = selectUsers.map((el) => {
        return {
          assigned_by: Gfunc.useDecryptedLocalStorage(
            "username" + prefixe,
            secretKey
          ),
          assigned_date: Date.now(),
          id_user: el?.id_user,
          designation: el.designation,
          username: el.username,
        };
      });
      setData([...newArray, ...data]);
      AddUserClear();

      GetOtherAgency();
    }
  }, [AddUserResponse, data, row, selectUsers]);

  //verifier si un utilisateur sera supprimer
  useEffect(() => {
    if (DeleteResponse && DeleteResponse?.data?.success) {
      setOpenDialog(false);
      toast.success(DeleteResponse?.data?.message, {
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
      const newArray = Gfunc.DeleteElementfromArray(data, userId, "id_user");
      setData(newArray);
      setUserId(null);
      GetOtherAgency();

      DeleteClear();
    }
  }, [DeleteResponse, data, userId, GetOtherAgency]);

  //verifier si un utilisateur pourra etre supprimer
  useEffect(() => {
    if (userId && userIdRef.current !== userId && !openDialog) {
      setOpenDialog(true);
      setMessage(lang?.deleteConfirm);
      setIcon("mdiCloseCircleOutline");
    }
  }, [userId, userIdRef.current, openDialog]);

  useEffect(() => {
    if (DeleteError) {
      setUserId(null);
      toast.error(DeleteError, {
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
      DeleteClear();
    }
  }, [DeleteError, DeleteClear]);

  const handleClickOpen = () => {
    setOpen(true);
    setSelectUsers([]);
    AllAgencyClear();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const confirmAction = () => {
    DeleteAgency();
  };

  const concleAction = () => {
    setUserId(null);
    setOpenDialog(false);
    DeleteClear();
    AllAgencyClear();
  };

  //supprimer une agence  d'un utilisateur
  const handleDeleteUser = (row) => {
    setUserId(row.id_user);
  };

  const columns = [
    {
      name: lang?.name,
      selector: (row) => row.designation,
      sortable: true,
      wrap: true,
    },
    {
      name: lang?.username,
      selector: (row) => row.username,
      sortable: true,
      wrap: true,
    },
    {
      name: lang?.username,
      selector: (row) => row.assigned_by,
      sortable: true,
      wrap: true,
    },
    {
      name: lang?.date,
      selector: (row) => row.assigned_date,
      sortable: true,
      wrap: true,
      cell: (row) => {
        return <div>{Gfunc.formaterDate(row.assigned_date)}</div>;
      },
    },
    {
      right: "true",
      cell: (row, columns) => {
        return (
          <div onClick={() => handleDeleteUser(row)}>
            <Icon
              path={icons["mdiDelete"]}
              size={0.9}
              style={{ color: "red" }}
            />
          </div>
        );
      },
    },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectUsers.length > 0) {
      AddUser();
    } else {
      toast.error(lang?.minUser, {
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
    }
  };

  return (
    <>
      <Icon
        path={icons[Gfunc?.getIcon(Gfunc.firstToLower("Utilisateurs"))]}
        size={0.9}
        onClick={handleClickOpen}
      />
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: "1100px",
            height: "fit-content",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <p>{lang?.attribute_users_agency_title + " " + row?.name} </p>
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
            <StyledFieldset>
              <StyledLegend>{lang?.attribute_users_agency}</StyledLegend>
              <Grid2 container spacing={1} alignItems="center">
                <Grid2 item size={9}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    size="small"
                    options={options || []}
                    getOptionLabel={(option) =>
                      `${option.designation} (${option.username} )`
                    }
                    value={selectUsers}
                    onChange={(event, newValue) => {
                      setSelectUsers(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label={lang?.Utilisateurs} />
                    )}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox sx={{ marginRight: 1 }} checked={selected} />
                        {`${option.designation} (${option.username}) `}
                      </li>
                    )}
                  />
                </Grid2>

                <Grid2 item size={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="small"
                    onClick={handleSubmit}
                  >
                    {lang?.ok}
                  </Button>
                </Grid2>
              </Grid2>
            </StyledFieldset>
          </form>
          <DataTable
            noDataComponent={<b>{emptyData}</b>}
            responsive
            columns={columns}
            data={data}
            customStyles={customStyles}
            fixedHeader
            persistTableHead
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30]}
            highlightOnHover
            paginationDefaultPage={currentPage}
            onChangePage={(page) => {
              setCurrentPage(page);
            }}
            paginationComponentOptions={{
              rowsPerPageText: lang?.page_item,
              rangeSeparatorText: lang?.de,
              selectAllRowsItem: true,
              selectAllRowsItemText: lang?.tous,
            }}
          />
          <ConfirmDialog
            open={openDialog}
            message={message}
            icon={icon}
            confirmAction={confirmAction}
            concleAction={concleAction}
            warning={lang?.warning}
            buttonConfirm={lang?.confirm}
            buttonCancle={lang?.cancel}
          >
            <Icon
              path={icons.mdiCloseCircleOutline}
              style={{ color: "red" }}
              size={5}
            />
          </ConfirmDialog>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Validation des props avec PropTypes
Agencies_user.propTypes = {
  row: PropTypes.object.isRequired,
};
