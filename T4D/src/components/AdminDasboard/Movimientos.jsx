import { useState, useEffect } from "react";
import { supabase } from '../../Supabase/SupabaseClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { Download } from "lucide-react";

function Movimientos() {
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [usuario, setUsuario] = useState("todos");
  const [movimientos, setMovimientos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [exportMenu, setExportMenu] = useState(false);

  const cargarMovimientos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('movimientos_inventario')
      .select(`
        id_movimiento,
        fecha_movimiento,
        tipo_movimiento,
        cantidad,
        observacion,
        productos (
          nombre_producto
        ),
        usuarios (
          username
        )
      `)
      .order('fecha_movimiento', { ascending: false });

    if (!error && data) {
      const formateados = data.map((m) => ({
        id: m.id_movimiento,
        fecha: m.fecha_movimiento
          ? new Date(m.fecha_movimiento).toLocaleString('es-CO', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit',
            })
          : '—',
        usuario: m.usuarios?.username || '—',
        producto: m.productos?.nombre_producto || '—',
        tipo: m.tipo_movimiento,
        cantidad: m.tipo_movimiento === 'salida' ? -Math.abs(m.cantidad) : Math.abs(m.cantidad),
        observacion: m.observacion || '',
      }));
      setMovimientos(formateados);
      const unicos = [...new Set(formateados.map(m => m.usuario).filter(u => u !== '—'))];
      setUsuarios(unicos);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarMovimientos();

    const canal = supabase
      .channel('movimientos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movimientos_inventario' }, () => {
        cargarMovimientos();
      })
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const normalizar = (texto) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtrados = movimientos.filter((mov) => {
    const texto = normalizar(busqueda);
    const coincideBusqueda =
      normalizar(mov.producto).includes(texto) ||
      normalizar(mov.usuario).includes(texto);
    const coincideTipo = tipo === "todos" ? true : mov.tipo === tipo;
    const coincideUsuario = usuario === "todos" ? true : mov.usuario === usuario;
    return coincideBusqueda && coincideTipo && coincideUsuario;
  });

  const totalEntradas = filtrados
    .filter(m => m.tipo === 'entrada')
    .reduce((a, m) => a + Math.abs(m.cantidad), 0);

  const totalSalidas = filtrados
    .filter(m => m.tipo === 'salida')
    .reduce((a, m) => a + Math.abs(m.cantidad), 0);

  // ─── EXPORTAR EXCEL ───────────────────────────────────────────────
  const exportarExcel = () => {
    const datos = filtrados.map((mov) => ({
      Fecha: mov.fecha,
      Usuario: mov.usuario,
      Producto: mov.producto,
      Tipo: mov.tipo === 'entrada' ? 'Entrada' : 'Salida',
      Cantidad: mov.cantidad > 0 ? `+${mov.cantidad}` : `${mov.cantidad}`,
      Observación: mov.observacion || '—',
    }));

    datos.push({});
    datos.push({ Fecha: 'RESUMEN', Usuario: '', Producto: '', Tipo: '', Cantidad: '', Observación: '' });
    datos.push({ Fecha: 'Total Entradas', Usuario: '', Producto: '', Tipo: '', Cantidad: totalEntradas, Observación: '' });
    datos.push({ Fecha: 'Total Salidas', Usuario: '', Producto: '', Tipo: '', Cantidad: totalSalidas, Observación: '' });

    const ws = XLSX.utils.json_to_sheet(datos);
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 30 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');
    XLSX.writeFile(wb, `Movimientos_Inventario_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ─── EXPORTAR PDF ─────────────────────────────────────────────────
  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFillColor(184, 155, 106);
    doc.rect(0, 0, doc.internal.pageSize.width, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Movimientos de Inventario', 14, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 21);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Entradas: ${totalEntradas} uds`, 14, 36);
    doc.text(`Total Salidas: ${totalSalidas} uds`, 80, 36);
    doc.text(`Registros: ${filtrados.length}`, 160, 36);

    autoTable(doc, {
      startY: 42,
      head: [['Fecha', 'Usuario', 'Producto', 'Tipo', 'Cantidad', 'Observación']],
      body: filtrados.map((mov) => [
        mov.fecha,
        mov.usuario,
        mov.producto,
        mov.tipo === 'entrada' ? 'Entrada' : 'Salida',
        mov.cantidad > 0 ? `+${mov.cantidad}` : `${mov.cantidad}`,
        mov.observacion || '—',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [184, 155, 106], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 248, 245] },
      columnStyles: {
        0: { cellWidth: 38 },
        1: { cellWidth: 28 },
        2: { cellWidth: 60 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 'auto' },
      },
    });

    doc.save(`Movimientos_Inventario_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ─── EXPORTAR WORD ────────────────────────────────────────────────
  const exportarWord = async () => {
    const headerColor = 'B89B6A';

    const headerRow = new TableRow({
      tableHeader: true,
      children: ['Fecha', 'Usuario', 'Producto', 'Tipo', 'Cantidad', 'Observación'].map(
        (text) =>
          new TableCell({
            shading: { fill: headerColor },
            children: [
              new Paragraph({
                children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 16, type: WidthType.PERCENTAGE },
          })
      ),
    });

    const dataRows = filtrados.map(
      (mov) =>
        new TableRow({
          children: [
            mov.fecha,
            mov.usuario,
            mov.producto,
            mov.tipo === 'entrada' ? 'Entrada' : 'Salida',
            mov.cantidad > 0 ? `+${mov.cantidad}` : `${mov.cantidad}`,
            mov.observacion || '—',
          ].map(
            (text) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: String(text), size: 18 })],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                },
              })
          ),
        })
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'Movimientos de Inventario',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Fecha de exportación: `, bold: true }),
                new TextRun({ text: new Date().toLocaleString('es-CO') }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Total Entradas: `, bold: true }),
                new TextRun({ text: `${totalEntradas} unidades     ` }),
                new TextRun({ text: `Total Salidas: `, bold: true }),
                new TextRun({ text: `${totalSalidas} unidades     ` }),
                new TextRun({ text: `Registros: `, bold: true }),
                new TextRun({ text: `${filtrados.length}` }),
              ],
              spacing: { after: 300 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [headerRow, ...dataRows],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Movimientos_Inventario_${new Date().toISOString().slice(0, 10)}.docx`);
  };

  // ─── ITEMS DEL MENÚ DE EXPORTAR ──────────────────────────────────
  const exportItems = [
    {
      label: "Exportar Excel",
      action: () => { exportarExcel(); setExportMenu(false); },
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#1D6F42"/>
          <path d="M7 7l3 5-3 5h2.5l1.75-3L13 17h2.5l-3-5 3-5H13l-1.75 3L9.5 7H7z" fill="#fff"/>
          <rect x="14" y="7" width="3" height="1.5" rx="0.5" fill="#fff" opacity="0.6"/>
          <rect x="14" y="10.25" width="3" height="1.5" rx="0.5" fill="#fff" opacity="0.6"/>
          <rect x="14" y="13.5" width="3" height="1.5" rx="0.5" fill="#fff" opacity="0.6"/>
        </svg>
      ),
    },
    {
      label: "Exportar Word",
      action: () => { exportarWord(); setExportMenu(false); },
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#2B579A"/>
          <path d="M5 7h14v1.5H5V7zm0 4.5h8V13H5v-1.5zm0 4.5h14V17.5H5V16z" fill="#fff" opacity="0.25"/>
          <path d="M6 8.5l2 7 2-5 2 5 2-7h-1.5l-1 4.5-1.5-4.5h-2l-1.5 4.5-1-4.5H6z" fill="#fff"/>
        </svg>
      ),
    },
    {
      label: "Exportar PDF",
      action: () => { exportarPDF(); setExportMenu(false); },
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#E53935"/>
          <path d="M7 6h6l4 4v8a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z" fill="#fff" opacity="0.15"/>
          <path d="M13 6l4 4h-3a1 1 0 01-1-1V6z" fill="#fff" opacity="0.5"/>
          <path d="M8.5 13.5h2c.8 0 1.3-.5 1.3-1.2S11.3 11 10.5 11H8v5h.5v-2.5zm0-2h1.9c.5 0 .8.3.8.8s-.3.8-.8.8H8.5v-1.6zm4 5H14c1.1 0 1.8-.7 1.8-2s-.7-2-1.8-2h-1.5v4zm.5-3.5h.9c.8 0 1.3.5 1.3 1.5s-.5 1.5-1.3 1.5H13v-3z" fill="#fff"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      className="p-5"
      style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}
    >

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Movimientos de Inventario</h4>
          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#B89B6A",
              borderRadius: "10px",
              marginBottom: "5px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Historial de entradas y salidas de productos
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap">

          {/* ─── DROPDOWN EXPORTAR (mismo estilo que MovimientosContables) ─── */}
          <div style={{ position: "relative" }}>
            <button
              className="btn rounded-pill btn-sm"
              style={{
                border: "none",
                background: "#B89B6A",
                color: "#000",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
              onClick={() => setExportMenu((v) => !v)}
            >
              <Download size={14} /> Exportar ▾
            </button>

            {exportMenu && (
              <div style={{
                position: "absolute", right: 0, top: "110%", zIndex: 999,
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 170, overflow: "hidden",
              }}>
                {exportItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", textAlign: "left",
                      padding: "9px 14px", background: "none", border: "none",
                      fontSize: 13, color: "#374151", cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="btn rounded-pill btn-sm"
            style={{
              backgroundColor: "#B89B6A", color: "#000", border: "none",
              fontSize: "13px", padding: "8px 18px",
              display: "flex", alignItems: "center", gap: "6px",
            }}
            onClick={() => cargarMovimientos()}
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* Overlay para cerrar menú al hacer clic fuera */}
      {exportMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 998 }}
          onClick={() => setExportMenu(false)}
        />
      )}

      {/* TARJETAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          className="card shadow-sm rounded-4"
          style={{ padding: "20px", border: "1.5px solid #B89B6A" }}
        >
          <small style={{ color: "#B89B6A", fontSize: "13px", fontWeight: "600" }}>
            Total Entradas
          </small>
          <h3 style={{ fontSize: "26px", fontWeight: "bold", color: "#1f2937", margin: "4px 0" }}>
            {totalEntradas}
          </h3>
          <small style={{ color: "#6b7280", fontSize: "12px" }}>
            unidades en el periodo filtrado
          </small>
        </div>
        <div
          className="card shadow-sm rounded-4"
          style={{ padding: "20px", border: "1.5px solid #B89B6A" }}
        >
          <small style={{ color: "#B89B6A", fontSize: "13px", fontWeight: "600" }}>
            Total Salidas
          </small>
          <h3 style={{ fontSize: "26px", fontWeight: "bold", color: "#dc2626", margin: "4px 0" }}>
            {totalSalidas}
          </h3>
          <small style={{ color: "#6b7280", fontSize: "12px" }}>
            unidades en el periodo filtrado
          </small>
        </div>
      </div>

      {/* FILTROS */}
      <div
        className="card p-3 rounded-4 shadow-sm mb-4"
        style={{ background: "#fff", border: "1px solid #e5e7eb" }}
      >
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>
          Filtros y Búsqueda
        </h6>
        <div className="d-flex gap-3" style={{ flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar por producto o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className="form-select rounded-pill"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="todos">Todos los tipos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
          <select
            className="form-select rounded-pill"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="todos">Todos los usuarios</option>
            {usuarios.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <button
            className="btn rounded-pill btn-sm"
            style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}
            onClick={() => { setBusqueda(""); setTipo("todos"); setUsuario("todos"); }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>
          Historial de Movimientos ({filtrados.length})
        </h6>

        {cargando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
            Cargando movimientos...
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
            No se encontraron movimientos.
          </div>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                {["Fecha", "Usuario", "Producto", "Tipo", "Cantidad", "Observación"].map((h) => (
                  <th key={h} style={{ fontSize: "12px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((mov) => (
                <tr key={mov.id}>
                  <td style={{ fontSize: "13px" }}>{mov.fecha}</td>
                  <td style={{ fontSize: "13px" }}>{mov.usuario}</td>
                  <td style={{ fontSize: "13px", fontWeight: "600" }}>{mov.producto}</td>
                  <td>
                    <span
                      style={{
                        background: mov.tipo === "entrada" ? "#1f2937" : "#374151",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "500",
                        display: "inline-block",
                        textTransform: "capitalize",
                      }}
                    >
                      {mov.tipo === "entrada" ? "Entrada" : "Salida"}
                    </span>
                  </td>
                  <td
                    className="fw-bold"
                    style={{ color: mov.tipo === "entrada" ? "#1f2937" : "#dc2626", fontSize: "13px" }}
                  >
                    {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                  </td>
                  <td style={{ fontSize: "12px", color: "#6b7280" }}>{mov.observacion || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default Movimientos;