// Storage utility for resume analysis history

const STORAGE_KEY = "resume_analysis_history";

export const saveAnalysis = (analysisData) => {
  try {
    const history = getHistory();
    const newEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...analysisData,
    };

    history.unshift(newEntry);

    // Keep only last 20 analyses
    const limitedHistory = history.slice(0, 20);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));

    return newEntry.id;
  } catch (error) {
    console.error("Error saving analysis:", error);
    return null;
  }
};

export const getHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting history:", error);
    return [];
  }
};

export const getAnalysisById = (id) => {
  const history = getHistory();
  return history.find((item) => item.id === id);
};

export const deleteAnalysis = (id) => {
  try {
    const history = getHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return false;
  }
};

export const exportToJSON = (analysis) => {
  const dataStr = JSON.stringify(analysis, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `resume-analysis-${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
};

export const exportToPDF = async (analysis) => {
  try {
    // Dynamically import jsPDF to avoid SSR issues
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPosition = 20;

    // Helper function to add text with word wrap
    const addText = (text, fontSize = 12, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont(undefined, isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, maxWidth);

      // Check if we need a new page
      if (
        yPosition + lines.length * fontSize * 0.5 >
        doc.internal.pageSize.getHeight() - margin
      ) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(lines, margin, yPosition);
      yPosition += lines.length * fontSize * 0.5 + 5;
    };

    const addSection = (title) => {
      yPosition += 5;
      doc.setFillColor(139, 92, 246); // Purple color
      doc.rect(margin, yPosition - 5, maxWidth, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(title, margin + 5, yPosition + 2);
      doc.setTextColor(0, 0, 0);
      yPosition += 15;
    };

    // Title
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text("Resume Analysis Report", pageWidth / 2, 25, { align: "center" });
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // Analysis Info
    if (analysis.companyName || analysis.jobTitle) {
      addText(`Position: ${analysis.jobTitle || "N/A"}`, 12, true);
      addText(`Company: ${analysis.companyName || "N/A"}`, 12, true);
    }
    if (analysis.fileName) {
      addText(`File: ${analysis.fileName}`, 10);
    }
    if (analysis.timestamp) {
      addText(`Analyzed: ${new Date(analysis.timestamp).toLocaleString()}`, 10);
    }
    yPosition += 10;

    // Overall Score
    addSection("Overall Score");
    doc.setFontSize(36);
    doc.setFont(undefined, "bold");
    const scoreColor =
      analysis.feedback.overallScore > 70
        ? [34, 197, 94]
        : analysis.feedback.overallScore > 49
          ? [234, 179, 8]
          : [239, 68, 68];
    doc.setTextColor(...scoreColor);
    doc.text(
      `${analysis.feedback.overallScore}/100`,
      pageWidth / 2,
      yPosition,
      { align: "center" },
    );
    doc.setTextColor(0, 0, 0);
    yPosition += 20;

    // Category Scores
    addSection("Category Scores");
    const categories = [
      { name: "Tone & Style", data: analysis.feedback.toneAndStyle },
      { name: "Content", data: analysis.feedback.content },
      { name: "Structure", data: analysis.feedback.structure },
      { name: "Skills", data: analysis.feedback.skills },
    ];

    categories.forEach(({ name, data }) => {
      addText(`${name}: ${data.score}/100`, 12, true);
      yPosition += 2;
    });

    // Detailed Feedback
    categories.forEach(({ name, data }) => {
      addSection(`${name} - Detailed Feedback`);

      if (data.tips && data.tips.length > 0) {
        data.tips.forEach((tip, index) => {
          const icon = tip.type === "good" ? "✓" : "⚠";
          doc.setTextColor(
            tip.type === "good" ? 34 : 234,
            tip.type === "good" ? 197 : 179,
            tip.type === "good" ? 94 : 8,
          );
          addText(`${icon} ${tip.tip}`, 11, true);
          doc.setTextColor(0, 0, 0);
          addText(`   ${tip.explanation}`, 10);
          yPosition += 3;
        });
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount} - Generated by RESUMIND`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(`resume-analysis-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
