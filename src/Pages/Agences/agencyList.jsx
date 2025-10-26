import React, { useContext, useEffect, useState } from "react";
import { ContextProvider } from "../../Context/contextProvider";
import { Card, CircularProgress, Grid2 } from "@mui/material";
import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { mdiListBox, mdiViewList } from "@mdi/js";
import { Icon } from "@mdi/react";
import * as Gfunc from "../../helpers/Gfunc";
import CryptoJS from "crypto-js";
import { useAxios } from "../../services/useAxios";

const AgencyList = () => {
  const { baseUrl, ImageUrl, prefixe, secretKey } = useContext(ContextProvider);
  const [viewStyle, setViewStyle] = useState("card");
  const [agencies, setAgencies] = useState([]);
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  // Utilisation de useAxios pour connecter
  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "agencies/users/list",
    body: {},
  });

  useEffect(() => {
    if (!response) {
      fetchData();
    }
  }, [response]);

  useEffect(() => {
    if (response && response?.data?.success) {
      setAgencies(response?.data?.data);
    }
  }, [response]);

  const handleChangeStyle = (style) => {
    setViewStyle(style);
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
    <div>
      {/* Boutons pour basculer entre les styles */}
      <Grid2 container spacing={0} justifyContent="flex-end" padding="10px">
        <Grid2 item>
          <Icon
            path={mdiListBox}
            size={1.5}
            color={viewStyle === "card" ? "#1976d2" : "#000"}
            onClick={() => handleChangeStyle("card")}
          />
        </Grid2>
        <Grid2 item>
          <Icon
            path={mdiViewList}
            size={1.5}
            color={viewStyle === "list" ? "#1976d2" : "#000"}
            onClick={() => handleChangeStyle("list")}
          />
        </Grid2>
      </Grid2>

      <div
        style={{
          height: "fit-content",
          display: "grid",
          gridTemplateColumns:
            viewStyle === "card"
              ? isMobile
                ? "repeat(auto-fit, 260px)"
                : "repeat(auto-fit, 350px)"
              : "none",
          gap: "20px",
          padding: "20px",
          justifyContent: agencies.length >= 3 ? "center" : "start",
          marginBottom: "10px",
          overflowY: agencies.length > 10 ? "auto" : "visible",
        }}
      >
        {viewStyle === "card" ? (
          /* Affichage en card */
          agencies
            ?.filter((el) => el?.name !== "")
            .map((el, index) => (
              <Link
                key={index}
                /* to={el.alias}
                state={{
                  agencyId: JSON.stringify(el?.id_agency),
                  ligne: JSON.stringify(el),
                }} */
                to={`${el.alias}?n=${encodeURIComponent(
                  CryptoJS.AES.encrypt(
                    JSON.stringify({
                      agencyId: el.id_agency,
                      ligne: el,
                    }),
                    secretKey
                  ).toString()
                )}`}
                onClick={() => {
                  localStorage.setItem(
                    "agencyId" + prefixe,
                    CryptoJS.AES.encrypt(el?.id_agency.toString(), secretKey)
                  );
                }}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Card
                  onMouseEnter={(e) => {
                    e.currentTarget.style.fontWeight = "normal";
                    e.currentTarget.style.color = "#595959";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.fontWeight = "bold";
                    e.currentTarget.style.color = "#000";
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "200px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    padding: isMobile ? "0 20px" : "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                    }}
                  >
                    <p style={{ fontWeight: "bold", fontSize: "15px" }}>
                      {Gfunc.useDecryptedLocalStorage(
                        "langId" + prefixe,
                        secretKey
                      ) === "1"
                        ? el?.name_ar
                        : el?.name}
                    </p>
                    <img
                      src={`${ImageUrl}logos/${el?.url}`}
                      alt={el?.name}
                      style={{ width: "150px" }}
                    />
                  </div>
                </Card>
              </Link>
            ))
        ) : (
          /* Affichage en liste verticale avec multi-colonnes */
          <div
            style={{
              columnCount: isMobile ? 1 : 3,
              columnGap: "30px",
              maxHeight: !isMobile && "70vh",
              overflowY: "auto",
            }}
          >
            {agencies
              ?.filter((el) => el?.name !== "")
              .map((el, index) => (
                <Link
                  key={index}
                  /* to={el.alias}
                  state={{
                    agencyId: JSON.stringify(el?.id_agency),
                    ligne: JSON.stringify(el),
                  }} */
                  /* to={`${el.alias}?agencyId=${encodeURIComponent(
                    el?.id_agency
                  )}&ligne=${encodeURIComponent(JSON.stringify(el))}`}
                  onClick={() =>
                    localStorage.setItem(
                      "agencyId" + prefixe,
                      CryptoJS.AES.encrypt(el?.id_agency, secretKey).toString()
                    )
                  } */
                  to={`${el.alias}?n=${encodeURIComponent(
                    CryptoJS.AES.encrypt(
                      JSON.stringify({
                        agencyId: el.id_agency,
                        ligne: el,
                      }),
                      secretKey
                    ).toString()
                  )}`}
                  onClick={() => {
                    localStorage.setItem(
                      "agencyId" + prefixe,
                      CryptoJS.AES.encrypt(el?.id_agency.toString(), secretKey)
                    );
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.fontWeight = "normal";
                    e.currentTarget.style.color = "#595959";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.fontWeight = "bold";
                    e.currentTarget.style.color = "#000";
                  }}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    minWidth: !isMobile ? "400px" : "fit-content",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: isMobile ? "20px" : "50px",
                    cursor: "pointer",
                    breakInside: "avoid",
                    justifyContent: "start",
                    fontWeight: "bold",
                  }}
                >
                  <img
                    src={`${ImageUrl}logos/${el?.url}`}
                    alt={el?.name}
                    style={{ width: "30px", height: "30px" }}
                  />
                  <span
                    style={{
                      fontSize: "15px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {Gfunc.useDecryptedLocalStorage(
                      "langId" + prefixe,
                      secretKey
                    ) === "1"
                      ? el?.name_ar
                      : el?.name}
                  </span>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyList;
