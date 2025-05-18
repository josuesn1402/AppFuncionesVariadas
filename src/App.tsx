import { useState } from 'react'
import LimpiarCodigo from './pages/LimpiarCodigo'
import Colores from './pages/Colores.tsx'
import MarkDown from './pages/MarkDown.tsx'

type View = 'limpiarCodigo' | 'colores' | 'markDown' | null

export default function App() {
	const [activeView, setActiveView] = useState<View>(null)

	const changeView = (view: View) => {
		setActiveView(view)
	}

	return (
		<>
			{!activeView && (
				<div className="min-h-screen flex bg-[#1e1e1e] text-white font-sans">
					{/* Sidebar */}
					<aside className="w-48 bg-gray-900 text-white p-4 space-y-2">
						<h2 className="text-lg font-semibold mb-4">Vistas</h2>
						<button
							className={`block w-full text-left px-3 py-2 rounded cursor-pointer ${
								activeView === 'limpiarCodigo'
									? 'bg-blue-600'
									: 'hover:bg-gray-700'
							}`}
							onClick={() => changeView('limpiarCodigo')}
						>
							Limpiar Código
						</button>
						<button
							className={`block w-full text-left px-3 py-2 rounded cursor-pointer ${
								activeView === 'colores' ? 'bg-blue-600' : 'hover:bg-gray-700'
							}`}
							onClick={() => changeView('colores')}
						>
							Colores
						</button>
						<button
							className={`block w-full text-left px-3 py-2 rounded cursor-pointer ${
								activeView === 'markDown' ? 'bg-blue-600' : 'hover:bg-gray-700'
							}`}
							onClick={() => changeView('markDown')}
						>
							MarkDown
						</button>
					</aside>
				</div>
			)}
			{/* Contenido principal */}
			{activeView && (
				<>
					{activeView === 'limpiarCodigo' && (
						<LimpiarCodigo changeView={() => changeView(null)} />
					)}
					{activeView === 'colores' && (
						<Colores changeView={() => changeView(null)} />
					)}
					{activeView === 'markDown' && (
						<MarkDown changeView={() => changeView(null)} />
					)}
				</>
			)}
		</>
	)
}
