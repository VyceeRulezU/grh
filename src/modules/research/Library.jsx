import React, { useState } from 'react';
import { RESOURCES } from '../../data/legacyData';
import './Library.css';

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
      <div className="pdf-reader">
        <div className="pdf-topbar">
          <button className="back-btn" onClick={() => setReadingResource(null)}>← Back to Library</button>
          <div className="pdf-title">
            <strong>{readingResource.title}</strong>
            <span>{readingResource.author} ({readingResource.year})</span>
          </div>
          <div className="pdf-controls">
            <button disabled>➖</button>
            <span>100%</span>
            <button disabled>➕</button>
            <button className="btn-primary btn-sm">Download PDF</button>
          </div>
        </div>
        <div className="pdf-viewer">
          <div className="pdf-page">
            <div className="pdf-header-mark">
              <span>GOVHUB RESEARCH LIBRARY</span>
              <span>{readingResource.type.toUpperCase()}</span>
            </div>
            <div className="pdf-content">
              <h2>{readingResource.title}</h2>
              <p className="pdf-author">Author: {readingResource.author}</p>
              <div style={{marginTop: 40}}>
                <h3>Abstract</h3>
                <p>{readingResource.description}</p>
                <div style={{marginTop: 40, height: 400, background: '#f7f9f8', border: '1px dashed #ccc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>
                   PDF Content Rendering Placeholder
                </div>
              </div>
            </div>
            <div className="pdf-footer-mark">
              <span>© {readingResource.year} Governance Resource Hub</span>
              <span>Page 1 of {readingResource.pages}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper research-page">
      <div className="research-hero">
        <div className="container">
          <div className="section-label" style={{background: 'rgba(255,255,255,0.1)', color: 'white'}}>📖 Digital E-Library</div>
          <h1 className="section-title text-white">Curated Governance Knowledge</h1>
          <p className="hero-subline">Explore {RESOURCES.length}+ professional resources, journals and policy frameworks.</p>
          <div className="learn-hero-search">
            <span className="search-icon">🔍</span>
            <input 
              placeholder="Search by title, author, or keyword..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
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
              {["Book", "Report", "Article"].map(t => (
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
                    <div className="resource-cover" style={{background: i%2===0 ? '#e6f0f2' : '#f0f9f4'}}>
                      <span className="resource-type-icon">{res.type === 'Book' ? '📕' : res.type === 'Report' ? '📄' : '📝'}</span>
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
                        <button className="btn-primary btn-sm" style={{flex: 1}}>Read Now</button>
                        <button className="action-btn">↓</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={res.id} className="resource-list-item animate-up" style={{animationDelay: `${i*0.05}s`}} onClick={() => setReadingResource(res)}>
                    <div className="list-icon" style={{background: i%2===0 ? '#e6f0f2' : '#f0f9f4'}}>
                      {res.type === 'Book' ? '📕' : res.type === 'Report' ? '📄' : '📝'}
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
    </div>
  );
};

export default Library;
