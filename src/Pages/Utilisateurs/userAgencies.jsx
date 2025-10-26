import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function User_agencies({ row }) {
  const { baseUrl, emptyData, lang, prefixe, secretKey } =
    useContext(ContextProvider);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [selectAgencies, setSelectAgencies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [agencyId, setAgencyId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState("");
  const [options, setOptions] = useState("");
  const agencyIdRef = useRef(agencyId);

  const {
    response: AllAgencyResponse,
    loading: AllAgencyloading,
    error: AllAgencyError,
    fetchData: GetAllAgency,
    clearData: AllAgencyClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/detail",
    body: { userId: parseInt(row.id_user) },
  });

  const {
    response: OtherAgencyResponse,
    loading: OtherAgencyloading,
    error: OtherAgencyError,
    fetchData: GetOtherAgency,
    clearData: OtherAgencyClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/other",
    body: { userId: parseInt(row.id_user) },
  });

  const {
    response: AddAgencyResponse,
    loading: AddAgencyloading,
    error: AddAgencyError,
    fetchData: AddAgency,
    clearData: AddAgencyClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/agencies",
    body: {
      userId: parseInt(row.id_user),
      agencies: selectAgencies.map((el) => el?.id_agency),
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
    url: baseUrl + "users/agencies",
    body: { userId: row.id_user, agencyId: agencyId },
  });

  useEffect(() => {
    if (!OtherAgencyResponse && open) {
      GetOtherAgency();
    }
  }, [OtherAgencyResponse, open]);

  useEffect(() => {
    if (OtherAgencyResponse && OtherAgencyResponse?.data?.success) {
      const tab =
        row.role === "abonné" && row.service === "Coopération"
          ? OtherAgencyResponse?.data?.data?.filter(
              (el) => el?.id_agency === 1 || el?.id_agency === 2
            )
          : OtherAgencyResponse?.data?.data;
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
      setData(AllAgencyResponse?.data?.data?.agencies);
    }
  }, [AllAgencyResponse]);

  useEffect(() => {
    if (AddAgencyResponse && AddAgencyResponse?.data?.success) {
      setSelectAgencies([]);
      toast.success(AddAgencyResponse?.data?.message, {
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
      const newArray = selectAgencies.map((el) => {
        return {
          assigned_by: Gfunc.useDecryptedLocalStorage(
            "username" + prefixe,
            secretKey
          ),
          assigned_date: Date.now(),
          id_agency: el.id_agency,
          name: el.name,
        };
      });
      setData([...newArray, ...data]);
      GetOtherAgency();
      AddAgencyClear();
    }
  }, [AddAgencyResponse, data, row, selectAgencies]);

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
      const newArray = Gfunc.DeleteElementfromArray(
        data,
        agencyId,
        "id_agency"
      );
      setData(newArray);
      setAgencyId(0);
      GetOtherAgency();
      DeleteClear();
    }
  }, [DeleteResponse, data, agencyId, GetOtherAgency]);

  //verifier si un utilisateur pourra etre supprimer
  useEffect(() => {
    if (
      agencyId &&
      // agencyIdRef.current &&
      agencyIdRef.current !== agencyId &&
      !openDialog
    ) {
      setOpenDialog(true);
      setMessage(lang?.deleteConfirm);
      setIcon("mdiCloseCircleOutline");
    }
  }, [agencyId, agencyIdRef.current, openDialog]);

  useEffect(() => {
    if (DeleteError) {
      setAgencyId(null);
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
      setOpenDialog(false);
    }
  }, [DeleteError, DeleteClear]);

  const handleClickOpen = () => {
    if (row.state !== 0 && row.state !== 3) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const confirmAction = () => {
    DeleteAgency();
  };

  const concleAction = () => {
    setAgencyId(null);
    setOpenDialog(false);
    DeleteClear();
  };

  //supprimer une agence  d'un utilisateur
  const handleDeleteAgency = (row) => {
    setAgencyId(row.id_agency);
  };

  const columns = [
    {
      name: lang?.name,
      selector: (row) => row.name,
      sortable: true,
      minWidth: "250px",
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
          <div onClick={() => handleDeleteAgency(row)}>
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
    if (selectAgencies.length > 0) {
      AddAgency();
    } else {
      toast.error(lang?.minAgency, {
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
        path={icons[Gfunc?.getIcon(Gfunc.firstToLower("agences"))]}
        size={0.9}
        onClick={handleClickOpen}
        style={{
          color: (row.state === 0 || row.state === 3) && "gray",
          cursor: row.state === 0 || row.state === 3 ? "wait" : "pointer",
        }}
      />
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: "800px",
            height: "fit-content",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <p>{lang?.attribute_agency_users_title} </p>
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
          <form id="formValidate">
            <StyledFieldset>
              <StyledLegend>{lang?.attribute_agency_users}</StyledLegend>
              <Grid2 container spacing={1} alignItems="center">
                <Grid2 item size={9}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    size="small"
                    options={
                      options?.length > 0
                        ? [
                            { id_agency: null, name: lang?.tous },
                            ...(options || []),
                          ]
                        : []
                    }
                    value={selectAgencies}
                    onChange={(event, newValue) => {
                      const isTousSelected = newValue.some(
                        (option) => option.id_agency === null
                      );

                      if (isTousSelected) {
                        if (selectAgencies.length !== options.length) {
                          setSelectAgencies(options || []);
                        } else {
                          // Si "Tous" est désélectionné, vider la sélection
                          setSelectAgencies([]);
                        }
                      } else {
                        // Sinon, mettre à jour avec les nouvelles valeurs sans "Tous"
                        setSelectAgencies(newValue);
                      }
                    }}
                    getOptionLabel={(option) =>
                      option.id_agency === null ? lang?.tous : option.name
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id_agency === value.id_agency
                    }
                    renderInput={(params) => (
                      <TextField {...params} label={lang?.Agences} />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue
                        .filter((option) => option.id_agency !== null) // Ne pas afficher "Tous"
                        .map((option, index) => (
                          <Chip
                            label={option.name}
                            {...getTagProps({ index })}
                            key={option.id_agency}
                          />
                        ))
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          sx={{ marginRight: 1 }}
                          checked={
                            option.id_agency === null
                              ? selectAgencies.length === options?.length
                              : selected
                          }
                        />
                        {option.id_agency === null ? lang?.tous : option.name}
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
User_agencies.propTypes = {
  row: PropTypes.object.isRequired,
};
