import { QRCodeSVG } from "qrcode.react";

interface Props {
  qrToken: string;
  classCode: string;
}

export default function QRCodeDisplay({ qrToken, classCode }: Props) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>QR — ${classCode}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:40px} svg{max-width:300px}</style>
      </head><body>
      <h2>${classCode}</h2>
      <div id="qr">${document.getElementById("qr-svg")?.outerHTML ?? ""}</div>
      <p style="font-size:12px;color:#555;margin-top:16px">Scan to mark attendance</p>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div style={styles.wrapper}>
      <div id="qr-svg" style={styles.qrBox}>
        <QRCodeSVG value={qrToken} size={220} level="H" />
      </div>
      <p style={styles.hint}>Students scan this QR code with the Attendance mobile app</p>
      <button style={styles.printBtn} onClick={handlePrint}>Print QR</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: "flex", flexDirection: "column", alignItems: "center", padding: 24, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" },
  qrBox: { background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)" },
  hint: { fontSize: 12, color: "#64748b", marginTop: 12, textAlign: "center" },
  printBtn: { marginTop: 12, padding: "8px 20px", background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
};
