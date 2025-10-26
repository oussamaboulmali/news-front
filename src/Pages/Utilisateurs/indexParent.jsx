import {
  Autocomplete,
  Button,
  Card,
  CircularProgress,
  ClickAwayListener,
  Grid2,
  InputAdornment,
  Menu,
  MenuItem,
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
import UserAdd from "./userAdd";
import UserAgencies from "./userAgencies";
import Rest_password from "./restPassword";
import ContentEditable from "react-contenteditable/lib/react-contenteditable";
import ConfirmDialog from "../../UI/Alerts/ConfirmDialogue";
import ExcelJS from "exceljs";
import NoDataFound from "../../noData/noDataFound";
import User_details from "./userDetails";

export default function Index() {
  const { baseUrl, lang } = useContext(ContextProvider);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [FiltredData, setFiltredData] = useState([]);
  const [stateValue, setStateValue] = useState({});
  const [updateValue, setUpdateValue] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [icon, setIcon] = useState(null);
  const [anchorEls, setAnchorEls] = useState({});
  const [rowId, setRowId] = useState(null);
  const [att, setAtt] = useState(null);
  const [note, setNote] = useState(null);
  const [editing, setEditing] = useState(false);
  const prevDataRef = useRef(updateValue);
  const prevStateRef = useRef(stateValue);
  const stats = [
    { id: null, name: "Tous", color: "" },
    { id: 0, name: "Désactivé", color: "gray" },
    { id: 1, name: "Actif", color: "green" },
    { id: 2, name: "Bloqué", color: "red" },
    { id: 3, name: "Corbeille", color: "darkorange", icon: "mdiDelete" },
  ];
  const actions = [
    {
      id: 0,
      name: "Désactiver",
      message: lang?.desativateConfirm,
      icon: "mdiCancel",
    },
    {
      id: 1,
      name: "Activer",
      message: lang?.ativateConfirm,
      icon: "mdiCheckCircle",
    },
    {
      id: 2,
      name: "Débloquer",
      message: lang?.DebloqueConfirm,
      icon: "mdiCheckCircle",
    },
    {
      id: 3,
      name: "Supprimer",
      message: lang?.deleteConfirm,
      icon: "mdiDelete",
    },
  ];

  const handleClick = (event, rowId) => {
    setAnchorEls((prev) => ({
      ...prev,
      [rowId]: event.currentTarget,
    }));
  };

  const handleClose = (rowId) => {
    setAnchorEls((prev) => ({
      ...prev,
      [rowId]: null,
    }));
  };

  // Utilisation de useAxios pour connecter
  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "users",
    body: {},
  });

  //recuprer les infos utilisateurs
  const {
    response: UserInfoResponse,
    loading: UserInfoloading,
    error: UserInfoError,
    fetchData: GetUserInfo,
    clearData: UserInfoClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/roles",
    body: {},
  });

  useEffect(() => {
    if (!response) {
      fetchData();
    }
  }, [response]);

  useEffect(() => {
    if (!UserInfoResponse) {
      GetUserInfo();
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
    body: { ...stateValue?.body, note: note },
  });

  //useAxios pour modifier un utilisateur
  const {
    response: UpdateResponse,
    loading: UpdateLoading,
    error: UpdateError,
    fetchData: UpdateFetchData,
    clearData: UpdateClearData,
  } = useAxios({
    method: updateValue?.method,
    url: updateValue?.url,
    body: updateValue?.body,
  });

  //si stateValue est remplis on fait appelle au service adéquat
  useEffect(() => {
    if (
      Object.keys(stateValue).length !== 0 &&
      JSON.stringify(stateValue) !== JSON.stringify(prevStateRef?.current)
    ) {
      setOpenDialog(true);
      setMsg(stateValue?.choice?.message);
      setIcon(stateValue?.choice?.icon);
    }
  }, [stateValue]);

  //changer letat d'un utilisateur
  const handleChangeStateUser = (row, state) => {
    const arr = {
      userId: row.id_user,
      state: state.id === 2 ? 1 : state.id,
    };
    setStateValue({
      method: "put",
      url: "users/state",
      body: arr,
      row: row,
      choice: state,
    });
  };

  //tester si il y'a une réponse positive de changement d'état
  useEffect(() => {
    if (StateResponse && StateResponse?.data?.success) {
      setNote(null);
      setConfirmError(null);
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
      const updatedData = data.map((el) => {
        if (stateValue?.row?.id_user === el?.id_user) {
          return {
            ...el,
            state: stateValue.choice.id === 2 ? 1 : stateValue.choice.id,
            note: note,
          };
        }
        return el;
      });
      const updatedFiltredData = FiltredData.map((el) => {
        if (stateValue?.row?.id_user === el?.id_user) {
          return {
            ...el,
            state: stateValue.choice.id === 2 ? 1 : stateValue.choice.id,
            note: note,
          };
        }
        return el;
      });
      setData(updatedData);
      setFiltredData(updatedFiltredData);
      setAnchorEls({});
      setStateValue({});
      StateClearData();
    }
  }, [StateResponse]);

  //si il y'a une erreur de suppression depuis le service affiche un message d'erreur
  useEffect(() => {
    if (StateError) {
      setNote(null);
      setConfirmError(null);
      setStateValue({});
      StateClearData({});
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

  const confirmAction = (note) => {
    setOpenDialog(false);

    if (Object.keys(stateValue).length !== 0) {
      setNote(note);
      StateData();
      StateClearData();
    }
    if (Object.keys(updateValue).length !== 0) {
      UpdateFetchData();
      UpdateClearData();
    }
  };

  const concleAction = () => {
    setOpenDialog(false);
    if (Object.keys(stateValue).length !== 0) {
      StateClearData();
    }
    if (Object.keys(updateValue).length !== 0) {
      const rowIndex = data.findIndex(
        (item) => item.id_user === updateValue.row.id_user
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
        url: baseUrl + "users/update",
        body: {
          [att]: value,
          userId: row.id_user,
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
      prevDataRef.current &&
      prevDataRef.current !== updateValue
    ) {
      setOpenDialog(true);
      setMsg(lang?.updateConfirm);
      setIcon("mdiUpdate");
    }
  }, [updateValue]);

  //les instruction a executer si la modification d'une categorie est effectue avec succéss
  useEffect(() => {
    if (UpdateResponse && UpdateResponse?.data?.success) {
      const rowIndex = data.findIndex(
        (item) => item.id_user === updateValue.row.id_user
      );

      if (rowIndex !== -1) {
        const newData = [...data];

        // Si updateValue.att est "serviceId", on met à jour le service
        if (updateValue.att === "serviceId") {
          const subRowIndex = UserInfoResponse?.data?.data?.services?.findIndex(
            (item) => item.id_service === updateValue.body.serviceId
          );

          if (subRowIndex !== -1) {
            newData[rowIndex] = {
              ...newData[rowIndex],
              service: UserInfoResponse?.data?.data?.services[subRowIndex].name,
            };
          }
        } else {
          // Sinon, on met à jour l'attribut général
          newData[rowIndex] = {
            ...newData[rowIndex],
            [updateValue.att]: updateValue.body[updateValue.att],
          };
        }
        setData(newData);
      }

      // Nettoyage de la réponse et réinitialisation de l'état
      UpdateClearData();
      setUpdateValue({});
    }
  }, [UpdateResponse, updateValue]);

  useEffect(() => {
    if (UpdateError) {
      toast.error(UpdateError, {
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
      //updateValue.row[updateValue.att] = updateValue.oldValue;
      const rowIndex = data.findIndex(
        (item) => item.id_user === updateValue.row.id_user
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
      setUpdateValue({});
    }
  }, [UpdateError, updateValue]);

  const getFilteredActions = (currentState) => {
    switch (currentState) {
      case 0: // Désactivé
        return actions.filter((action) => action.id === 1 || action.id === 3); // Activer, Supprimer
      case 1: // Activé
        return actions.filter((action) => action.id === 0 || action.id === 3); // Désactiver, Supprimer
      case 2: // Bloqué
        return actions.filter((action) => action.id === 1 || action.id === 3); // Activer, Supprimer
      /* default:
          return actions; // Affiche tout par défaut */
    }
  };

  const handleChangeToEditing = (row, att) => {
    setRowId(row.id_user);
    setAtt(att);
    setEditing(true);
  };

  const columns = [
    {
      name: lang?.name,
      selector: (row) => row.designation,
      sortable: true,
      minWidth: "250px",
      wrap: true,
      cell: (row) => {
        return (
          <ContentEditable
            className="content-editable"
            html={row.designation}
            onBlur={(e) => {
              const { isValid, cleanedString } = Gfunc.validateAndCleanString(
                e.target.innerHTML
              );
              if (isValid) {
                handleOnEdit(e, row, cleanedString, "designation");
              } else {
                toast.error(lang?.userAlert, {
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
                e.target.innerHTML = row.designation;
              }
            }}
          />
        );
      },
    },
    {
      name: lang?.username,
      selector: (row) => row.username,
      sortable: true,
      wrap: true,
    },
    {
      name: lang?.role,
      selector: (row) => row.role,
      sortable: true,
      wrap: true,
    },
    {
      name: lang?.service,
      selector: (row) => row.service,
      minWidth: "200px",
      sortable: true,
      wrap: true,
      cell: (row) => {
        return (
          <div style={{ width: "90%" }}>
            {row.role === "abonné" &&
            editing &&
            row.id_user === rowId &&
            att === "service" ? (
              <ClickAwayListener
                onClickAway={() => {
                  setRowId(null);
                  setAtt(null);
                }}
              >
                <Autocomplete
                  value={
                    UserInfoResponse?.data?.data?.services.find(
                      (service) => service.name === row.service
                    ) || {}
                  }
                  options={
                    UserInfoResponse?.data?.data?.services.slice(0, 3) || []
                  }
                  getOptionLabel={(option) => option?.name || ""}
                  onChange={(e, newValue) => {
                    if (newValue) {
                      handleOnEdit(e, row, newValue.id_service, "serviceId");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Service"
                      size="small"
                      fullWidth
                      onBlur={() => {
                        setRowId(null);
                        setAtt(null);
                      }}
                    />
                  )}
                />
              </ClickAwayListener>
            ) : (
              <div onClick={() => handleChangeToEditing(row, "service")}>
                {row.service || ""}
              </div>
            )}
          </div>
        );
      },
    },
    {
      name: lang?.state,
      sortable: true,
      wrap: true,
      cell: (row) => {
        return (
          <div
            style={{
              color: stats.find((item) => item.id === row.state)?.color,
            }}
          >
            {stats.find((item) => item.id === row.state)?.name}
          </div>
        );
      },
    },
    {
      name: lang?.lastVisite_date,
      selector: (row) => row.lastvisit_date,
      sortable: true,
      wrap: true,
      cell: (row) => {
        return <div>{Gfunc.formaterDate(row.lastvisit_date)}</div>;
      },
    },
    {
      right: true,
      cell: (row) => {
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "22% 22% 22% 22%",
              gridGap: "8px",
              alignItems: "center",
              marginRight: "25px",
            }}
          >
            <UserAgencies row={row} />
            <Rest_password row={row} />
            <div>
              <Icon
                path={icons["mdiStateMachine"]}
                size={1}
                style={{
                  color:
                    getFilteredActions(row.state)?.length !== undefined
                      ? "blue"
                      : "gray",
                  cursor: row.state === 3 ? "wait" : "pointer",
                }}
                onClick={(e) => handleClick(e, row.id_user)}
                title={lang?.changeState}
              />

              {getFilteredActions(row.state)?.length !== undefined && (
                <Menu
                  anchorEl={anchorEls[row.id_user]}
                  open={Boolean(anchorEls[row.id_user])}
                  onClose={() => handleClose(row.id_user)}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  {getFilteredActions(row.state)?.map((status) => (
                    <MenuItem
                      key={status.id}
                      onClick={() => handleChangeStateUser(row, status)}
                    >
                      {status?.name}
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </div>
            <User_details row={row} />
          </div>
        );
      },
    },
  ];

  //filter le table d'utilisateur
  const handleSearch = (term) => {
    const termLowerCase = term?.toLowerCase() || "";
    const filteredArray = FiltredData.filter((user) => {
      return (
        user?.designation?.toLowerCase().includes(termLowerCase) ||
        user?.username?.toLowerCase().includes(termLowerCase) ||
        user?.email?.toLowerCase().includes(termLowerCase)
      );
    });
    setData(filteredArray);
  };

  const exportToCSV = () => {
    const workbook = new ExcelJS.Workbook();

    const processedData = data.map((item) => {
      const {
        id_user,
        lastvisit_date,
        register_date,
        agencies,
        service,
        state,
        ...rest
      } = item;

      return {
        ...rest,
        service: service,
        state: state === 1 ? "Active" : "Désactivé",
        register_date: Gfunc.formaterDate(register_date),
        lastVisite_date: Gfunc.formaterDate(lastvisit_date),
        agencies: Array.isArray(agencies)
          ? agencies
              .map((agency, index) =>
                index % 10 === 9 ? agency + "\n" : agency
              )
              .join("; ")
          : agencies,
      };
    });

    // Grouper les données par catégorie (ex: rôle ou autre critère)
    const groupedData = processedData?.reduce((groups, item) => {
      const category = item.service.toUpperCase() || "";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});

    // Créer une feuille pour chaque catégorie
    Object.keys(groupedData).forEach((category) => {
      const worksheet = workbook.addWorksheet(category);

      // Extraire dynamiquement les clés de l'objet pour définir les colonnes
      const columns = Object.keys(groupedData[category][0]).map((key) => {
        const maxWidth = Math.max(
          key.length,
          ...groupedData[category].map((item) =>
            item[key] ? item[key].toString().length : 0
          )
        );

        return {
          header:
            key === "designation"
              ? lang?.name
              : Gfunc.formatAndCapitalize(
                  key.charAt(0).toUpperCase() + key.slice(1)
                ),
          key: key,
          width: key !== "agencies" ? maxWidth + 2 : 160,
        };
      });

      // Ajouter les colonnes à la feuille
      worksheet.columns = columns;

      // Ajouter les styles aux en-têtes
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "000" }, size: 12 };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 20;

      // Ajouter un fond gris clair
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Ajouter les données avec gestion du wrapText et hauteur de ligne
      groupedData[category].forEach((item, rowIndex) => {
        const row = worksheet.addRow(item);

        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            vertical: "top",
            horizontal: "left",
            wrapText: true,
          };
          cell.font = { size: 11 };

          // Vérifier si c'est la colonne agencies (ajuster selon la structure de ton Excel)
          if (worksheet.columns[colNumber - 1].key === "agencies") {
            const agenciesCount = item.agencies
              ? item.agencies.split(";").length
              : 0;
            //row.height = agenciesCount > 10 ? 30 : 20;
            row.height = 30;
          }
        });

        // Ajouter un style de fond alterné pour les lignes
        if (rowIndex % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF2F2F2" },
            };
          });
        }
      });

      // Appliquer des bordures aux en-têtes
      worksheet.getRow(1).eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Sauvegarder le fichier
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Télécharger le fichier
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download =
        "Compte_NewsOnline_abonnés_Global_" +
        Gfunc.formaterDate(Date.now()) +
        ".xlsx";
      link.click();
    });
  };

  // Filtrer les données
  const filteredData = (newValue) => {
    if (newValue?.id !== undefined && newValue?.id !== null) {
      const filteredArray = FiltredData.filter((user) => {
        const matchesState = newValue ? user?.state === newValue?.id : true;
        return matchesState;
      });
      setData(filteredArray);
    } else {
      setData(FiltredData);
    }
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
        justifyContent="space-between"
      >
        {/* Champ de recherche et filtre */}
        <Grid2
          item
          container
          spacing={1}
          xs={12}
          sm={8}
          md={8}
          alignItems="center"
        >
          {/* Champ de recherche */}
          <Grid2 item xs={12} sm={6} md={6}>
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
              fullWidth
            />
          </Grid2>
          {/* Champ de filtre (Autocomplete) */}
          <Grid2 item xs={12} sm={6} md={6}>
            <Autocomplete
              options={stats}
              getOptionLabel={(option) => option.name}
              onChange={(event, newValue) => filteredData(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={lang?.filtre}
                  size="small"
                  fullWidth
                  sx={{ minWidth: "250px" }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              clearOnEscape
            />
          </Grid2>
        </Grid2>

        {/* Conteneur pour le bouton de téléchargement et UserAdd */}
        <Grid2 item xs={12} sm={4} md={4}>
          <Grid2
            container
            spacing={0}
            alignItems="center"
            justifyContent="flex-end"
          >
            <Grid2 item>
              <Button
                variant="contained"
                color="primary"
                onClick={exportToCSV}
                title={lang?.downloadUser}
              >
                <Icon path={icons.mdiDownload} size={1} />
              </Button>
            </Grid2>
            <Grid2 item>
              <UserAdd
                setData={setData}
                data={data}
                UserInfoResponse={UserInfoResponse}
              />
            </Grid2>
          </Grid2>
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
            rowsPerPageText: lang?.page_item,
            rangeSeparatorText: lang?.de,
            selectAllRowsItem: true,
            selectAllRowsItemText: lang?.tous,
          }}
        />
      </Card>
      <ConfirmDialog
        open={openDialog}
        message={msg}
        setConfirmError={setConfirmError}
        confirmError={confirmError}
        confirmAction={confirmAction}
        concleAction={concleAction}
        warning={lang?.warning}
        buttonConfirm={lang?.confirm}
        buttonCancle={lang?.cancel}
        obesrvation={lang?.note}
        confirmErrorMsg={lang?.confirmError}
        withInput={true}
        note={note}
        setNote={setNote}
      >
        <Icon path={icons[icon]} size={3} style={{ color: "red" }} />
      </ConfirmDialog>
    </Fragment>
  );
}
