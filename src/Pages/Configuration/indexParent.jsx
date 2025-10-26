import {
  Card,
  CircularProgress,
  Grid2,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { ContextProvider } from "../../Context/contextProvider";
import DataTable from "react-data-table-component";
import { customStyles } from "../../assets/styles/datatable_costum";
import { mdiTextSearch } from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import Icon from "@mdi/react";
import { toast } from "react-toastify";
import AgenciesAdd from "./agenciesAdd";
import AgenciesUser from "./agenciesUser";
import AgenciesImage from "./agenciesImage";
import ConfirmDialog from "../../UI/Alerts/ConfirmDialogue";
import ContentEditable from "react-contenteditable/lib/react-contenteditable";
import NoDataFound from "../../noData/noDataFound";

export default function Index() {
  const { baseUrl, lang } = useContext(ContextProvider);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [FiltredData, setFiltredData] = useState([]);
  const [stateValue, setStateValue] = useState({});
  const [updateValue, setUpdateValue] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [msg, setMsg] = useState(null);
  const [icon, setIcon] = useState(null);
  const prevDataRef = useRef(updateValue);
  const prevStateRef = useRef(stateValue);

  // Utilisation de useAxios pour connecter
  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "agencies",
    body: {},
  });

  useEffect(() => {
    if (!response) {
      fetchData();
    }
  }, [response]);

  useEffect(() => {
    if (response && response?.data?.success) {
      setData(response?.data?.data);
      setFiltredData(response?.data?.data);
    }
  }, [response]);

  //appele d'axios personnaliser pour la changer l'etat d'un utilisateur
  const {
    response: StateResponse,
    loading: StateLoading,
    error: StateError,
    fetchData: StateData,
    clearData: StateClearData,
  } = useAxios({
    method: stateValue?.method,
    url: baseUrl + stateValue?.url,
    body: stateValue?.body,
  });

  //useAxios pour modifier une agence
  const {
    response: UpdateResponse,
    loading: UpdateLoading,
    error: UpdateError,
    fetchData: UpdateFetchData,
    clearData: UpdateClearData,
  } = useAxios({
    method: updateValue.method,
    url: updateValue.url,
    body: updateValue.body,
  });

  //si stateValue est remplis on fait appelle au service adéquat
  useEffect(() => {
    if (
      Object.keys(stateValue).length !== 0 &&
      JSON.stringify(stateValue) !== JSON.stringify(prevStateRef?.current)
    ) {
      setOpenDialog(true);
      setMsg(
        stateValue.row.state === true
          ? lang?.desativateConfirm + " " + lang?.alert
          : lang?.ativateConfirm
      );
      setIcon(stateValue.row.state === true ? "mdiCancel" : "mdiCheckCircle");
    }
  }, [stateValue]);

  //get icon specifique a l'etat d'un utilisateur
  const handleIconState = (value) => {
    switch (value) {
      case true:
        return ["mdiCheckCircle", "green", "Utilisateur activé"];
      case false:
        return ["mdiCancel", "red", "Utilisateur désactivé"];
    }
  };

  //changer letat d'un utilisateur
  const handleChangeStateAgency = (row) => {
    const arr = {
      agencyId: row.id_agency,
    };

    setStateValue({
      method: "put",
      url: "agencies/state",
      body: arr,
      row: row,
    });
  };

  //tester si il y'a une réponse positive de changement d'état
  useEffect(() => {
    if (StateResponse && StateResponse?.data?.success) {
      toast.success(StateResponse?.data?.message, {
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
      const updatedData = data.map((row) => {
        if (stateValue.row.id_agency === row.id_agency) {
          if (!row.state) {
            return { ...row, state: true };
          } else {
            return { ...row, state: false };
          }
        }
        return row;
      });

      setData(updatedData);

      setStateValue({});
      StateClearData();
    }
  }, [StateResponse]);

  //si il y'a une erreur de suppression depuis le service affiche un message d'erreur
  useEffect(() => {
    if (StateError) {
      setStateValue({});
      StateClearData();
      toast.error(StateError, {
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
  }, [StateError]);

  const confirmAction = () => {
    setOpenDialog(false);
    if (Object.keys(stateValue).length !== 0) {
      StateData();
    }
    if (Object.keys(updateValue).length !== 0) {
      UpdateFetchData();
    }
  };

  const concleAction = () => {
    setOpenDialog(false);
    if (Object.keys(stateValue).length !== 0) {
      StateClearData();
    }
    if (Object.keys(updateValue).length !== 0) {
      const rowIndex = data.findIndex(
        (item) => item.id_agency === updateValue.row.id_agency
      );
      if (rowIndex !== -1) {
        const newData = [...data];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [updateValue.att]: updateValue.oldValue,
        };
        setData(newData);
      }
      UpdateClearData();
    }
  };

  const handleOnEdit = (e, row, value, att) => {
    const oldVal = row[att];
    if (row[att] !== value && value !== "") {
      setUpdateValue({
        row: row,
        method: "put",
        url: baseUrl + "agencies/update",
        body: {
          [att]: value,
          agencyId: row.id_agency,
        },
        oldValue: row[att],
        att: att,
      });
    } else {
      e.target.innerHTML = oldVal;
    }
  };

  //faire un appelle a l'api de modification
  useEffect(() => {
    if (
      Object.keys(updateValue).length !== 0 &&
      prevDataRef?.current !== updateValue
    ) {
      setOpenDialog(true);
      setMsg(lang?.updateConfirm);
      setIcon("mdiUpdate");
    }
  }, [updateValue, prevDataRef?.current]);

  //les instruction a executer si la modification d'une categorie est effectue avec succéss
  useEffect(() => {
    if (UpdateResponse && UpdateResponse?.data?.success) {
      const rowIndex = data.findIndex(
        (item) => item?.id_agency === updateValue?.row?.id_agency
      );
      if (rowIndex !== -1) {
        const newData = [...data];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [updateValue.att]: updateValue.body[updateValue.att],
        };
        setData(newData);
      }

      UpdateClearData();
      setUpdateValue({});
    }
  }, [UpdateResponse, updateValue]);

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

      const rowIndex = data?.findIndex(
        (item) => item.id_agency === updateValue.row.id_agency
      );
      if (rowIndex !== -1) {
        const newData = [...data];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [updateValue.att]: updateValue.oldValue,
        };
        setData(newData);
        UpdateClearData();
        setOpenDialog(false);
        setUpdateValue({});
      }
    }
  }, [UpdateError, updateValue]);

  const columns = [
    {
      width: "80px",
      conditionalCellStyles: [
        {
          when: (row) => row.hasOwnProperty("url"),
          style: {
            paddingLeft: "10px",
            paddingTop: "5px",
          },
        },
      ],
      cell: (row) => {
        return (
          <div key={Math.random()}>
            <AgenciesImage row={row} data={data} setData={setData} />
          </div>
        );
      },
    },
    {
      name: lang?.name,
      selector: (row) => row.name,
      sortable: true,
      minWidth: "250px",
      wrap: true,
      cell: (row) => {
        return (
          <ContentEditable
            className="content-editable"
            html={row.name}
            onBlur={(e) => {
              const { isValid, cleanedString } = Gfunc.validateAndCleanString(
                e.target.innerHTML
              );
              if (isValid) {
                handleOnEdit(e, row, cleanedString, "name");
              } else {
                toast.error(lang?.agencyAlert, {
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
                e.target.innerHTML = row.name;
              }
            }}
          />
        );
      },
    },
    {
      name: lang?.created_date,
      selector: (row) => row.created_date,
      sortable: true,
      wrap: true,
      cell: (row) => {
        return <div>{Gfunc.formaterDate(row.created_date)}</div>;
      },
    },
    {
      name: lang?.created_by,
      selector: (row) => row.created_by,
      sortable: true,
      wrap: true,
    },
    {
      name: lang?.modified_date,
      selector: (row) => row.modified_date,
      sortable: true,
      wrap: true,
      cell: (row) => {
        return <div>{Gfunc.formaterDate(row.modified_date)}</div>;
      },
    },
    {
      name: lang?.modified_by,
      selector: (row) => row.modified_by,
      sortable: true,
      wrap: true,
    },
    {
      right: true,
      cell: (row) => {
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "49% 49%",
              gridGap: "5px",
              alignItems: "center",
            }}
          >
            <AgenciesUser row={row} />
            <Icon
              path={icons[handleIconState(row.state)[0]]}
              size={0.9}
              style={{
                color: handleIconState(row.state)[1],
                cursor: "pointer",
              }}
              onClick={() => handleChangeStateAgency(row)}
              title={
                row.state === true ? lang?.activeAgency : lang?.desactiveAgency
              }
            />
          </div>
        );
      },
    },
  ];

  //filter le table d'utilisateur
  const handleSearch = (term) => {
    const termLowerCase = term?.toLowerCase() || "";
    const filteredArray = FiltredData.filter((agency) => {
      return (
        agency?.name?.toLowerCase().includes(termLowerCase) ||
        agency?.name?.toLowerCase().includes(termLowerCase) ||
        agency?.modified_by?.toLowerCase().includes(termLowerCase)
      );
    });
    setData(filteredArray);
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "80vh",
          display: "grid",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Fragment>
      <Grid2
        container
        sx={{ marginBottom: "15px", alignItems: "center" }}
        justifyContent={"space-between"}
      >
        <Grid2 item xs={5}>
          <TextField
            id="input-with-icon-textfield"
            name="input-with-icon-textfield"
            label={lang?.search}
            placeholder={lang?.search}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon path={mdiTextSearch} size={0.8} />
                </InputAdornment>
              ),
            }}
            size="small"
            variant="outlined"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Grid2>
        <Grid2 item xs={2}>
          <AgenciesAdd setData={setData} data={data} />
        </Grid2>
      </Grid2>
      <Card>
        <DataTable
          noDataComponent={<NoDataFound />}
          responsive
          columns={columns}
          data={data}
          customStyles={customStyles}
          fixedHeader
          //persistTableHead
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30]}
          highlightOnHover
          paginationDefaultPage={currentPage}
          onChangePage={(page) => {
            setCurrentPage(page);
          }}
          paginationComponentOptions={{
            rowsPerPageText: lang.page_item,
            rangeSeparatorText: lang.de,
            selectAllRowsItem: true,
            selectAllRowsItemText: lang.tous,
          }}
        />
      </Card>
      <ConfirmDialog
        open={openDialog}
        message={msg}
        confirmAction={confirmAction}
        concleAction={concleAction}
        warning={lang?.warning}
        buttonConfirm={lang?.confirm}
        buttonCancle={lang?.cancel}
      >
        <Icon path={icons[icon]} size={3} style={{ color: "red" }} />
      </ConfirmDialog>
    </Fragment>
  );
}
