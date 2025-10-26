import React, { useState, useContext, useEffect, Fragment } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAxios } from "../../services/useAxios";
import { ContextProvider } from "../../Context/contextProvider";
import {
  mdiPrinter,
  mdiPost,
  mdiFileWordBox,
  mdiFilePdfBox,
  mdiTextSearch,
  mdiEraser,
} from "@mdi/js";
import Icon from "@mdi/react";
import "../../assets/styles/article.css";
import printJS from "print-js";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import * as Gfunc from "../../helpers/Gfunc";
import {
  Box,
  Container,
  Grid2,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import { PDFDocument, PageSizes } from "pdf-lib";
import html2canvas from "html2canvas";

const ItemContent = () => {
  const { baseUrl, lang } = useContext(ContextProvider);
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [color, setColor] = useState("#263949");
  const [searchTerm, setSearchTerm] = useState(location?.state?.search);
  const [hasHighlights, setHasHighlights] = useState(false);

  // Utilisation d'un useEffect pour écouter la sélection du texte
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || !selection.toString()) return;

      const selectedElement = selection.anchorNode?.parentElement;
      if (!selectedElement || !selectedElement.closest(".article-content"))
        return;

      applyColorToSelection(color, selection);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [color]);

  // Utilisation de useAxios pour récupérer les détails d'un post
  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "agencies/articles/detail",
    body: { articleId: parseInt(id) },
  });

  useEffect(() => {
    if (!response) {
      fetchData();
    }
  }, [response]);

  useEffect(() => {
    if (response?.data?.success) {
      setData(response?.data?.data);
    }
  }, [response]);

  function detectTextDirection(text) {
    const rtlCharRange = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    const rtlMatches = text?.match(rtlCharRange);

    return rtlMatches && rtlMatches.length > 0 ? "rtl" : "ltr";
  }

  // Fonction pour gérer l'impression
  const handlePrint = () => {
    const articleFooter = document.querySelector(".article-footer");
    if (articleFooter) articleFooter.style.display = "none";
    const textDirection = detectTextDirection(data?.full_text);
    const articleFullTextElement = document.querySelector(".article-full-text");
    if (articleFullTextElement) {
      articleFullTextElement.style.direction = textDirection;
    }
    printJS({
      printable: "article-container",
      type: "html",
      targetStyles: [".article-container { border:none;}"],
    });
    if (articleFooter) articleFooter.style.display = "block";
  };

  // Fonction pour générer et télécharger le document Word
  const handleDownloadWord = () => {
    const paragraphs = [];
    const articleContent = document.querySelector(".article-container");

    const htmlContent = articleContent.innerHTML;
    const div = document.createElement("div");

    div.innerHTML = htmlContent;

    // Parcourir les éléments de l'intérieur du div
    div.querySelectorAll("p,h1").forEach((pElement) => {
      const paragraph = new Paragraph({
        children: [new TextRun(pElement.innerText)],
      });
      paragraphs.push(paragraph);
    });

    // Créer le document Word
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });
    // Utiliser Packer pour générer le fichier .docx
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, data.title + ".docx");
    });
  };

  const handleDownloadPDF = async () => {
    const articleContent = document.querySelector(".article-container");
    const articleFooter = document.querySelector(".article-footer");

    // Sauvegarder le style d'origine
    const originalStyle = articleContent.style.cssText;

    // Supprimer temporairement la bordure
    articleContent.style.border = "none";

    // Masquer temporairement le footer
    if (articleFooter) {
      articleFooter.style.display = "none";
    }

    try {
      // Créer une capture du contenu HTML
      const canvas = await html2canvas(articleContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Vérifier si le canvas est bien généré
      const imageDataUrl = canvas.toDataURL("image/jpeg", 1.0);

      // Convertir en Blob
      const blob = await (await fetch(imageDataUrl)).blob();

      // Vérifier si le Blob est vide
      const imageBuffer = await blob.arrayBuffer();
      // Créer un document PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage(PageSizes.A4);

      // Dimensions de la page A4
      const { width, height } = page.getSize();
      const margin = 28.35; // 1cm de marge

      // Adapter l'image
      const jpegImage = await pdfDoc.embedJpg(imageBuffer);
      const jpegDims = jpegImage.scale((width - 2 * margin) / jpegImage.width);

      // Ajouter l'image au document
      page.drawImage(jpegImage, {
        x: margin,
        y: height - jpegDims.height - margin,
        width: jpegDims.width,
        height: jpegDims.height,
      });

      // Enregistrer le document PDF
      const pdfBytes = await pdfDoc.save();

      // Télécharger le PDF
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = data?.title + ".pdf";
      link.click();
    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err);
    } finally {
      // Restaurer les styles quoi qu'il arrive
      if (articleFooter) {
        articleFooter.style.display = "block";
      }
      articleContent.style.cssText = originalStyle;
    }
  };

  const applyColorToSelection = (color, selection) => {
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const fragment = range.extractContents();
    const spans = [];

    // Fonction récursive pour traiter tous les nœuds
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const span = document.createElement("span");
        span.style.backgroundColor = color;
        span.style.color = "white";
        span.style.padding = "3px";
        span.textContent = node.textContent;
        spans.push(span);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const newNode = node.cloneNode(false);
        Array.from(node.childNodes).forEach((child) => {
          processNode(child);
        });
        if (node.nodeName === "BR" || node.nodeName === "P") {
          spans.push(node.cloneNode(false));
        }
      }
    };

    // Traiter chaque nœud dans le fragment
    Array.from(fragment.childNodes).forEach((node) => {
      processNode(node);
    });

    // Créer un container pour tous les spans
    const container = document.createDocumentFragment();
    spans.forEach((span) => container.appendChild(span));

    // Insérer le container dans le range
    range.insertNode(container);

    // Effacer la sélection
    selection.removeAllRanges();
  };

  // Fonction pour gérer les surlignages
  const handleHighlight = (mot) => {
    if (!mot?.trim()) return;
    if (!(data?.full_text || data?.title || data?.slug)) return;

    const regex = new RegExp(mot, "gi");
    const highlightText = (text) => {
      if (!text) return text;
      return text.replace(
        regex,
        (match) => `<span style="background-color: yellow">${match}</span>`
      );
    };

    const highlightedFullText = highlightText(data?.full_text);
    const highlightedTitle = highlightText(data?.title);
    const highlightedSlug = highlightText(data?.slug);

    document.querySelector(".article-full-text").innerHTML =
      Gfunc.TraitText(highlightedFullText);
    document.querySelector(".article-title").innerHTML = highlightedTitle;
    document.querySelector(".article-slug").innerHTML = highlightedSlug;
  };

  // Fonction appelée au moment d'appuyer sur Entrée
  const OnKeyPressSearch = () => {
    document.querySelector(".article-full-text").innerHTML = Gfunc.TraitText(
      data?.full_text
    );
    document.querySelector(".article-title").innerHTML = data?.title;
    document.querySelector(".article-slug").innerHTML = data?.slug;
  };

  // Récupération de la valeur initiale si fournie dans l'état de la navigation
  useEffect(() => {
    if (searchTerm !== "") {
      handleHighlight(searchTerm);
    }
  }, [searchTerm, handleHighlight]);

  const clearHighlights = () => {
    setHasHighlights(true);
    const articleContent = document.querySelector(".article-content");
    if (!articleContent) return;

    // Créer un conteneur temporaire pour préserver la structure
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = articleContent.innerHTML;

    // Fonction pour nettoyer les surlignages tout en préservant la structure
    const cleanNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "SPAN" && node.style.backgroundColor) {
          // Si c'est un span de surlignage, ne garder que le texte
          return document.createTextNode(node.textContent);
        } else {
          // Sinon, cloner le nœud et ses attributs
          const clone = node.cloneNode(false);
          // Récursivement nettoyer les enfants
          Array.from(node.childNodes).forEach((child) => {
            clone.appendChild(cleanNode(child));
          });
          return clone;
        }
      }
      // Pour les nœuds texte, les conserver tels quels
      return node.cloneNode(true);
    };

    // Nettoyer et remplacer le contenu
    const cleanedContent = cleanNode(tempContainer);
    articleContent.innerHTML = "";
    while (cleanedContent.firstChild) {
      articleContent.appendChild(cleanedContent.firstChild);
    }
    setHasHighlights(false);
  };

  if (error) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          height: "60vh",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 3,
          }}
        >
          <Icon path={mdiPost} size={3} color="gray" />
        </Box>
        <Typography variant="h6" color="gray" align="center">
          {lang?.noArticle}
        </Typography>
      </Container>
    );
  }

  return (
    <Fragment>
      <Grid2
        container
        spacing={2}
        alignItems="center"
        style={{ marginBottom: "1rem" }}
        justifyContent="space-between"
      >
        {/* Champ de recherche */}
        <Grid2 item xs={12} sm={6} md={4}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
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
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                handleHighlight(value);
              }}
              onKeyPress={OnKeyPressSearch}
            />

            <IconButton
              onClick={clearHighlights}
              size="small"
              color="primary"
              title="Effacer les surlignages"
              cursor="pointer"
            >
              <Icon path={mdiEraser} size={1.3} />
            </IconButton>
          </div>
        </Grid2>

        {/* Actions à droite */}
        <Grid2 item xs={12} sm={6} md={8}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <Icon
              path={mdiPrinter}
              size={1.5}
              title={lang?.print}
              onClick={handlePrint}
              style={{ cursor: "pointer" }}
            />
            <Icon
              path={mdiFileWordBox}
              size={1.5}
              title={lang?.downloadPost}
              onClick={handleDownloadWord}
              style={{ cursor: "pointer" }}
            />
            <Icon
              path={mdiFilePdfBox}
              size={1.5}
              title={lang?.downloadPost}
              onClick={handleDownloadPDF}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="colorPicker">Couleur :</label>
            <input
              type="color"
              id="colorPicker"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ cursor: "pointer" }}
            />
          </div>
        </Grid2>
      </Grid2>

      {/* Contenu de l'article */}
      <div className="article-container" id="article-container">
        <div
          className="article-header"
          style={{ direction: detectTextDirection(data?.full_text) }}
        >
          <p className="article-agency">
            {data?.agency} / {new Date(data?.created_date).toLocaleString()}
          </p>
          <h1 className="article-title">{data?.title}</h1>
          <p className="article-slug">{data?.slug}</p>
        </div>
        <div className="article-content">
          <div
            style={{
              direction: detectTextDirection(data?.full_text),
              textAlign: "start",
            }}
            className="article-full-text"
            dangerouslySetInnerHTML={{
              __html: data?.agency?.includes("APS")
                ? DOMPurify.sanitize(data?.full_text)
                : DOMPurify.sanitize(Gfunc.TraitText(data?.full_text)),
            }}
          ></div>
        </div>

        {/* Sélecteur de couleur */}

        <div className="article-footer">
          <Icon path={mdiPost} style={{ color: "#55b4e5" }} size={3} />
        </div>
      </div>
    </Fragment>
  );
};

export default ItemContent;
