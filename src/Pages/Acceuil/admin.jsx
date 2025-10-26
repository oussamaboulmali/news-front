import { useState, useContext, Fragment } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Text,
} from "recharts";
import * as Gfunc from "../../helpers/Gfunc";
import {
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Grid2,
  Card,
} from "@mui/material";
import { mdiAccountBadgeOutline, mdiAccountOff, mdiPost } from "@mdi/js";
import Icon from "@mdi/react";
import { StyledCard } from "../../assets/Styled/StyledCard";
import "../../assets/styles/stats.css";
import PropTypes from "prop-types";
import Pagination from "../../UI/Pagination/index";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import Advanced_search from "./AdvenceSearch";

const Admin = ({
  data,
  lang,
  isMobile,
  formattedCount,
  prefixe,
  secretKey,
}) => {
  const colorPalette = [
    { light: "#e1bee7", dark: "#ba68c8" }, // Carte 1 (mauve)
    { light: "#f0f4c3", dark: "#afb42b" }, // Carte 2 (jaune)
    { light: "#bbdefb", dark: "#1e88e5" }, // Carte 3 (bleu)
    { light: "#f8bbd0", dark: "#d81b60" }, // Carte 4 (rose)
    { light: "#e8eaf6", dark: "#3949ab" }, // Bleu indigo
    { light: "#e3f2fd", dark: "#1e88e5" }, // Bleu clair
    { light: "#e1f5fe", dark: "#039be5" }, // Bleu cyan
    { light: "#e0f7fa", dark: "#00838f" }, // Bleu-vert
    { light: "#e0f2f1", dark: "#00695c" }, // Vert turquoise
    { light: "#e8f5e9", dark: "#43a047" }, // Vert
    { light: "#f1f8e9", dark: "#689f38" }, // Vert olive
    { light: "#f9fbe7", dark: "#afb42b" }, // Jaune olive
    { light: "#fffde7", dark: "#fbc02d" }, // Jaune
    { light: "#fff8e1", dark: "#ffa726" }, // Orange clair
    { light: "#fff3e0", dark: "#f57c00" }, // Orange vif
    { light: "#fbe9e7", dark: "#e64a19" }, // Rouge-orange
    { light: "#efebe9", dark: "#6d4c41" }, // Brun clair
    { light: "#fafafa", dark: "#9e9e9e" }, // Gris clair
    { light: "#eceff1", dark: "#455a64" }, // Gris bleuâtre
    { light: "#f3e5f5", dark: "#8e24aa" }, // Violet lumineux
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const ARTICLES_PER_PAGE = 6;
  const totalPages = Math.ceil(data?.articlesToday?.length / ARTICLES_PER_PAGE);
  const paginatedArticles = data?.articlesToday?.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const CustomLabel = ({ viewBox, totale }) => {
    const { cx, cy } = viewBox; // Position du centre du PieChart
    return (
      <Text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={18}
        fontWeight="bold"
      >
        {`${lang?.totale} ${totale}`}
      </Text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, color } = payload[0].payload;

      return (
        <div
          style={{
            backgroundColor: "white",
            border: `1px solid ${color}`,
            borderRadius: "5px",
            padding: "10px",
            color: color,
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{name}</p>
          <p style={{ margin: 0 }}>Valeur : {value}</p>
        </div>
      );
    }
    return null;
  };

  const ConnectedUsers = ({ users }) => {
    return (
      <Card
        sx={{
          width: "100%",
          minWidth: !isMobile ? 360 : 220,
          bgcolor: "background.paper",
          height: !isMobile ? "870px" : "fit-content",
          overflow: "auto",
          boxShadow: "3",
          display: users.length <= 0 && "grid",
          alignItems: users.length <= 0 && "center",
        }}
      >
        {users && users.length > 0 && (
          <Typography
            variant="h6"
            component="h2"
            sx={{
              textAlign: "center",
              color: "gray",
              marginTop: "20px",
            }}
          >
            {lang?.connectedUser}
          </Typography>
        )}
        <List
          sx={{
            width: "100%",
          }}
        >
          {users && users?.length > 0 ? (
            users.map((user, index) => (
              <Fragment key={user.id_user}>
                <ListItem
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  {/* Avatar */}
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#FFBB28" }}>
                      <Icon path={mdiAccountBadgeOutline} size={1} />
                    </Avatar>
                  </ListItemAvatar>

                  <Box
                    sx={{
                      flex: 1,
                      overflowWrap: "break-word",
                    }}
                  >
                    <ListItemText
                      primary={user.username}
                      secondary={user.designation}
                    />
                  </Box>
                  <Box
                    sx={{
                      marginLeft:
                        Gfunc.useDecryptedLocalStorage(
                          "langId" + prefixe,
                          secretKey
                        ) === "1"
                          ? 0
                          : "auto",
                      marginRight:
                        Gfunc.useDecryptedLocalStorage(
                          "langId" + prefixe,
                          secretKey
                        ) === "1"
                          ? "auto"
                          : 0,
                      minWidth: "150px",
                      textAlign: "center",
                    }}
                  >
                    <ListItemText
                      primary={Gfunc.getDurationFromNow(user?.login_date, lang)}
                    />
                  </Box>
                </ListItem>

                {/* Divider */}
                {index < users?.length - 1 && <Divider />}
              </Fragment>
            ))
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                textAlign: "center",
                color: "gray",
              }}
            >
              <Icon path={mdiAccountOff} size={2} color="gray" />
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                {lang?.noUsers}
              </Typography>
            </Box>
          )}
        </List>
      </Card>
    );
  };

  return (
    <Grid2 container spacing={3} justifyContent={"center"} padding={0}>
      {/* Left Section (Card and PieChart) */}
      <Grid2 item xs={12} md={6}>
        <Box
          sx={{
            display: !isMobile ? "flex" : "grid",
            flexDirection: "row",
            gap: 2,
          }}
        >
          {/* Card for Total Articles */}
          {data?.totalArticlesCount && (
            <StyledCard sx={{ width: "80%" }}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: !isMobile ? "flex-start" : "grid",
                  padding: 3,
                }}
              >
                <Typography variant="h3" color="green">
                  {formattedCount(data?.totalArticlesCount)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {lang?.articles}
                </Typography>
              </CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Icon path={mdiPost} size={2} color="green" />
              </Box>
            </StyledCard>
          )}

          {/* PieChart */}
          {data?.usersStatistics?.length !== 0 && (
            <Box
              sx={{
                flex: 1,
                boxShadow: 3,
                borderRadius: 2,
                padding: 2,
                margin: "auto",
                textAlign: "center",
                color: "gray",
              }}
              bgcolor="#fff"
            >
              <Typography variant="h6" component="h2">
                {lang?.pieUserTitle}
              </Typography>
              <PieChart width={!isMobile ? 400 : 240} height={300}>
                <Pie
                  data={data?.usersStatistics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={
                    !isMobile && (
                      <CustomLabel
                        viewBox={{ cx: 200, cy: 135 }}
                        totale={data?.totaleUsers}
                      />
                    )
                  }
                >
                  {data?.usersStatistics?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </Box>
          )}
          {/*test*/}
        </Box>

        {/* Connected Users */}
        <div
          style={{ boxShadow: 5, borderRadius: 2, padding: 2, marginTop: 20 }}
        >
          {data?.usersConnected && (
            <ConnectedUsers users={data?.usersConnected} />
          )}
        </div>
      </Grid2>

      {/* Right Section (BarChart and LineChart) */}
      <Grid2 item xs={12} md={6}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div
            style={{
              display: "grid",
              gap: "20px",
              gridTemplateColumns: !isMobile
                ? "repeat(2, 1fr)"
                : "repeat(1, 1fr)",
              justifyContent: "center", // Centrer la grille horizontalement
            }}
          >
            {paginatedArticles?.length !== 0 &&
              paginatedArticles?.map((item, index) => (
                <Link
                  key={index}
                  replace
                  to={`/agences/${item.alias}?n=${encodeURIComponent(
                    CryptoJS.AES.encrypt(
                      JSON.stringify({
                        agencyId: item.id_agency,
                        ligne: item,
                      }),
                      secretKey
                    ).toString()
                  )}`}
                  onClick={() => {
                    localStorage.setItem(
                      "agencyId" + prefixe,
                      CryptoJS.AES.encrypt(
                        item?.id_agency.toString(),
                        secretKey
                      )
                    );
                  }}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <StyledCard bgColor={colorPalette?.[index]} display="block">
                    <Typography
                      variant="h6"
                      color={colorPalette?.[index]?.dark}
                    >
                      {Gfunc.useDecryptedLocalStorage(
                        "langId" + prefixe,
                        secretKey
                      ) !== "1"
                        ? item.name
                        : item.name_ar}
                    </Typography>
                    <Typography variant="body1" color="textPrimary">
                      {lang?.articles}: {item.articlesCount}
                    </Typography>
                    <Typography variant="body1" color="textPrimary">
                      {lang?.users}: {item.usersCount}
                    </Typography>
                  </StyledCard>
                </Link>
              ))}
          </div>
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </div>
          {/* BarChart */}
          <Box
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              padding: 2,
              textAlign: "center",
              color: "gray",
            }}
            bgcolor="#fff"
          >
            <Typography variant="h6" component="h2">
              {lang?.BarStatAgency}
            </Typography>
            <BarChart
              width={!isMobile ? 500 : 290}
              height={300}
              data={data?.agencies}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={
                  Gfunc.useDecryptedLocalStorage(
                    "langId" + prefixe,
                    secretKey
                  ) === "1"
                    ? "name_ar"
                    : "name"
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="articlesCount"
                fill="#82ca9d"
                bgColor
                name={lang?.userArticle}
              />
            </BarChart>
          </Box>

          {/* LineChart */}
          {data?.articlesLastWeek?.length !== 0 && (
            <Box
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                padding: 2,
                textAlign: "center",
                color: "gray",
              }}
              bgcolor="#fff"
            >
              <Typography variant="h6" component="h2">
                {lang?.LineStatAgency}
              </Typography>
              <LineChart
                width={!isMobile ? 500 : 290}
                height={300}
                data={data?.articlesLastWeek}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="articlesCount"
                  stroke="#8884d8"
                  name={lang?.userArticle}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </Box>
          )}
        </Box>
      </Grid2>
    </Grid2>
  );
};
// Validation des props avec PropTypes
Admin.propTypes = {
  data: PropTypes.array.isRequired,
  lang: PropTypes.object.isRequired,
  isMobile: PropTypes.bool.isRequired,
  formattedCount: PropTypes.func.isRequired,
  prefixe: PropTypes.string.isRequired,
  secretKey: PropTypes.string.isRequired,
};
export default Admin;
