import { jsPDF } from 'jspdf';

/**
 * Generates a professional certificate PDF using jsPDF.
 * Matches the premium ModernCertificate design.
 * 
 * @param {Object} data - The certificate data.
 * @param {string} data.recipientName - Name of the course completer.
 * @param {string} data.courseTitle - Title of the course.
 * @param {string} data.date - Issue date.
 * @param {string} data.certificateId - Unique ID for the certificate.
 * @param {boolean} isDownload - Whether to trigger a download or return the doc.
 */
export const generateCertificatePDF = (data, isDownload = true) => {
  const { recipientName, courseTitle, date, certificateId } = data;
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const COLORS = {
    GREEN: [0, 77, 48],
    GOLD: [197, 160, 89],
    DARK: [11, 26, 45],
    SOFT: [100, 116, 139]
  };

  // 1. Draw Corner Triangles (Top Left)
  doc.setFillColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
  doc.triangle(0, 0, 100, 0, 0, 100, 'F');
  doc.setFillColor(COLORS.GREEN[0], COLORS.GREEN[1], COLORS.GREEN[2]);
  doc.triangle(5, 5, 90, 5, 5, 90, 'F');
  doc.setFillColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
  doc.triangle(15, 15, 75, 15, 15, 75, 'F');
  doc.setFillColor(0, 107, 69); // Medium Green
  doc.triangle(20, 20, 65, 20, 20, 65, 'F');

  // 2. Draw Corner Triangles (Bottom Right)
  doc.setFillColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
  doc.triangle(297, 210, 197, 210, 297, 110, 'F');
  doc.setFillColor(COLORS.GREEN[0], COLORS.GREEN[1], COLORS.GREEN[2]);
  doc.triangle(292, 205, 207, 205, 292, 120, 'F');
  doc.setFillColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
  doc.triangle(282, 195, 222, 195, 282, 135, 'F');
  doc.setFillColor(0, 107, 69); // Medium Green
  doc.triangle(277, 190, 232, 190, 277, 145, 'F');

  // 3. Inner Double Border
  doc.setDrawColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, 277, 190);
  doc.setLineWidth(0.5);
  doc.rect(11.5, 11.5, 274, 187);

  // 4. Main Text
  doc.setFont("times", "bold");
  doc.setFontSize(50);
  doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
  doc.text("CERTIFICATE", 148.5, 55, { align: "center", charSpace: 2 });
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(COLORS.SOFT[0], COLORS.SOFT[1], COLORS.SOFT[2]);
  doc.text("OF ACHIEVEMENT", 148.5, 68, { align: "center", charSpace: 4 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("THIS CERTIFICATE IS PRESENTED TO :", 148.5, 90, { align: "center" });

  // Recipient Name (Approximate script with italic serif)
  doc.setFont("times", "italic");
  doc.setFontSize(48);
  doc.setTextColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
  doc.text(recipientName || "Governance Learner", 148.5, 115, { align: "center" });

  // Divider
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(40, 125, 257, 125);

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
  const desc = "A certificate is awarded to an individual who has attained a specific accomplishment or achievement, whether in professional endeavors, projects, or training.";
  const splitDesc = doc.splitTextToSize(desc, 180);
  doc.text(splitDesc, 148.5, 138, { align: "center" });

  // 5. Footer & Seal
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.SOFT[0], COLORS.SOFT[1], COLORS.SOFT[2]);
  
  // Signature lines
  doc.setDrawColor(0, 0, 0);
  doc.line(50, 175, 100, 175);
  doc.text("Advisor", 75, 180, { align: "center" });
  
  doc.line(197, 175, 247, 175);
  doc.text("Organizer", 222, 180, { align: "center" });

  // Seal (Circle)
  doc.setFillColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
  doc.circle(148.5, 170, 12, 'F');
  doc.setDrawColor(COLORS.GREEN[0], COLORS.GREEN[1], COLORS.GREEN[2]);
  doc.setLineWidth(1);
  doc.circle(148.5, 170, 10);
  
  // Meta
  doc.setFontSize(8);
  doc.text(`Date: ${date || new Date().toLocaleDateString()}`, 40, 195);
  doc.text(`ID: ${certificateId || "GRH-XXXX-XXXX"}`, 257, 195, { align: "right" });

  if (isDownload) {
    const fileName = `GRH_Certificate_${(courseTitle || "Course").replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  }
  
  return doc;
};
