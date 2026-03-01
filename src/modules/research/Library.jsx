import React, { useState } from 'react';
import { RESOURCES } from '../../data/legacyData';
import CtaSection from '../../components/ui/CtaSection';
import './Library.css';
import './ResourceViewer.css';

const Library = () => {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [readingResource, setReadingResource] = useState(null);

  const toggleType = (t) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const toggleCat = (c) => {
    setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const filtered = RESOURCES.filter(r => {
    const ms = r.title.toLowerCase().includes(search.toLowerCase()) || 
               r.description.toLowerCase().includes(search.toLowerCase());
    const mt = selectedTypes.length === 0 || selectedTypes.includes(r.type);
    const mc = selectedCats.length === 0 || selectedCats.includes(r.category);
    return ms && mt && mc;
  });

  if (readingResource) {
    return (
      <div className="viewer-overlay">
        <div className="viewer-modal animate-in">
          <header className="viewer-header">
            <div className="viewer-info">
              <span className="material-symbols-outlined viewer-icon">description</span>
              <div>
                <h3>{readingResource.title}</h3>
                <p>{readingResource.author} • {readingResource.year} • {readingResource.type}</p>
              </div>
            </div>
            <div className="viewer-controls">
              <button className="control-btn" title="Zoom Out"><span className="material-symbols-outlined">zoom_out</span></button>
              <span style={{fontSize: '14px', fontWeight: 600}}>100%</span>
              <button className="control-btn" title="Zoom In"><span className="material-symbols-outlined">zoom_in</span></button>
              <button className="special-button" style={{padding: '0.5rem 1rem', fontSize: '0.8rem'}}>Download PDF</button>
              <button className="viewer-close" onClick={() => setReadingResource(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </header>

          <main className="viewer-content">
            <div className="viewer-page-mock">
              <div className="pdf-header-mark">
                <span>GOVHUB RESEARCH LIBRARY</span>
                <span>{readingResource.type.toUpperCase()}</span>
              </div>
              
              <div className="mock-text-line headline"></div>
              <h1 style={{fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--secondary)'}}>{readingResource.title}</h1>
              <p style={{fontSize: '1.1rem', color: 'var(--text-soft)', marginBottom: '3rem'}}>Prepared by {readingResource.author}, {readingResource.year}</p>
              
              <div className="mock-text-line"></div>
              <div className="mock-text-line"></div>
              <div className="mock-text-line short"></div>

              <div className="mock-image-box" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                <img src={readingResource.coverImage} alt="Cover" style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2}} />
                <span style={{position: 'absolute', fontWeight: 800, color: 'var(--secondary)', opacity: 0.5}}>RESOURCE PREVIEW</span>
              </div>

              <div style={{marginTop: '2rem'}}>
                <h3 style={{fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700}}>Executive Summary</h3>
                <p style={{lineHeight: 1.8, color: '#444'}}>{readingResource.description}</p>
              </div>

              <div style={{marginTop: '3rem'}}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="mock-text-line" style={{width: `${80 + Math.random() * 20}%`}}></div>
                ))}
              </div>
            </div>
          </main>

          <footer className="viewer-footer">
            <div className="page-nav">
              <button disabled><span className="material-symbols-outlined">chevron_left</span> Previous</button>
              <span>Page 1 of {readingResource.pages}</span>
              <button disabled>Next <span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper research-page">

      <div className="research-hero">
        <div className="section-container">
          <div className="hero-inner">
            <div className="hero-inner-left">
              <div className="hero-chip">
                <div className="dot">
                  <img src="/assets/color-dots-[1.0].svg" alt="dot" />
                </div>
                <p className="chip-text">Digital e-Library</p>
              </div>
              <h1 className="section-title text-white">Curated <br /> <span className="green-text">Governance Knowledge</span></h1>
              <p className="hero-subline">
                Explore {RESOURCES.length}+ professional resources, journals and policy frameworks.
              </p>
              <div className="learn-hero-search">
                <span className="material-symbols-outlined search-icon">search</span>
                <input 
                  placeholder="Search by title, author, or keyword..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
            </div>
            {/* Optional hero stats for research if needed, or just leave as is for now */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">20+</span>
                <span className="stat-label">Years of Data</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Resources</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container research-content">

        <div className="research-layout">
          <aside className="filter-sidebar">
            <div className="sidebar-title">
              <h3>Filters</h3>
              {(selectedTypes.length > 0 || selectedCats.length > 0) && (
                <button className="clear-btn" onClick={() => {setSelectedTypes([]); setSelectedCats([]);}}>Clear All</button>
              )}
            </div>

            <div className="filter-group">
              <div className="filter-group-title">RESOURCE TYPE</div>
              {["PERL", "SPARC", "SLGP"].map(t => (
                <label key={t} className="filter-check">
                  <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleType(t)} />
                  <span>{t}</span>
                  <span className="filter-count">{RESOURCES.filter(r => r.type === t).length}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-group-title">CATEGORIES</div>
              {["Finance", "Integrity", "Governance", "Democracy", "Transparency", "Digital"].map(c => (
                <label key={c} className="filter-check">
                  <input type="checkbox" checked={selectedCats.includes(c)} onChange={() => toggleCat(c)} />
                  <span>{c}</span>
                  <span className="filter-count">{RESOURCES.filter(r => r.category === c).length}</span>
                </label>
              ))}
            </div>
          </aside>

          <div className="research-results">
            <div className="results-header">
              <span className="results-count-text">Found {filtered.length} resources</span>
              <div className="view-toggle">
                <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>⊞</button>
                <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>≡</button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'resources-grid' : 'resources-list'}>
              {filtered.map((res, i) => (
                viewMode === 'grid' ? (
                  <div key={res.id} className="resource-card animate-up" style={{animationDelay: `${i*0.05}s`}} onClick={() => setReadingResource(res)}>
                    <div className="resource-cover">
                      <img src={res.coverImage} alt={res.title} className="resource-cover-img" />
                      {res.featured && <span className="featured-badge">FEATURED</span>}
                    </div>
                    <div className="resource-body">
                      <div className="resource-meta-top">
                        <span className="tag">{res.category}</span>
                        <span className="resource-year">{res.year}</span>
                      </div>
                      <h3 className="resource-title">{res.title}</h3>
                      <p className="resource-desc">{res.description}</p>
                      <div className="resource-footer">
                        <span className="resource-author">{res.author}</span>
                      </div>
                      <div className="resource-actions">
                        <button className="special-button" style={{flex: 1}}>Read Now</button>
                        <button className="action-btn"><span className="material-symbols-outlined">download</span></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={res.id} className="resource-list-item animate-up" style={{animationDelay: `${i*0.05}s`}} onClick={() => setReadingResource(res)}>
                    <div className="list-icon">
                      <img src={res.coverImage} alt={res.title} className="list-thumb" />
                    </div>
                    <div className="list-info">
                      <h3>{res.title}</h3>
                      <p>{res.description}</p>
                      <div className="resource-tags" style={{marginTop: 8}}>
                        <span className="tag">{res.category}</span>
                        <span className="tag">{res.type}</span>
                        <span className="resource-year">{res.year} · {res.pages} pages</span>
                      </div>
                    </div>
                    <div className="list-meta">
                      <span className="resource-author">{res.author}</span>
                      <div className="list-actions">
                        <button className="btn-primary btn-sm">Read</button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📂</span>
                <h3>No matching resources</h3>
                <p>Try different filters or keywords.</p>
              </div>
            )}
          </div>
        </div>

      </div>

         {/* CTA Section */}
        <CtaSection 
          eyebrow="Expand Your Knowledge"
          title={<>Explore our full <br /><span className="green-text">Governance Library</span></>}
          description="Gain access to thousands of documents, research papers, and case studies from across the globe."
          primaryActionLabel="Start Researching"
          secondaryActionLabel="View Categories"
          secondaryActionHref="#filters"
        />
    </div>
  );
};

export default Library;
