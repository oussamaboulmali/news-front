import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  Divider,
  Grid2,
  InputAdornment,
  Slide,
  TextField,
} from "@mui/material";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Icon } from "@mdi/react";
import * as icons from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import { ContextProvider } from "../../Context/contextProvider";
import "../../assets/styles/drag-drop-input.css";
import { useMediaQuery } from "react-responsive";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as Gfunc from "../../helpers/Gfunc";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import "dayjs/locale/ar-dz";
import DataTable from "react-data-table-component";
import NoDataFound from "../../noData/noDataFound";
import { customStyles } from "../../assets/styles/datatable_costum";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function Advanced_search() {
  const navigate = useNavigate();
  const { baseUrl, lang, prefixe, secretKey, ImageUrl } =
    useContext(ContextProvider);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [open, setOpen] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedStartDate, setSelectedStartDate] = useState(
    dayjs().subtract(15, "day")
  );
  const [selectedEndDate, setSelectedEndDate] = useState(dayjs());
  const previousValuesRef = useRef({
    page: currentPage,
    perPage: perPage,
  });

  //const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "agencies/articles/searchAll",
    body: {
      searchText: search,
      page: currentPage,
      pageSize: perPage,
      date: selectedDate?.format("YYYY-MM-DD"),
      ...(showAdvancedSearch && {
        date_start: selectedStartDate?.format("YYYY-MM-DD"),
        date_finish: selectedEndDate?.format("YYYY-MM-DD"),
      }),
    },
  });

  const handleClickOpen = () => {
    setOpen(true);
    setShowAdvancedSearch(false);
    setSearch("");
    setSelectedDate(dayjs());
  };

  const handleClose = () => {
    setOpen(false);
    clearData();
  };

  /* useEffect(() => {
    if (open && (currentPage || perPage)) {
      fetchData();
    }
  }, [open, currentPage, perPage]); */

  useEffect(() => {
    if (open && !response) {
      fetchData();
    }
  }, [response, open]);

  useEffect(() => {
    if (response && response?.data?.success) {
      setData(response?.data?.data?.articles);
      setTotalRows(response?.data?.data?.count);
    }
  }, [response]);

  const handleNavigate = (article) => {
    setOpen(false);
    navigate(`/agences/${article?.alias}/${article?.id_article?.toString()}`, {
      replace: true,
      state: { ligne: JSON.stringify(article) },
    });
    localStorage.setItem(
      "agencyId" + prefixe,
      CryptoJS.AES.encrypt(article?.id_agency.toString(), secretKey).toString()
    );
  };

  const columns = [
    {
      wrap: true,
      width: "120px",
      cell: (row) => {
        return (
          <div onClick={() => handleNavigate(row)}>
            <img
              src={`${ImageUrl}logos/${row?.url}`}
              alt={row?.name}
              style={{ width: "50px" }}
            />
          </div>
        );
      },
    },
    {
      name: lang?.agenceyName,
      selector: (row) => row.created_date,
      sortable: true,
      wrap: true,
      sortField: "created_date",
      cell: (row) => {
        return <div onClick={() => handleNavigate(row)}>{row.name}</div>;
      },
    },
    {
      name: lang?.title,
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
      sortField: "title",
      grow: 2,
      cell: (row) => {
        const textToShow =
          row.title.length > 50
            ? row.title.substring(0, 50) + "..."
            : row.title;
        return (
          <div onClick={() => handleNavigate(row)} title={row.title}>
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
      cell: (row) => <div onClick={() => handleNavigate(row)}>{row.slug}</div>,
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
            onClick={() => handleNavigate(row)}
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
          <div onClick={() => handleNavigate(row)}>
            {Gfunc.formaterDate(row.created_date)}
          </div>
        );
      },
    },
  ];

  const OnKeyPressSearch = (event) => {
    if (event.key === "Enter") {
      fetchData();
    }
  };

  useEffect(() => {
    if (
      previousValuesRef.current.page !== currentPage ||
      previousValuesRef.current.perPage !== perPage
    ) {
      fetchData();
      previousValuesRef.current = { page: currentPage, perPage: perPage };
    }
  }, [currentPage, perPage, previousValuesRef.current]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  return (
    <>
      <Icon
        path={icons.mdiTextBoxSearch}
        size={1.2}
        onClick={handleClickOpen}
      />
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: "80%",
            height: "fit-content",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <p>{lang?.AdvancedSearch}</p>
            <Icon
              path={icons.mdiClose}
              size={0.9}
              style={{ color: "gray", cursor: "pointer" }}
              onClick={handleClose}
            />
          </div>
          <Divider />
        </DialogTitle>
        <DialogContent style={{ marginBottom: "30px" }}>
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
                        <Icon path={icons.mdiTextSearch} size={0.8} />
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
                      clearData();
                      setSelectedDate(newValue);
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
          {!loading ? (
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
              paginationRowsPerPageOptions={[20, 50, 100]}
              paginationServer
              //sortServer
              paginationDefaultPage={currentPage}
              paginationPerPage={perPage}
              paginationTotalRows={totalRows}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
              //onSort={handleSort}
              onRowClicked={(row) => handleNavigate(row)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                display: "grid",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
