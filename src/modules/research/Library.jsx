import React, { useState } from 'react';
import './Library.css';
import Button from '../../components/ui/Button';

const RESOURCES = [
  { id: 1, title: "Public Financial Management Framework", type: "Report", category: "Finance", author: "World Bank", year: 2023, pages: 124, icon: "ri-file-text-line" },
  { id: 2, title: "UNCAC Implementation Guide", type: "Book", category: "Integrity", author: "United Nations", year: 2022, pages: 310, icon: "ri-book-3-line" },
  { id: 3, title: "Principles of Good Governance", type: "Article", category: "Governance", author: "OECD", year: 2024, pages: 12, icon: "ri-article-line" },
  { id: 4, title: "Digital Governance Roadmap", type: "Report", category: "Digital", author: "GovHub Research", year: 2024, pages: 85, icon: "ri-computer-line" },
  { id: 5, title: "Anti-Corruption Scoping Study", type: "Report", category: "Integrity", author: "Transparency Int.", year: 2023, pages: 45, icon: "ri-shield-line" },
  { id: 6, title: "Electoral Integrity Handbook", type: "Book", category: "Democracy", author: "Global Policy Inst.", year: 2021, pages: 215, icon: "ri-input-method-line" },
];

const Library = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedResource, setSelectedResource] = useState(null);

  const filtered = RESOURCES.filter(r => 
    (filterType === "All" || r.type === filterType) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) || r.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="library-v2">
      {selectedResource && (
        <div className="library-reader-modal glass">
          <div className="reader-content-v2 animate-up">
            <header className="reader-header-v2">
              <div className="reader-info">
                <h3>{selectedResource.title}</h3>
                <span>{selectedResource.author} · {selectedResource.year}</span>
              </div>
              <button className="reader-close" onClick={() => setSelectedResource(null)}><i className="ri-close-line"></i></button>
            </header>
            <div className="reader-viewport">
              <div className="doc-overlay">
                <i className={`${selectedResource.icon} large-doc-icon`}></i>
                <p>Viewing Page 1 of {selectedResource.pages}</p>
                <div className="dummy-page-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line" style={{ width: '80%' }}></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
            <footer className="reader-footer-v2">
              <div className="reader-controls">
                <Button variant="outline" size="sm">Previous</Button>
                <span>Page 1 / {selectedResource.pages}</span>
                <Button variant="outline" size="sm">Next</Button>
              </div>
              <Button variant="primary" size="sm"><i className="ri-download-line"></i> Download PDF</Button>
            </footer>
          </div>
        </div>
      )}
      <header className="library-hero-v2">
        <div className="container">
          <span className="hero-tag-v2">Digital E-Library</span>
          <h1>Governance Research Hub <span className="text-gradient">Library</span></h1>
          <p>Explore a curated collection of governance frameworks, reports, and academic resources.</p>
          
          <div className="search-box-v2 glass">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by title, author, or keyword..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="container library-content-v2 section-padding">
        <div className="library-layout-v2">
          <aside className="library-filters-v2">
            <h3>Filters</h3>
            <div className="filter-group-v2">
              <label>Resource Type</label>
              {["All", "Book", "Report", "Article"].map(type => (
                <button 
                  key={type} 
                  className={`filter-btn-v2 ${filterType === type ? 'active' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            
            <div className="filter-group-v2">
              <label>Categories</label>
              {["Governance", "Finance", "Integrity", "Democracy", "Digital"].map(cat => (
                <div key={cat} className="filter-checkbox-v2">
                  <input type="checkbox" id={cat} />
                  <label htmlFor={cat}>{cat}</label>
                </div>
              ))}
            </div>
          </aside>

          <div className="library-results-v2">
            <div className="results-info-v2">
              <span>Showing {filtered.length} resources</span>
              <div className="view-mode-v2">
                <button className="active">Grid</button>
                <button>List</button>
              </div>
            </div>

            <div className="resources-grid-v2">
              {filtered.map(r => (
                <div key={r.id} className="resource-card-v2 subtle-shadow animate-in">
                  <div className="resource-thumb-v2">
                    <i className={`${r.icon} resource-icon-v2`}></i>
                    <span className="resource-type-v2">{r.type}</span>
                  </div>
                  <div className="resource-body-v2">
                    <span className="resource-cat-v2">{r.category}</span>
                    <h3>{r.title}</h3>
                    <p className="resource-meta-v2">{r.author} · {r.year}</p>
                    <div className="resource-actions-v2">
                      <Button variant="primary" size="sm" fullWidth onClick={() => setSelectedResource(r)}>Read Online</Button>
                      <Button variant="outline" size="sm"><i className="ri-download-line"></i></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filtered.length === 0 && (
              <div className="empty-state-v2">
                <i className="ri-search-eye-line empty-icon-v2"></i>
                <h3>No resources found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Library;
