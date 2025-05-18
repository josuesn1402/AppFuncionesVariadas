import { ChevronLeft } from 'lucide-react'
import type { PageProps } from '../models/props'

export default function Colores({ changeView }: PageProps) {
	return (
		<div className="min-h-screen flex bg-[#1e1e1e] text-white font-sans">
			{/* Sidebar */}
			<aside className="w-52 bg-[#202123] text-white p-4 space-y-1.5 border-r border-gray-700">
				<div className="flex items-center gap-x-1.5 text-lg font-semibold mb-4">
					<button className="cursor-pointer" onClick={changeView}>
						<ChevronLeft />
					</button>
					<h2>Colores</h2>
				</div>
				<button className={`block w-full text-left px-3 py-2 rounded text-sm `}>
					{/* {lang.toUpperCase()} */}
				</button>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-6 bg-[#343541]">
				<h1 className="text-2xl font-bold mb-4">Limpiar Código</h1>
			</main>
		</div>
	)
}
