import { Fragment, useState } from "react";
import * as Gfunc from "../../helpers/Gfunc";
import { Card } from "@mui/material";
import { mdiPost } from "@mdi/js";
import Icon from "@mdi/react";
import "../../assets/styles/stats.css";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import DataTable from "react-data-table-component";
import { customStyles } from "../../assets/styles/datatable_costum";
import NoDataFound from "../../noData/noDataFound";

const Abonnes = ({
  data,
  lang,
  isMobile,
  prefixe,
  secretKey,
  emptyData,
  ImageUrl,
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const handleNavigate = (article) => {
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
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
      sortField: "name",
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

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          gridGap: "8px",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        <Icon path={mdiPost} size={1.5} />
        <h3>{lang?.actualite}</h3>
      </div>
      <Card>
        <DataTable
          noDataComponent={<NoDataFound />}
          responsive
          columns={columns}
          data={data?.lastArtciles}
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
          onRowClicked={(row) => handleNavigate(row)}
        />
      </Card>
    </Fragment>
  );
};
// Validation des props avec PropTypes
Abonnes.propTypes = {
  data: PropTypes.array.isRequired,
  lang: PropTypes.object.isRequired,
  isMobile: PropTypes.bool.isRequired,
  formattedCount: PropTypes.func.isRequired,
  prefixe: PropTypes.string.isRequired,
  secretKey: PropTypes.string.isRequired,
  emptyData: PropTypes.string.isRequired,
  ImageUrl: PropTypes.string.isRequired,
};
export default Abonnes;
