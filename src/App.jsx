import { useState } from 'react'
import './App.css'
// Importamos o nosso "banco de dados" estático
import projectsData from './data/projects.json'

function App() {
  // Estado para busca 
  const [search, setSearch] = useState('')

  const filteredProjects = projectsData.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.professor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
      {/* Header da Organização */}
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center border-b border-gray-700 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-red-500">
            error404<span className="text-white">fatec</span>
          </h1>
          <p className="text-gray-400 mt-2">Backstage - Vitrine de Projetos Acadêmicos</p>
        </div>
        
        {/* Barra de Busca Simples */}
        <input 
          type="text" 
          placeholder="Buscar projeto ou professor..."
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {/* Grid de Projetos */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all group">
            <div className="h-48 bg-gray-700 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            <div className="p-6">
              <div className="flex gap-2 mb-3">
                {project.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase font-bold bg-red-900/30 text-red-400 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              <h2 className="text-xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <span className="text-xs text-gray-500">Prof. {project.professor}</span>
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  className="text-red-500 hover:text-red-400 text-sm font-semibold"
                >
                  Ver Projeto →
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Card de "Adicione seu projeto" - Incentivo para a sala */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-8 text-center opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-gray-400 mb-2">Seu projeto aqui?</p>
          <p className="text-xs">Abra um Pull Request na branch do seu grupo.</p>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-20 text-center text-gray-600 text-xs">
        <p>© 2026 error404fatec - Disciplina de Gestão da Produção / Programação Web</p>
      </footer>
    </div>
  )
}

export default App