import type { BoxProps } from "@mui/material";
import type { ICertificateProps } from "src/types/certificate";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import { useRef, useMemo, useState, useEffect } from "react";

import { Box, Stack, Button, Typography } from "@mui/material";

import { fDate } from "src/utils/format-time";

import { CONFIG } from "src/global-config";
import { LinkedinIcon } from "src/assets/icons";

import { useUserContext } from "src/components/user";
import { useSettingsContext } from "src/components/settings";

type Props = BoxProps &
  Omit<ICertificateProps, "id" | "completedAt"> & { completedAt?: string; showButtons?: boolean };

export function Certificate({
  courseName,
  studentName,
  completedAt = new Date().toISOString(),
  showButtons = false,
  sx,
  ...other
}: Props) {
  const { t } = useTranslation("certificate");

  const user = useUserContext();
  const { firstName, lastName } = user.state;

  const isUserCertificate = useMemo(
    () => studentName === `${firstName} ${lastName}`,
    [studentName, firstName, lastName]
  );

  const settings = useSettingsContext();
  const { colorScheme } = settings.state;

  const boxRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(14);
  const [logoSize, setLogoSize] = useState(24);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const scale = Math.min(width, height);
      setFontSize(Math.max(16, Math.min(32, scale / 16)));
      setLogoSize(Math.max(24, Math.min(64, scale / 10)));
    });

    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDownloadPNG = async () => {
    if (boxRef.current) {
      const canvas = await html2canvas(boxRef.current);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "certificate.png";
      link.click();
    }
  };

  const handleDownloadPDF = async () => {
    if (boxRef.current) {
      const canvas = await html2canvas(boxRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("certificate.pdf");
    }
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const renderLogo = () => {
    const fillColor = colorScheme === "light" ? "#000" : "#fff";

    return (
      <svg id="Layer_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 91.8764 91.9991">
        <g id="Components">
          <g id="_4dd156c4-7568-4d08-b6cf-7d2100257db1_4">
            <rect
              width="18.2845"
              height="91.9991"
              style={{ fill: fillColor, strokeWidth: "0px" }}
            />
            <path
              d="M91.8764,73.7021v18.297h-55.3074c-5.0525,0-9.6266-2.0482-12.9377-5.3589-3.2988-3.3113-5.3468-7.8855-5.3468-12.9381h73.5919Z"
              style={{ fill: fillColor, strokeWidth: "0px" }}
            />
            <rect
              x="30.6582"
              width="18.2845"
              height="61.3409"
              style={{ fill: fillColor, strokeWidth: "0px" }}
            />
            <path
              d="M48.9427,43.0439h42.9337v18.297h-24.6492c-5.0525,0-9.6266-2.0482-12.9377-5.3589-3.2988-3.3113-5.3468-7.8855-5.3468-12.9381Z"
              style={{ fill: fillColor, strokeWidth: "0px" }}
            />
          </g>
        </g>
      </svg>
    );
  };

  const renderButtons = () => (
    <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
      <Button variant="contained" onClick={handleDownloadPNG}>
        {t("buttons.png")}
      </Button>
      <Button variant="contained" onClick={handleDownloadPDF}>
        {t("buttons.pdf")}
      </Button>
      <Button
        variant="outlined"
        onClick={handleShareLinkedIn}
        startIcon={<LinkedinIcon />}
        sx={{
          borderColor: "#0077B5",
          color: "#0077B5",
        }}
      >
        {t("buttons.linkedin")}
      </Button>
    </Stack>
  );

  return (
    <>
      <Box
        ref={boxRef}
        component="section"
        sx={[
          (theme) => ({
            ...theme.mixins.bgGradient({
              images: [`url(${CONFIG.assetsDir}/assets/background/texture-2.webp)`],
            }),
            width: 1,
            height: "100%",
            borderRadius: 1.5,
            bgcolor: "background.neutral",
            p: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            gap: 1,
            textAlign: "center",
            fontSize: `${fontSize}px`,
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Box sx={{ width: logoSize, height: logoSize, mb: 2 }}>{renderLogo()}</Box>

        <Typography sx={{ fontSize: "0.7em", fontWeight: "bold", wordBreak: "break-word" }}>
          {t("label")}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography color="primary" sx={{ fontSize: "0.7em", wordBreak: "break-word" }}>
            {t("award")}
          </Typography>
          <Typography sx={{ fontSize: "0.8em", fontWeight: "bold", wordBreak: "break-word" }}>
            {studentName}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography color="primary" sx={{ fontSize: "0.7em", wordBreak: "break-word" }}>
            {t("completion")}
          </Typography>
          <Typography sx={{ fontSize: "0.8em", fontWeight: "bold", wordBreak: "break-word" }}>
            {courseName}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography color="primary" sx={{ fontSize: "0.6em", wordBreak: "break-word" }}>
            {t("date")}
          </Typography>
          <Typography sx={{ fontSize: "0.7em", fontWeight: "bold", wordBreak: "break-word" }}>
            {fDate(completedAt)}
          </Typography>
        </Box>
      </Box>

      {isUserCertificate && showButtons && renderButtons()}
    </>
  );
}
