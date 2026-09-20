import { useState } from 'react'
import './App.css'

import projectsData from './data/projects.json'
import analysisData from './data/project-analysis.json'

function App() {
  const [search, setSearch] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)

  /*
   * O project-analysis.json é a fonte dos projetos encontrados
   * automaticamente pelo scanner.
   *
   * O projects.json fornece informações complementares,
   * como título, professor, imagem e descrição.
   */
  const projects = analysisData.map((analysis) => {
    const projectInfo = projectsData.find(
      (project) => project.folder === analysis.id
    )

    if (projectInfo) {
      return {
        ...projectInfo,
        analysis,
      }
    }

    /*
     * Caso o projeto exista em mock-projects, mas ainda
     * não tenha cadastro manual em projects.json.
     */
    return {
      id: analysis.id,
      folder: analysis.id,
      title: analysis.name,
      professor: 'Não informado',
      description: 'Projeto analisado automaticamente pelo sistema.',
      tags: analysis.stack,
      image: null,
      githubUrl: '#',
      analysis,
    }
  })

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase()) ||
    project.professor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">

      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center border-b border-gray-700 pb-6">

        <div>
          <h1 className="text-4xl font-black tracking-tighter text-red-500">
            error404<span className="text-white">fatec</span>
          </h1>

          <p className="text-gray-400 mt-2">
            Backstage - Vitrine de Projetos Acadêmicos
          </p>
        </div>

        {/* Busca */}
        <input
          type="text"
          placeholder="Buscar projeto ou professor..."
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
          onChange={(e) => setSearch(e.target.value)}
        />

      </header>

      {/* Grid de projetos */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all group"
          >

            {/* Imagem */}
            <div className="h-48 bg-gray-700 overflow-hidden">

              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Projeto
                </div>
              )}

            </div>

            {/* Conteúdo */}
            <div className="p-6">

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">

                {project.tags.length > 0 ? (
                  project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase font-bold bg-red-900/30 text-red-400 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] uppercase font-bold bg-gray-700 text-gray-400 px-2 py-1 rounded">
                    Sem stack identificada
                  </span>
                )}

              </div>

              <h2 className="text-xl font-bold mb-2">
                {project.title}
              </h2>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Nota */}
              <div className="flex items-center justify-between mb-4">

                <span className="text-sm text-gray-400">
                  Nota da análise
                </span>

                <span className="text-2xl font-bold text-red-500">
                  {project.analysis.score}/10
                </span>

              </div>

              {/* Rodapé */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">

                <span className="text-xs text-gray-500">
                  Prof. {project.professor}
                </span>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="text-red-500 hover:text-red-400 text-sm font-semibold"
                >
                  Ver detalhes →
                </button>

              </div>

            </div>

          </div>
        ))}

        {/* Card de adicionar projeto */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-8 text-center opacity-50 hover:opacity-100 transition-opacity">

          <p className="text-gray-400 mb-2">
            Seu projeto aqui?
          </p>

          <p className="text-xs">
            Abra um Pull Request na branch do seu grupo.
          </p>

        </div>

      </main>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-20 text-center text-gray-600 text-xs">

        <p>
          © 2026 error404fatec - Disciplina de Gestão da Produção / Programação Web
        </p>

      </footer>

    </div>
  )
}

function ProjectModal({ project, onClose }) {
  const analysis = project.analysis

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >

      <div
        className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
        onClick={(event) => event.stopPropagation()}
      >

        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-6">

          <div>

            <h2 className="text-3xl font-bold">
              {project.title}
            </h2>

            <p className="text-gray-400 mt-2">
              Prof. {project.professor}
            </p>

          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>

        </div>

        {/* Descrição */}
        <div className="mb-6">

          <h3 className="text-lg font-bold mb-2">
            Sobre o projeto
          </h3>

          <p className="text-gray-400">
            {project.description}
          </p>

        </div>

        {/* Nota */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 text-center">

          <p className="text-gray-400 text-sm mb-2">
            Nota da análise
          </p>

          <p className="text-5xl font-black text-red-500">
            {analysis.score}/10
          </p>

        </div>

        {/* Critérios */}
        <div className="mb-6">

          <h3 className="text-lg font-bold mb-4">
            Conformidade
          </h3>

          <div className="space-y-3">

            <Criterion
              label="Possui README"
              value={analysis.criteria.readme}
            />

            <Criterion
              label="Possui GitIgnore"
              value={analysis.criteria.gitignore}
            />

            <Criterion
              label="Possui testes"
              value={analysis.criteria.tests}
            />

            <Criterion
              label="Possui dependências"
              value={analysis.criteria.dependencies}
            />

            <Criterion
              label="Possui estrutura analisável"
              value={analysis.criteria.structure}
            />

          </div>

        </div>

        {/* Stack */}
        <div className="mb-6">

          <h3 className="text-lg font-bold mb-3">
            Stack identificada
          </h3>

          {analysis.stack.length > 0 ? (

            <div className="flex flex-wrap gap-2">

              {analysis.stack.map((technology) => (
                <span
                  key={technology}
                  className="bg-red-900/30 text-red-400 px-3 py-1 rounded"
                >
                  {technology}
                </span>
              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              Nenhuma tecnologia identificada.
            </p>

          )}

        </div>

        {/* Dependências */}
        <div>

          <h3 className="text-lg font-bold mb-3">
            Dependências encontradas
          </h3>

          {analysis.dependencies.length > 0 ? (

            <ul className="text-gray-400 space-y-1">

              {analysis.dependencies.map((dependency) => (
                <li key={dependency}>
                  • {dependency}
                </li>
              ))}

            </ul>

          ) : (

            <p className="text-gray-500">
              Nenhuma dependência encontrada.
            </p>

          )}

        </div>

        {/* GitHub */}
        {project.githubUrl && project.githubUrl !== '#' && (
          <div className="mt-8 pt-6 border-t border-gray-700">

            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-red-500 hover:text-red-400 font-semibold"
            >
              Ver projeto no GitHub →
            </a>

          </div>
        )}

      </div>

    </div>
  )
}

function Criterion({ label, value }) {
  return (
    <div className="flex justify-between items-center bg-gray-900 rounded-lg px-4 py-3">

      <span className="text-gray-300">
        {label}
      </span>

      <span
        className={
          value
            ? 'text-green-400 font-semibold'
            : 'text-red-400 font-semibold'
        }
      >
        {value ? 'Sim' : 'Não'}
      </span>

    </div>
  )
}

export default App