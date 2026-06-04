import { useState, useEffect } from "react";
import { supabase } from '../../Supabase/SupabaseClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

function Movimientos() {
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [usuario, setUsuario] = useState("todos");
  const [movimientos, setMovimientos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

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

    // Suscripción en tiempo real para actualizar automáticamente
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

  // ─── ESTILO COMPARTIDO PARA TODOS LOS BOTONES ─────────────────────
  const btnEstilo = {
    border: "none",
    fontSize: "13px",
    padding: "8px 18px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

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
          <button
            className="btn rounded-pill btn-sm"
            onClick={exportarExcel}
            title="Exportar a Excel"
            style={{ ...btnEstilo, backgroundColor: "#217346", color: "#fff" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 12.5l1.5 2.5L8 17.5H9.5l1-1.8 1 1.8H13l-1.5-2.5L13 12.5H11.5l-1 1.8-1-1.8H8z"/>
            </svg>
            Excel
          </button>

          <button
            className="btn rounded-pill btn-sm"
            onClick={exportarPDF}
            title="Exportar a PDF"
            style={{ ...btnEstilo, backgroundColor: "#dc2626", color: "#fff" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM11 13h1v4h-1v-4zm-2 1h1v3H9v-3zm4-1h1v4h-1v-4z"/>
            </svg>
            PDF
          </button>

          <button
            className="btn rounded-pill btn-sm"
            onClick={exportarWord}
            title="Exportar a Word"
            style={{ ...btnEstilo, backgroundColor: "#2b579a", color: "#fff" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM7 13h1.5l1 3.5 1-3.5H12l-1.5 5h-2L7 13z"/>
            </svg>
            Word
          </button>

          <button
            className="btn rounded-pill btn-sm"
            style={{ ...btnEstilo, backgroundColor: "#B89B6A", color: "#000" }}
            onClick={() => cargarMovimientos()}
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

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