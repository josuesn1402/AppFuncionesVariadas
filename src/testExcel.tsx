import * as XLSX from 'xlsx'

export function ExportFechas() {
	const exportExcel = () => {
		// Tu estructura base
		const jsonData = {
			fecha: [
				'2025-04-09',
				'2025-04-10',
				'2025-04-11',
				'2025-04-12',
				'2025-04-14'
			],
			fechaHora: [
				'2025-04-09 20:35:38',
				'2025-04-10 21:15:00',
				'2025-04-11 18:00:24',
				'2025-04-12 09:45:10',
				'2025-04-14 14:29:24'
			]
		}

		// Convertimos al formato [{fecha, fechaHora}]
		const data = jsonData.fecha.map((_, i) => ({
			fecha: formatDate(new Date(`${jsonData.fecha[i]}T00:00:00`)),
			fechaHora: formatDateTime(new Date(jsonData.fechaHora[i]))
		}))

		const ws = XLSX.utils.json_to_sheet(data)

		// Formato de fecha (columna A) y fechaHora (columna B)
		const numRows = data.length
		for (let i = 2; i <= numRows + 1; i++) {
			const cellFecha = `A${i}`
			const cellFechaHora = `B${i}`
			if (ws[cellFecha]) ws[cellFecha].z = 'dd/mm/yyyy'
			if (ws[cellFechaHora]) ws[cellFechaHora].z = 'dd/mm/yyyy hh:mm:ss'
		}

		// Ajuste de columnas
		ws['!cols'] = [{ wch: 12 }, { wch: 20 }]

		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, 'Fechas Exportadas')
		XLSX.writeFile(wb, 'fechas_exportadas.xlsx')
	}

	const pad = (v: number) => v.toString().padStart(2, '0')

	const formatDate = (date: Date) =>
		`${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`

	const formatDateTime = (date: Date) =>
		`${formatDate(date)} ${pad(date.getHours())}:${pad(
			date.getMinutes()
		)}:${pad(date.getSeconds())}`

	return <button onClick={exportExcel}>Exportar Fechas</button>
}
