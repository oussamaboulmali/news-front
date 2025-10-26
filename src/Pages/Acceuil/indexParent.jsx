import { useState, useEffect, useContext, Fragment } from "react";
import { useAxios } from "../../services/useAxios";
import { ContextProvider } from "../../Context/contextProvider";
import * as Gfunc from "../../helpers/Gfunc";
import { CircularProgress } from "@mui/material";
import { useMediaQuery } from "react-responsive";
import NoDataMessage from "../../noData/noStats";
import "../../assets/styles/stats.css";
import Admin from "./admin";
import { mdiReload } from "@mdi/js";
import Icon from "@mdi/react";
import Abonnes from "./abonnees";
import Advanced_search from "./AdvenceSearch";

const Index = () => {
  const { baseUrl, lang, prefixe, secretKey, emptyData, ImageUrl } =
    useContext(ContextProvider);
  const [data, setData] = useState([]);
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  // Formatage du nombre avec suffixe K
  const formattedCount = (num) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + " " + lang?.k : num;
  };

  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "auth/stats",
    body: {},
  });

  //appaler l'api des statistique
  useEffect(() => {
    if (!response) {
      fetchData();
    }
  }, [response]);

  //recuperer les donnees des stats
  useEffect(() => {
    if (response && response?.data?.success) {
      const articlesLastWeek = response?.data?.data.articlesLastWeek
        ? Gfunc.sortByDateAscending(
            response?.data?.data.articlesLastWeek,
            "date"
          )
        : [];
      const totaleUsers = response?.data?.data.usersStatistics?.totalUsers || 0;

      const usersStatistics = response?.data?.data?.usersStatistics
        ? [
            {
              name: lang?.activateUser,
              value: response?.data?.data?.usersStatistics?.activeUsers,
              percentage:
                (
                  (response?.data?.data?.usersStatistics?.activeUsers /
                    totaleUsers) *
                  100
                ).toFixed(2) + "%",
              color: "green",
            },
            {
              name: lang?.blockedUser,
              value: response?.data?.data?.usersStatistics?.blockedUsers,
              percentage:
                (
                  (response?.data?.data.usersStatistics?.blockedUsers /
                    totaleUsers) *
                  100
                ).toFixed(2) + "%" || 0,
              color: "red",
            },
            {
              name: lang?.trashedUser,
              value: response?.data?.data?.usersStatistics?.trashedUsers,
              percentage:
                (
                  (response?.data?.data.usersStatistics?.trashedUsers /
                    totaleUsers) *
                  100
                ).toFixed(2) + "%" || 0,
              color: "darkorange",
            },
            {
              name: lang?.desactivateUser,
              value: response?.data?.data?.usersStatistics?.desctivatedUsers,
              percentage:
                (
                  (response?.data?.data.usersStatistics?.desctivatedUsers /
                    totaleUsers) *
                  100
                ).toFixed(2) + "%" || 0,
              color: "gray",
            },
          ]
        : [];
      const newData = {
        ...response?.data?.data,
        articlesLastWeek: articlesLastWeek,
        usersStatistics: usersStatistics,
        totaleUsers: totaleUsers,
      };
      setData(newData);
    }
  }, [response]);

  const handleReload = () => {
    clearData();
  };

  if ((response || error) && (!data || Object.keys(data).length === 0)) {
    return <NoDataMessage />;
  }

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
      <div id="refresh-container">
        <div title={lang?.AdvancedSearch} className="refresh-stat">
          <Advanced_search />
        </div>
        <div title={lang?.relaodText} className="refresh-stat">
          <Icon path={mdiReload} size={1.2} onClick={handleReload} />
        </div>
      </div>

      {data?.hasOwnProperty("lastArtciles") ? (
        <Abonnes
          data={data}
          lang={lang}
          isMobile={isMobile}
          formattedCount={formattedCount}
          prefixe={prefixe}
          secretKey={secretKey}
          emptyData={emptyData}
          ImageUrl={ImageUrl}
        />
      ) : (
        <Admin
          data={data}
          baseUrl={baseUrl}
          lang={lang}
          isMobile={isMobile}
          formattedCount={formattedCount}
          prefixe={prefixe}
          secretKey={secretKey}
        />
      )}
    </Fragment>
  );
};

export default Index;
