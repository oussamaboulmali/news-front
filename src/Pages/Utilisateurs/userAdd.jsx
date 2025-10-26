import React, { useEffect, useState, useContext } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Slide,
  TextField,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { mdiPlus, mdiEye, mdiEyeOff } from "@mdi/js";
import PropTypes from "prop-types";
import { Icon } from "@mdi/react";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import { toast } from "react-toastify";
import { ContextProvider } from "../../Context/contextProvider";
import { useMediaQuery } from "react-responsive";
import log from "../../Log/costumLog";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function User_add({ data, setData, UserInfoResponse }) {
  const {
    baseUrl,
    lang: translation,
    prefixe,
    secretKey,
  } = useContext(ContextProvider);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(null);
  const [selectAgencies, setSelectAgencies] = useState([]);
  const [username, setUsername] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [visavis, setVisAVis] = useState("");
  const [fonction, setFonction] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectService, setSelectService] = useState(null);
  const [selectRole, setSelectRole] = useState(null);
  const [filteredServices, setFilteredServices] = useState([]);
  const [telFields, setTelFields] = useState([{ id: 1, value: "" }]);
  const [emailFields, setEmailFields] = useState([{ id: 1, value: "" }]);

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  const handleAddField = (type, nbr) => {
    if (type === "tel" && nbr <= 2) {
      setTelFields([...telFields, { id: telFields.length + 1, value: "" }]);
    } else if (type === "email" && nbr <= 2) {
      setEmailFields([
        ...emailFields,
        { id: emailFields.length + 1, value: "" },
      ]);
    }
  };

  const handleFieldChange = (type, id, value) => {
    if (type === "tel") {
      setTelFields(
        telFields.map((field) =>
          field.id === id ? { ...field, value } : field
        )
      );
    } else if (type === "email") {
      setEmailFields(
        emailFields.map((field) =>
          field.id === id ? { ...field, value } : field
        )
      );
    }
  };

  const lang = [
    { id: 1, name: "عربي" },
    { id: 2, name: "Français" },
    { id: 3, name: "English" },
  ];
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const {
    response: AllAgencyResponse,
    loading: AllAgencyloading,
    error: AllAgencyError,
    fetchData: GetAllAgency,
    clearData: AllAgencyClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "agencies",
    body: {},
  });

  const {
    response: Addresponse,
    loading: Addloading,
    error: Adderror,
    fetchData: AddUser,
    clearData: AddClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/create",
    body: {
      agencies: selectAgencies.map((el) => el.id_agency),
      designation: agencyName,
      username: username,
      lang: language?.id,
      password: password,
      serviceId: selectService?.id_service,

      ...(visavis && {
        contact: visavis,
      }),
      ...(fonction && {
        fonction: fonction,
      }),
      roleId: selectRole?.id_role,
      ...(telFields.length > 0 && {
        contact_numbers: JSON.stringify(telFields.map((el) => el.value)),
      }),
      ...(emailFields.length > 0 && {
        contact_emails: JSON.stringify(emailFields.map((el) => el.value)),
      }),
    },
  });

  // Fonction de filtrage des services en fonction du rôle
  const filterServices = (services, roleName) => {
    if (!services || !roleName) return [];

    switch (roleName) {
      case "coopération":
        return services.filter(
          (service) => service.name === "Employé Coopération"
        );
      case "admin":
        return services.filter(
          (service) => service.name === "Employé Technique"
        );
      case "superviseur":
        return services.filter(
          (service) => service.name === "Employé Technique"
        );
      case "commercial":
        return services.filter(
          (service) => service.name === "Employé Commercial"
        );
      case "abonné":
        return services.filter(
          (service) =>
            service.name === "Commercial" ||
            service.name === "Autre" ||
            service.name === "Coopération"
        );
      default:
        return services; // Retourne tous les services si aucun rôle spécifique
    }
  };

  // Mettre à jour les services filtrés à chaque changement de rôle
  useEffect(() => {
    if (selectRole) {
      setSelectService(null);
      setFilteredServices([]);
      const roleName = selectRole.name;
      const allServices = UserInfoResponse?.data?.data?.services || [];
      const filtered = filterServices(allServices, roleName);

      setFilteredServices(filtered);
    } else {
      setFilteredServices([]); // Aucune sélection de service si aucun rôle
    }
  }, [selectRole, UserInfoResponse]);

  const handleClickOpen = () => {
    setOpen(true);
    setAgencyName("");
    setFonction("");
    setVisAVis("");
    setUsername("");
    setPassword("");
    setSelectAgencies([]);
    setSelectRole(null);
    setSelectService(null);
    setLanguage("");
    setTelFields([{ id: 1, value: "" }]);
    setEmailFields([{ id: 1, value: "" }]);
    GetAllAgency();
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (Addresponse && Addresponse?.data?.success) {
      const newRow = {
        id_user: Addresponse?.data?.data?.user_id,
        designation: agencyName,
        username: username,
        lastvisit_date: null,
        contact_emails: JSON.stringify(emailFields.map((el) => el.value)),
        contact_numbers: JSON.stringify(telFields.map((el) => el.value)),
        service: selectService?.name,
        role: selectRole?.name,
        state: 1,
        contact: visavis,
        fonction: fonction,
        register_by: Gfunc.useDecryptedLocalStorage(
          "username" + prefixe,
          secretKey
        ),
        register_date: Date.now(),
      };
      setData([newRow, ...data]);
      setOpen(false);
      AddClear();
      toast.success(Addresponse?.data?.message, {
        icon: icons["mdiCheck"],
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
  }, [Addresponse]);

  useEffect(() => {
    if (Adderror) {
      toast.error(Adderror, {
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
      AddClear();
    }
  }, [Adderror]);

  const handleSubmit = (event) => {
    var test = false;
    var fields = [];
    event.preventDefault();

    if (Gfunc.detectSQLInjection(agencyName)) {
      test = true;
    }
    if (Gfunc.detectSQLInjection(username)) {
      test = true;
    }
    if (!selectRole || typeof selectRole !== "object") {
      test = true;
      fields.push(translation?.role);
    }

    if (!selectService || typeof selectService !== "object") {
      test = true;
      fields.push(translation?.service);
    }
    if (!language || typeof language !== "object") {
      test = true;
      fields.push(translation?.language);
    }

    if (!Array.isArray(selectAgencies) || selectAgencies.length === 0) {
      test = true;
      fields.push(translation?.Agences);
    }

    if (
      !password ||
      password.length > 20 ||
      password.length < 6 ||
      Gfunc.detectSQLInjection(password)
    ) {
      test = true;
      fields.push(translation?.password);
    }

    telFields.some((field) => {
      if (
        field.value &&
        (!Gfunc.validatePhone(field.value) || field.value.length !== 10)
      ) {
        test = true;
        fields.push(translation?.phoneNumber);
        return true;
      }
      return false;
    });

    // Vérification une seul  adresse e-mail soit invalide
    emailFields.some((field) => {
      if (field.value && !Gfunc.validateEmail(field.value)) {
        test = true;
        fields.push(translation?.email);
        return true;
      }
      return false;
    });

    if (!test) {
      AddUser();
    } else {
      if (fields.length === 0) {
        log.error(
          `Une tentative de saisie de balises HTML ou d'injection SQL dans le formulaire de création d'un utilisateur.
          Informations de débogage :
          Nom d'utilisateur demandé : ${username}
          Mot de passe saisi : ${password}
          Nom de l'agence demandé : ${agencyName}
          `,
          "blocage",
          "Html Tags",
          220
        );
      } else {
        toast.error(translation?.userError + fields.join(", "), {
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
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickOpen}
        size="small"
        startIcon={<Icon path={mdiPlus} size={0.8} />}
      >
        {translation?.add}
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: isMobile ? "300px" : "600px",
            height: "fit-content",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <p>{translation?.newuser}</p>
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
            <TextField
              label={translation?.name}
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              autoComplete="off"
              required
              value={agencyName}
              onChange={(e) => {
                setAgencyName(e.target.value);
              }}
              sx={{
                mt: 2,
                mb: 2,
              }}
            />
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label={translation?.visavis}
                variant="outlined"
                size="small"
                fullWidth
                value={visavis}
                onChange={(e) => {
                  setVisAVis(e.target.value);
                }}
              />
              <TextField
                label={translation?.fonction}
                variant="outlined"
                size="small"
                fullWidth
                value={fonction}
                onChange={(e) => {
                  setFonction(e.target.value);
                }}
              />
            </Box>
            <TextField
              label={translation?.username}
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              autoComplete="off"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              sx={{
                mb: 2,
              }}
            />
            <Divider sx={{ mb: 2 }}>
              {translation?.phoneNumber + " (s)"}{" "}
            </Divider>
            {telFields.map((field, index) => (
              <Box
                key={field.id}
                display="flex"
                alignItems="start"
                mb={2}
                gap={1}
              >
                <TextField
                  //label={`Numéro de téléphone ${index + 1}`}
                  label={translation?.phoneNumber + " " + (index + 1)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={field.value}
                  onChange={(e) =>
                    handleFieldChange("tel", field.id, e.target.value)
                  }
                />
                {index === telFields.length - 1 && index <= 2 && (
                  <IconButton
                    color="primary"
                    onClick={() => handleAddField("tel", telFields.length)}
                  >
                    <Icon path={mdiPlus} size={1} />
                  </IconButton>
                )}
              </Box>
            ))}

            <Divider sx={{ mb: 2 }}>{translation?.email + " (s)"} </Divider>
            {emailFields.map((field, index) => (
              <Box
                key={field.id}
                display="flex"
                alignItems="start"
                mb={2}
                gap={1}
              >
                <TextField
                  //label={`Adresse e-mail ${index + 1}`}
                  label={translation?.email + " " + (index + 1)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={field.value}
                  onChange={(e) =>
                    handleFieldChange("email", field.id, e.target.value)
                  }
                />
                {index === emailFields.length - 1 && index <= 2 && (
                  <IconButton
                    color="primary"
                    onClick={() => handleAddField("email", emailFields.length)}
                  >
                    <Icon path={mdiPlus} size={1} />
                  </IconButton>
                )}
              </Box>
            ))}
            <Divider sx={{ mb: 2 }} />
            <Autocomplete
              required
              filterSelectedOptions
              options={UserInfoResponse?.data?.data?.roles || []}
              size="small"
              getOptionLabel={(option) => option.name || ""}
              value={selectRole}
              onChange={(event, newValues) => {
                setSelectRole(newValues);
              }}
              sx={{ mb: 2 }}
              renderInput={(params) => (
                <TextField {...params} label={translation?.role} />
              )}
            />
            <Autocomplete
              required
              filterSelectedOptions
              options={filteredServices}
              size="small"
              getOptionLabel={(option) => option.name || ""}
              value={selectService}
              onChange={(event, newValue) => {
                setSelectService(newValue);
              }}
              disabled={!selectRole} // Désactiver si aucun rôle sélectionné
              sx={{ mb: 2 }}
              renderInput={(params) => (
                <TextField {...params} label={translation?.service} />
              )}
            />

            <Autocomplete
              multiple
              disableCloseOnSelect
              size="small"
              sx={{ mb: 2 }}
              options={
                AllAgencyResponse?.data?.data.length > 0
                  ? [
                      { id_agency: null, name: translation?.tous },
                      ...(AllAgencyResponse?.data?.data || []),
                    ]
                  : []
              }
              value={selectAgencies}
              onChange={(event, newValue) => {
                const isTousSelected = newValue.some(
                  (option) => option.id_agency === null
                );

                if (isTousSelected) {
                  if (
                    selectAgencies.length !==
                    AllAgencyResponse?.data?.data.length
                  ) {
                    setSelectAgencies(AllAgencyResponse?.data?.data || []);
                  } else {
                    setSelectAgencies([]);
                  }
                } else {
                  setSelectAgencies(newValue);
                }
              }}
              getOptionLabel={(option) =>
                option.id_agency === null ? translation?.tous : option.name
              }
              isOptionEqualToValue={(option, value) =>
                option.id_agency === value.id_agency
              }
              renderInput={(params) => (
                <TextField {...params} label={translation?.Agences} />
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
                        ? selectAgencies.length ===
                          AllAgencyResponse?.data?.data?.length
                        : selected
                    }
                  />
                  {option.id_agency === null ? translation?.tous : option.name}
                </li>
              )}
            />

            <Autocomplete
              options={lang || []}
              size="small"
              getOptionLabel={(option) => option.name || ""}
              value={language}
              onChange={(event, newValues) => {
                setLanguage(newValues);
              }}
              required
              renderInput={(params) => (
                <TextField {...params} label={translation?.language} />
              )}
              sx={{ mb: 2 }}
            />

            <TextField
              label={translation?.password}
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              required
              autoComplete="off"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              sx={{
                mb: 2,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      <Icon path={showPassword ? mdiEye : mdiEyeOff} size={1} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </DialogContent>
        <DialogActions className="DialogActions">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="small"
            form="formValidate"
            startIcon={<Icon path={icons["mdiCheck"]} size={0.8} />}
          >
            {translation?.validate}
          </Button>
          <Button variant="outlined" size="small" onClick={handleClose}>
            {translation?.cancel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
// Validation des props avec PropTypes
User_add.propTypes = {
  data: PropTypes.array.isRequired,
  setData: PropTypes.func.isRequired,
  UserInfoResponse: PropTypes.object.isRequired,
};
