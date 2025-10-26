import { useNavigate, useSearchParams } from "react-router-dom";
import { ContextProvider } from "../../Context/contextProvider";
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAxios } from "../../services/useAxios";
import {
  Grid2,
  TextField,
  InputAdornment,
  Card,
  Divider,
  TablePagination,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import Icon from "@mdi/react";
import {
  mdiCalendar,
  mdiListBox,
  mdiPost,
  mdiTextSearch,
  mdiViewList,
} from "@mdi/js";
import DataTable from "react-data-table-component";
import { customStyles } from "../../assets/styles/datatable_costum";
import * as Gfunc from "../../helpers/Gfunc";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/fr";
import "dayjs/locale/ar-dz";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import NoDataFound from "../../noData/noDataFound";

export default function AgencyContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { baseUrl, emptyData, lang, prefixe, secretKey } =
    useContext(ContextProvider);
  const agencyId = Gfunc.useDecryptedUrl(
    searchParams.get("n"),
    secretKey
  )?.agencyId;

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(30);
  const [totalRows, setTotalRows] = useState(0);
  const [sortInfo, setSortInfo] = useState({});
  const [viewMode, setViewMode] = useState("table");
  const [search, setSearch] = useState("");
  const [refreshDuration, setRefreshDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedStartDate, setSelectedStartDate] = useState(
    dayjs().subtract(15, "day")
  );
  const [selectedEndDate, setSelectedEndDate] = useState(dayjs());
  const [isChangeDuration, setIsChangeDuration] = useState(false);
  const predefinedDurations = ["0", "5", "10", "30"];
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const intervalRef = useRef(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(true);

  // Fermer le sidebar automatiquement en mode mobile
  useEffect(() => {
    if (isMobile) {
      setViewMode("list");
    }
  }, [isMobile]);

  // Utilisation de useAxios pour connecter
  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "agencies/articles",
    body: {
      agencyId:
        parseInt(agencyId) ||
        parseInt(
          Gfunc.useDecryptedLocalStorage("agencyId" + prefixe, secretKey)
        ),
      date: selectedDate.format("YYYY-MM-DD"),
      pageSize: perPage,
      page: currentPage,
      ...(Object.keys(sortInfo).length !== 0 && { sortInfo }),
    },
  });

  //useAxios pour rechercher une image
  const {
    response: SearchResponse,
    loading: Searchloading,
    error: SearchError,
    fetchData: SearchArticle,
    clearData: SearchClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "agencies/articles/search",
    body: {
      agencyId:
        parseInt(agencyId) ||
        parseInt(
          Gfunc.useDecryptedLocalStorage("agencyId" + prefixe, secretKey)
        ),
      date: selectedDate.format("YYYY-MM-DD"),
      searchText: search,
      pageSize: perPage,
      page: currentPage,
      ...sortInfo,
      ...(showAdvancedSearch && {
        date_start: selectedStartDate.format("YYYY-MM-DD"),
        date_finish: selectedEndDate.format("YYYY-MM-DD"),
      }),
    },
  });

  //useAxios pour actualiser la page
  const {
    response: RefreshResponse,
    loading: Refreshloading,
    error: RefreshError,
    fetchData: RefreshDuration,
    clearData: RefreshClear,
  } = useAxios({
    method: "put",
    url: baseUrl + "users/refresh",
    body: {
      refreshTime:
        refreshDuration === "Aucune"
          ? 0
          : parseInt(refreshDuration.replace(" min", ""), 10),
    },
  });

  useEffect(() => {
    const handleFetch = async () => {
      if (!response && shouldFetch) {
        await fetchData();
      }
    };

    handleFetch();
  }, [response, shouldFetch, fetchData]);

  useEffect(() => {
    if (response && response?.data?.success) {
      setShouldFetch(false);
      setData(response?.data?.data?.articles);
      setTotalRows(response?.data?.data?.count);
      setRefreshDuration(
        response?.data?.data?.refreshTime === 0
          ? "Aucune"
          : response?.data?.data?.refreshTime + " min"
      );
    }
  }, [response]);

  useEffect(() => {
    if (SearchResponse && SearchResponse?.data?.success) {
      setData(SearchResponse?.data?.data?.articles);
      setTotalRows(SearchResponse?.data?.data?.count);
    }
  }, [SearchResponse]);

  const handleChangeContent = (row) => {
    navigate(row.id_article.toString(), {
      state: {
        agencyId: JSON.stringify(row?.id_article),
        ligne: JSON.stringify(row),
        search: search,
      },
    });
  };

  const columns = [
    {
      wrap: true,
      width: "120px",
      cell: (row) => {
        return (
          <div
            style={{ display: "flex", gridGap: "3px", alignItems: "center" }}
            onClick={() => handleChangeContent(row)}
          >
            <Icon path={mdiPost} size={1.2} />
            <b>{row.label}</b>
          </div>
        );
      },
    },
    {
      name: lang?.title,
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
      sortField: "title",
      grow: 1.5,
      cell: (row) => {
        const textToShow =
          row.title.length > 50
            ? row.title.substring(0, 50) + "..."
            : row.title;
        return (
          <div onClick={() => handleChangeContent(row)} title={row.title}>
            {textToShow}
          </div>
        );
      },
    },
    {
      name: lang?.slug,
      selector: (row) => row.slug,
      sortable: true,
      wrap: true,
      sortField: "slug",
      cell: (row) => (
        <div onClick={() => handleChangeContent(row)}>{row.slug}</div>
      ),
    },
    {
      name: lang?.full_text,
      selector: (row) => row.full_text,
      sortable: true,
      wrap: true,
      sortField: "full_text",
      grow: 1.5,
      cell: (row) => {
        const stripHtml = (html) => html.replace(/<\/?[^>]+(>|$)/g, "");
        const cleanText = stripHtml(row?.full_text || "");
        const textToShow =
          cleanText.length > 50
            ? cleanText.substring(0, 50) + "..."
            : cleanText;

        return (
          <div
            title={cleanText}
            style={{ whiteSpace: "normal", wordWrap: "break-word" }}
            onClick={() => handleChangeContent(row)}
          >
            {textToShow}
          </div>
        );
      },
    },
    {
      name: lang?.publish_date,
      selector: (row) => row.created_date,
      sortable: true,
      wrap: true,
      sortField: "created_date",
      cell: (row) => {
        return (
          <div onClick={() => handleChangeContent(row)}>
            {Gfunc.formaterDate(row.created_date)}
          </div>
        );
      },
    },
  ];

  const handleChangeStyle = (choice) => {
    setViewMode(choice);
  };

  useEffect(() => {
    if (Object.keys(sortInfo).length !== 0) {
      search === ""
        ? axios
            .post(
              baseUrl + "agencies/articles",
              {
                agencyId:
                  parseInt(agencyId) ||
                  parseInt(
                    Gfunc.useDecryptedLocalStorage(
                      "agencyId" + prefixe,
                      secretKey
                    )
                  ),
                date: selectedDate.format("YYYY-MM-DD"),
                pageSize: perPage,
                page: currentPage,
                ...sortInfo,
              },
              {
                withCredentials: true,
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": import.meta.env.VITE_APP_ID,
                },
              }
            )
            .then(function (response) {
              setData(response?.data?.data?.articles);
            })
            .catch(function (error) {
              toast.error(message, {
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
            })
        : SearchArticle();
    }
  }, [sortInfo]);

  const handleSort = (column, sortDirection) => {
    if (sortDirection && column?.sortField) {
      const sortedArray = {
        order: { [column?.sortField]: sortDirection },
      };
      setSortInfo(sortedArray);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    clearData();
    setShouldFetch(true);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage + 1);
    clearData();
    setShouldFetch(true);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    clearData();
    setShouldFetch(true);
  };

  //appeller la fonction de recherche
  const OnKeyPressSearch = (event) => {
    if (event.key === "Enter") {
      setData([]);
      SearchArticle();
    }
  };

  // useEffect pour l'actualisation selon la durée définie
  useEffect(() => {
    if (refreshDuration !== "Aucune" && response?.data?.success) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const durationInMs =
        parseInt(refreshDuration.replace(" min", ""), 10) * 60000;
      // Ajouter un délai initial
      const timer = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          clearData();
          fetchData();
        }, durationInMs);
      }, durationInMs); // Premier délai égal à la durée de rafraîchissement

      return () => {
        clearTimeout(timer);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshDuration, response]);

  // useEffect pour l'appller la fonction de setRefreshDuration
  useEffect(() => {
    if (isChangeDuration) {
      RefreshDuration();
    }
  }, [isChangeDuration]);

  // useEffect pour l'actualisation selon la durée définie
  useEffect(() => {
    if (RefreshResponse && RefreshResponse.data.success) {
      setIsChangeDuration(false);
    }
  }, [RefreshResponse]);

  const handleChangeDuration = (value) => {
    setRefreshDuration(value);
    setIsChangeDuration(true);
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
        <Grid2 container spacing={1} alignItems="center">
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
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyPress={OnKeyPressSearch}
            />
          </Grid2>
          <Grid2 item xs={6} disabled={showAdvancedSearch}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={
                Gfunc.useDecryptedLocalStorage(
                  "langId" + prefixe,
                  secretKey
                ) === "1"
                  ? "ar-dz"
                  : "fr"
              }
            >
              <DatePicker
                label={lang?.selected_date}
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                  clearData();
                  setShouldFetch(true);
                }}
                inputFormat={
                  Gfunc.useDecryptedLocalStorage(
                    "langId" + prefixe,
                    secretKey
                  ) === "1"
                    ? "YYYY/MM/DD"
                    : "DD/MM/YYYY"
                }
                disabled={showAdvancedSearch}
                slotProps={{
                  textField: {
                    size: "small",
                    variant: "outlined",
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid2>
          <Grid2 item sx={5}>
            <Button
              variant={!showAdvancedSearch ? "outlined" : "contained"}
              size="small"
              color={!showAdvancedSearch ? "" : "primary"}
              onClick={() => {
                setShowAdvancedSearch(!showAdvancedSearch);
              }}
            >
              {lang?.advenced_search}
            </Button>
          </Grid2>
        </Grid2>
        {!isMobile ? (
          <Grid2
            container
            sx={{
              marginLeft:
                Gfunc.useDecryptedLocalStorage(
                  "langId" + prefixe,
                  secretKey
                ) === "1"
                  ? ""
                  : "auto",

              alignItems: "center",
            }}
            spacing={0.8}
          >
            <Grid2 item xs={12}>
              <TextField
                select
                fullWidth
                value={
                  //refreshDuration === "0" ? "Aucune" : `${refreshDuration} min`
                  refreshDuration
                }
                onChange={(event) => {
                  handleChangeDuration(event.target.value);
                }}
                label={lang?.actualisation}
                variant="outlined"
                title={lang?.dureeActualisation}
                size="small"
                sx={{ minWidth: 130 }}
              >
                {predefinedDurations.map((duration, index) => (
                  <MenuItem
                    key={index}
                    value={duration === "0" ? "Aucune" : `${duration} min`}
                  >
                    {duration === "0" ? "Aucune" : `${duration} min`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 item>
              <Icon
                path={mdiListBox}
                size={1.5}
                color={viewMode === "table" ? "#1976d2" : "#000"}
                onClick={() => handleChangeStyle("table")}
              />
            </Grid2>
            <Grid2 item>
              <Icon
                path={mdiViewList}
                size={1.5}
                color={viewMode === "list" ? "#1976d2" : "#000"}
                onClick={() => handleChangeStyle("list")}
              />
            </Grid2>
          </Grid2>
        ) : null}
      </Grid2>
      <div style={{ marginBottom: "15px" }}>
        {showAdvancedSearch && (
          <Grid2 container spacing={1} sx={{ marginTop: 2 }}>
            <Grid2 item xs={5}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={
                  Gfunc.useDecryptedLocalStorage(
                    "langId" + prefixe,
                    secretKey
                  ) === "1"
                    ? "ar-dz"
                    : "fr"
                }
              >
                <DatePicker
                  label={lang?.start_date}
                  value={selectedStartDate}
                  onChange={(newValue) => setSelectedStartDate(newValue)}
                  inputFormat={
                    Gfunc.useDecryptedLocalStorage(
                      "langId" + prefixe,
                      secretKey
                    ) === "1"
                      ? "YYYY/MM/DD"
                      : "DD/MM/YYYY"
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      variant: "outlined",
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid2>

            <Grid2 item xs={5}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={
                  Gfunc.useDecryptedLocalStorage(
                    "langId" + prefixe,
                    secretKey
                  ) === "1"
                    ? "ar-dz"
                    : "fr"
                }
              >
                <DatePicker
                  label={lang?.end_date}
                  value={selectedEndDate}
                  onChange={(newValue) => setSelectedEndDate(newValue)}
                  inputFormat={
                    Gfunc.useDecryptedLocalStorage(
                      "langId" + prefixe,
                      secretKey
                    ) === "1"
                      ? "YYYY/MM/DD"
                      : "DD/MM/YYYY"
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      variant: "outlined",
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid2>
          </Grid2>
        )}
      </div>

      <Card
        sx={{
          backgroundColor: viewMode !== "table" ? "transparent" : undefined,
          border: viewMode !== "table" ? "none" : undefined,
          boxShadow: viewMode !== "table" ? "none" : undefined,
        }}
      >
        <div
          style={{
            display: "grid",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* {(Searchloading || loading) && <CircularProgress />} */}
        </div>
        {viewMode === "table" ? (
          <DataTable
            noDataComponent={<NoDataFound />}
            responsive
            columns={columns}
            total
            data={data}
            customStyles={customStyles}
            fixedHeader
            persistTableHeader
            highlightOnHover
            paginationComponentOptions={{
              rowsPerPageText: lang?.page_item,
              rangeSeparatorText: lang?.de,
              selectAllRowsItem: true,
              selectAllRowsItemText: lang?.tous,
            }}
            pagination
            paginationRowsPerPageOptions={[30, 50, 100]}
            paginationServer
            sortServer
            paginationDefaultPage={currentPage}
            paginationPerPage={perPage}
            paginationTotalRows={totalRows}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            onSort={handleSort}
            onRowClicked={(row) => handleChangeContent(row)}
          />
        ) : data.length > 0 ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fit, minmax(${
                  isMobile ? "260px" : "380px"
                }, 1fr))`,
                gap: "20px",
                justifyContent: "center",
                padding: isMobile ? "6px" : "20px",
                alignItems: "start",
              }}
            >
              {data
                .filter((el) => el?.name !== "")
                .map((el, index) => (
                  <div key={index}>
                    <Card
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: isMobile ? "280px" : "200px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
                        cursor: "pointer",
                        overflow: "hidden",
                        backgroundColor: "white",
                        padding: isMobile ? "12px" : "8px",
                      }}
                      onClick={() => handleChangeContent(el)}
                    >
                      <div>
                        {/* Titre et Divider */}
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: "bold",
                            color: "#1b2a38",
                          }}
                          title={el?.title}
                        >
                          {el?.title.length > 50
                            ? el?.title.substring(0, 50) + "..."
                            : el?.title}
                        </div>
                        <Divider sx={{ mt: 2, mb: 2 }} />
                        {/* Slug */}
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "#55b4e5",
                          }}
                        >
                          {el.slug}
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "normal",
                            color: "black",
                            marginTop: "20px",
                          }}
                          title={el?.full_text}
                        >
                          {el?.full_text.length > 250
                            ? el?.full_text.substring(0, 250) + "..."
                            : el?.full_text}
                        </div>
                      </div>

                      {/* Ligne des dates */}
                      <div
                        style={{
                          display: "flex",
                          gridGap: "20px",
                          fontWeight: "bold",
                          fontSize: "12px",
                          alignItems: "center",
                          marginTop: "auto",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gridGap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <Icon path={mdiCalendar} size={0.9} />
                          {Gfunc.formaterDate(el.created_date)}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gridGap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <Icon path={mdiPost} size={0.9} />
                          {el.label}
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
            </div>
            <div
              style={{
                width: "100%",
                display: "grid",
                justifyContent: "center",
              }}
            >
              <TablePagination
                component="div"
                count={totalRows}
                page={currentPage - 1}
                onPageChange={handleChangePage}
                rowsPerPage={perPage}
                onRowsPerPageChange={handlePerRowsChange}
                labelRowsPerPage={lang?.page_item}
                labelDisplayedRows={function defaultLabelDisplayedRows({
                  from,
                  to,
                  count,
                }) {
                  return `${from}–${to} ${lang?.de} ${
                    count !== -1 ? count : `plus que ${to}`
                  }`;
                }}
              />
            </div>
          </>
        ) : (
          <Card style={{ width: "100%", textAlign: "center" }}>
            <NoDataFound />
          </Card>
        )}
      </Card>
    </Fragment>
  );
}
