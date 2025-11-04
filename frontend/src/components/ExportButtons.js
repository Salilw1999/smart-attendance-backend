import React from "react";
import { Button, Stack } from "@mui/material";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const ExportButtons = ({ data, fileName }) => {
  if (!data || data.length === 0) return null;

  // --- Export to Excel ---
  const exportExcel = () => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Sheet1");
    writeFile(wb, `${fileName}.xlsx`);
  };

  // --- Export to CSV ---
  const exportCSV = () => {
    const ws = utils.json_to_sheet(data);
    const csv = utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  // --- Export to PDF ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`${fileName}`, 14, 10);
    const columns = Object.keys(data[0]).map((key) => ({
      header: key,
      dataKey: key,
    }));
    doc.autoTable({
      columns,
      body: data,
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save(`${fileName}.pdf`);
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Button variant="outlined" onClick={exportExcel}>
        Export Excel
      </Button>
      <Button variant="outlined" onClick={exportCSV}>
        Export CSV
      </Button>
      <Button variant="outlined" onClick={exportPDF}>
        Export PDF
      </Button>
    </Stack>
  );
};
