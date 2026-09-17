import projects from './data/projects.json';
import './App.css';

const GRADE_VAR = {
  A: 'var(--grade-a)',
  B: 'var(--grade-b)',
  C: 'var(--grade-c)',
  D: 'var(--grade-d)',
  F: 'var(--grade-f)',
};

function GradeBadge({ grade }) {
  const color = GRADE_VAR[grade] || GRADE_VAR.F;
  return (
    <span className="grade-badge" style={{ color }}>
      {grade}
    </span>
  );
}

function ProjectCard({ project }) {
  const color = GRADE_VAR[project.grade] || GRADE_VAR.F;

  return (
    <article className="card">
      <div className="card-top">
        <h3 className="card-name">
          {project.url ? (
            <a href={project.url} target="_blank" rel="noreferrer">
              <span className="card-owner">{project.owner}/</span>
              {project.name}
            </a>
          ) : (
            <>
              <span className="card-owner">{project.owner}/</span>
              {project.name}
            </>
          )}
        </h3>
        <GradeBadge grade={project.grade} />
      </div>

      <p className="card-desc">{project.description || 'Sem descrição.'}</p>

      <div className="score-row">
        <div className="score-track">
          <div
            className="score-fill"
            style={{ width: `${project.total}%`, background: color }}
          />
        </div>
        <span className="score-num">{project.total}/100</span>
      </div>

      {project.stack?.length > 0 && (
        <div className="stack-tags">
          {project.stack.map((tech) => (
            <span className="tag" key={tech}>
              {tech}
            </span>
          ))}
        </div>
      )}

      <details className="checklist">
        <summary>Ver critérios avaliados</summary>
        <ul>
          {project.breakdown.map((item) => (
            <li key={item.key}>
              <span className={`mark ${item.achieved ? 'yes' : 'no'}`}>
                {item.achieved ? '✔' : '✘'}
              </span>
              <span>
                {item.label} ({item.points}/{item.max})
                {item.detail && <span className="detail"> — {item.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}

export default function App() {
  const sorted = [...projects].sort((a, b) => b.total - a.total);

  return (
    <div className="page">
      <header className="header">
        <h1>Backstage FATEC</h1>
        <span className="path">src/data/projects.json</span>
      </header>

      <p className="subtitle">
        Catálogo de repositórios avaliados por boas práticas de engenharia. Rode{' '}
        <code>npm run scan &lt;url-do-github&gt;</code> para adicionar um repositório, ou{' '}
        <code>npm run scan -- --local mock-projects/nome</code> para uma pasta local.
      </p>

      {sorted.length === 0 ? (
        <div className="empty">
          Nenhum projeto escaneado ainda. Rode <code>npm run scan &lt;url&gt;</code> no terminal
          para popular este catálogo.
        </div>
      ) : (
        <div className="grid">
          {sorted.map((project) => (
            <ProjectCard project={project} key={project.id} />
          ))}
        </div>
      )}
    </div>
  );
}
