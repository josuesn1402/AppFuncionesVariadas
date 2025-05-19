import { useState } from 'react'
import LimpiarCodigo from './pages/LimpiarCodigo'
import ColorConverter from './pages/ColorConverter'
import ConvertToExcel from './pages/ConvertToExcel.tsx'

type View =
	| 'limpiarCodigo'
	| 'colores'
	// | 'markDown'
	| 'convertToExcel'
	// | 'arrayToExcel'
	| null

const views = [
	{ id: 'limpiarCodigo', label: 'Limpiar Código' },
	{ id: 'colores', label: 'Colores' },
	// { id: 'markDown', label: 'MarkDown' },
	{ id: 'convertToExcel', label: 'Convertir a Excel' }
	// { id: 'arrayToExcel', label: 'Array a Excel' }
]

export default function App() {
	const [activeView, setActiveView] = useState<View>(null)

	const changeView = (view: View) => {
		setActiveView(view)
	}

	return (
		<>
			{!activeView && (
				<div className="min-h-screen flex text-white font-sans">
					<aside className="w-52 bg-[#202123] text-white p-4 space-y-1.5 border-r border-gray-700">
						<h2 className="text-lg font-semibold mb-4">Vistas</h2>
						{views.map(({ id, label }) => (
							<button
								key={id}
								className={`block w-full text-left px-3 py-2 rounded cursor-pointer ${
									activeView === id ? 'bg-blue-600' : 'hover:bg-gray-700'
								}`}
								onClick={() => changeView(id as View)}
							>
								{label}
							</button>
						))}
					</aside>
				</div>
			)}

			{activeView && (
				<>
					{activeView === 'limpiarCodigo' && (
						<LimpiarCodigo changeView={() => changeView(null)} />
					)}
					{activeView === 'colores' && (
						<ColorConverter changeView={() => changeView(null)} />
					)}
					{/* {activeView === 'markDown' && (
						<MarkDown changeView={() => changeView(null)} />
					)}*/}
					{activeView === 'convertToExcel' && (
						<ConvertToExcel changeView={() => changeView(null)} />
					)}
					{/* {activeView === 'arrayToExcel' && (
						<ArrayToExcel changeView={() => changeView(null)} />
					)} */}
				</>
			)}
		</>
	)
}
