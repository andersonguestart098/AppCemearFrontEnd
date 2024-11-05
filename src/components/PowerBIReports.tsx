import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress } from "@mui/material";

interface PowerBIReportProps {
  reportId: string;
}

interface ReportData {
  id: string;
  name: string;
  embedUrl: string;
}

const PowerBIReport: React.FC<PowerBIReportProps> = ({ reportId }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      const powerBIToken = localStorage.getItem("powerBIToken");

      if (!powerBIToken) {
        setError("Token do Power BI não encontrado.");
        setIsLoading(false);
        return;
      }

      try {
        // Substitua pela URL correta do Power BI
        const response = await axios.get(
          `https://api.powerbi.com/v1.0/myorg/reports/${reportId}`,
          {
            headers: {
              Authorization: `Bearer ${powerBIToken}`,
            },
          }
        );

        setReportData(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Erro ao buscar dados do Power BI", err);
        setError("Erro ao buscar dados do Power BI");
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [reportId]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Relatório: {reportData.name}
      </Typography>

      <iframe
        title="PowerBI Report"
        width="100%"
        height="600px"
        src={reportData.embedUrl}
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </Box>
  );
};

export default PowerBIReport;
