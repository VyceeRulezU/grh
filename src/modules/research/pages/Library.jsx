import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ResourceSchema } from '../../../services/api/schemas';
import { supabase } from '../../../services/supabase/supabaseClient';
import { RESOURCES as LEGACY_RESOURCES, BOOKS as LEGACY_BOOKS } from '../../../data/legacyData';
import CtaSection from '../../../shared/ui/CtaSection';
import Pagination from '../../../shared/ui/Pagination';
import PageHero from '../../../shared/ui/PageHero';
import { gsap } from 'gsap';
import { Flip } from 'gsap/all';
import { ScrollTrigger } from 'gsap/all';
import './Library.css';
import ResourceViewer from '../components/ResourceViewer';
import '../components/ResourceViewer.css';

const Library = () => {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedProgrammes, setSelectedProgrammes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedThematicAreas, setSelectedThematicAreas] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [readingResource, setReadingResource] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const heroRef = React.useRef(null);
  const { data: allResources = [], isLoading: loading, isSuccess } = useQuery({
    queryKey: ['library-resources'],
    queryFn: async () => {
      const [res, bks, prl] = await Promise.all([
        supabase.from('library_resources').select('*').eq('status', 'Published'),
        supabase.from('books').select('*').eq('status', 'Published'),
        supabase.from('perl_resources').select('*')
      ]);

      const DEFAULT_IMG = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80';
      const TYPE_IMAGES = {
        'PERL': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
        'SPARC': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80',
        'SLGP': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80',
      };

      const PROGRAMME_TYPES = ['PERL', 'SPARC', 'SLGP'];
      const mappedRes = (res.data || []).map(r => {
        const normalizedType = (r.type || 'PERL').toUpperCase();
        const programme = r.programme || (PROGRAMME_TYPES.includes(normalizedType) ? normalizedType : null);
        return {
          ...r,
          type: normalizedType,
          programme: programme,
          coverImage: TYPE_IMAGES[normalizedType] || DEFAULT_IMG,
          author: r.author || 'GRH',
          year: r.published_year || new Date(r.created_at || Date.now()).getFullYear(),
          file_url: r.file_url || r.file_url || '',
          description: r.description || ''
        };
      });

      const mappedBooks = (bks.data || []).map(b => ({
        ...b,
        type: "BOOK",
        author: b.author || "GRH Lib",
        year: b.published_year || new Date(b.created_at || Date.now()).getFullYear(),
        coverImage: b.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
        category: b.category || "Governance",
        programme: b.programme || null,
        location: b.location || 'Federal',
        thematic_area: b.thematic_area || 'Policy & Strategy',
        description: b.summary,
        file_url: b.file_url || ''
      }));

      const mappedPerl = (prl.data || []).map(p => ({
        ...p,
        type: "PERL",
        programme: "PERL",
        category: "Governance",
        author: "Google Drive Sync",
        year: new Date(p.created_at).getFullYear(),
        coverImage: TYPE_IMAGES['PERL'] || DEFAULT_IMG,
        file_url: p.preview_url || p.download_url || '',
        description: p.description || `Synced document: ${p.title}`
      }));

      try {
        const merged = [...mappedRes, ...mappedBooks, ...mappedPerl];
        const PROG_TYPES = ['PERL', 'SPARC', 'SLGP'];
        
        if (merged.length === 0) {
          return [
            ...LEGACY_RESOURCES.map(r => ({
              ...r,
              programme: PROG_TYPES.includes((r.type || '').toUpperCase()) ? r.type.toUpperCase() : null
            })),
            ...LEGACY_BOOKS.map(b => ({
              ...b,
              type: "BOOK",
              programme: null,
              author: "GRH Lib",
              year: 2024,
              coverImage: b.imageUrl,
              category: "Governance",
              description: b.summary
            }))
          ];
        }
        
        // Use safeParse or log individual rows to find the culprit
        return merged.map(item => {
          const result = ResourceSchema.safeParse(item);
          if (!result.success) {
            console.error("Resource Validation Failed for item:", item, result.error);
            // Return raw item if schema parsing fails to prevent blank page
            return item; 
          }
          return result.data;
        });
      } catch (err) {
        console.error("Critical Library Fetch Error:", err);
        return [];
      }
    }
  });
  const itemsPerPage = 6;
  const statsRef = React.useRef(null);
  const resultsRef = React.useRef(null);

  // Hero Animation
  useEffect(() => {
    if (heroRef.current) {
      const q = gsap.utils.selector(heroRef.current);
      gsap.fromTo(q('.hero-chip, .section-title, .hero-subline'), 
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          stagger: 0.2, 
          ease: 'power3.out',
          delay: 0.2 
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!isSuccess || !statsRef.current) return;
    
    const stats = statsRef.current.querySelectorAll('.stat-number');
    stats.forEach(stat => {
      const rawText = stat.innerText;
      const target = parseInt(rawText.replace(/[^0-9]/g, '')) || 0;
      const suffix = rawText.replace(/[0-9]/g, '');
      
      gsap.fromTo(stat, 
        { innerText: 0 },
        { 
          innerText: target,
          duration: 2,
          snap: { innerText: 1 },
          scrollTrigger: {
            trigger: stat,
            start: 'top 95%'
          },
          onComplete: () => {
            stat.innerText = target + suffix;
          }
        }
      );
    });
  }, [isSuccess]);

  const toggleType = (t) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const toggleCat = (c) => {
    setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const toggleProgramme = (p) => {
    setSelectedProgrammes(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const toggleLocation = (l) => {
    setSelectedLocations(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const toggleThematic = (t) => {
    setSelectedThematicAreas(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCats([]);
    setSelectedProgrammes([]);
    setSelectedLocations([]);
    setSelectedThematicAreas([]);
  };

  const filtered = allResources.filter(r => {
    const ms = (r.title || "").toLowerCase().includes(search.toLowerCase()) || 
               (r.description || "").toLowerCase().includes(search.toLowerCase());
    const mt = selectedTypes.length === 0 || selectedTypes.includes(r.type);
    const mc = selectedCats.length === 0 || selectedCats.includes(r.category);
    const mp = selectedProgrammes.length === 0 || selectedProgrammes.includes(r.programme);
    const ml = selectedLocations.length === 0 || selectedLocations.includes(r.location);
    const mta = selectedThematicAreas.length === 0 || selectedThematicAreas.includes(r.thematic_area);
    return ms && mt && mc && mp && ml && mta;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pagedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Flip Animation for View Mode
  React.useLayoutEffect(() => {
    if (!resultsRef.current) return;
    
    const state = Flip.getState('.resource-card, .resource-list-item');
    
    // The actual DOM change happens during re-render triggered by setViewMode
    // We just need to animate from the captured state
    Flip.from(state, {
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.02,
      onEnter: elements => gsap.fromTo(elements, {opacity: 0, scale: 0.9}, {opacity: 1, scale: 1, duration: 0.4}),
      onLeave: elements => gsap.to(elements, {opacity: 0, scale: 0.9, duration: 0.4})
    });
  }, [viewMode, pagedItems]);

  if (readingResource) {
    return (
      <div className="viewer-overlay">
        <div className="viewer-modal animate-in">
          <header className="viewer-header">
            <div className="viewer-header-left">
              <button className="viewer-mobile-back" onClick={() => setReadingResource(null)}>
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Back</span>
              </button>
              <div className="viewer-info">
                <span className="material-symbols-outlined viewer-icon">description</span>
                <div>
                  <h3>{readingResource.title}</h3>
                  <p>{readingResource.author} • {readingResource.year} • {readingResource.type}</p>
                </div>
              </div>
            </div>
            <div className="viewer-controls">
              <button className="control-btn" title="Zoom Out"><span className="material-symbols-outlined">zoom_out</span></button>
              <span style={{fontSize: '14px', fontWeight: 600}}>100%</span>
              <button className="control-btn" title="Zoom In"><span className="material-symbols-outlined">zoom_in</span></button>
              <button className="special-button" style={{padding: '0.5rem 1rem', fontSize: '0.8rem'}} onClick={() => { if (readingResource.file_url) window.open(readingResource.file_url, '_blank'); }}>Download PDF</button>
              <button className="viewer-close" onClick={() => setReadingResource(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </header>

          <main className="viewer-content">
            {readingResource.file_url ? (
              <iframe
                src={readingResource.file_url}
                title={readingResource.title}
                style={{ width: '100%', height: '100%', border: 'none', minHeight: '70vh' }}
              />
            ) : (
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
                <span style={{position: 'absolute', fontWeight: 800, color: 'var(--secondary)', opacity: 0.5}}>NO PDF UPLOADED</span>
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
            )}
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

      <PageHero
        chip="Digital e-Library"
        title={<>Curated <br /><span className="green-text">Governance Knowledge</span></>}
        subtitle="Explore our comprehensive library of professional resources, policy frameworks, and governance research curated for institutional excellence."
        counters={[
          { value: '20+', label: 'Years of Data' },
          { value: `${allResources.length}+`, label: 'Resources' },
        ]}
      />

      <div className="container research-content">

        <div className="research-layout">
          <aside className={`filter-sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-title">
              <h3>Filters</h3>
              {(selectedTypes.length > 0 || selectedCats.length > 0 || selectedProgrammes.length > 0 || selectedLocations.length > 0 || selectedThematicAreas.length > 0) && (
                <button className="clear-btn" onClick={clearFilters}>Clear All</button>
              )}
            </div>

            <div className="filter-group">
              <div className="filter-group-title">PROGRAMME</div>
              {["SLGP", "SPARC", "PERL"].map(p => (
                <label key={p} className="filter-check">
                  <input type="checkbox" checked={selectedProgrammes.includes(p)} onChange={() => toggleProgramme(p)} />
                  <span>{p}</span>
                  <span className="filter-count">{allResources.filter(r => r.programme === p).length}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-group-title">LOCATION</div>
              {["Kano", "Kaduna", "Jigawa", "Federal", "General"].map(l => (
                <label key={l} className="filter-check">
                  <input type="checkbox" checked={selectedLocations.includes(l)} onChange={() => toggleLocation(l)} />
                  <span>{l}</span>
                  <span className="filter-count">{allResources.filter(r => r.location === l).length}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-group-title">THEMATIC AREAS</div>
              {[
                "Public Financial Management", 
                "Public Service Management", 
                "Policy & Strategy", 
                "Monitoring, Evaluation & Learning", 
                "Knowledge Management"
              ].map(t => (
                <label key={t} className="filter-check">
                  <input type="checkbox" checked={selectedThematicAreas.includes(t)} onChange={() => toggleThematic(t)} />
                  <span>{t}</span>
                  <span className="filter-count">{allResources.filter(r => r.thematic_area === t).length}</span>
                </label>
              ))}
            </div>
            
            <button className="mobile-close-sidebar" onClick={() => setIsSidebarOpen(false)}>Apply Filters</button>
          </aside>

          <div className="research-results">
            <div className="results-header">
              <div className="mobile-filter-bar">
                <button className="mobile-filter-toggle" onClick={() => setIsSidebarOpen(true)}>
                  <span className="material-symbols-outlined">filter_list</span>
                  <span>Filters</span>
                </button>
                <span className="results-count-text">{filtered.length} found</span>
              </div>
              <div className="desktop-results-meta">
                <span className="results-count-text">Found {filtered.length} resources</span>
              </div>
              <div className="learn-hero-search">
                <span className="material-symbols-outlined search-icon">search</span>
                <input 
                  placeholder="Search by title, author, or keyword..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
              <div className="view-toggle">
                <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>⊞</button>
                <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>≡</button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'resources-grid' : 'resources-list'} ref={resultsRef}>
              {pagedItems.map((res, i) => (
                viewMode === 'grid' ? (
                  <div key={res.id} className="resource-card" onClick={() => setReadingResource(res)}>
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
                  <div key={res.id} className="resource-list-item" onClick={() => setReadingResource(res)}>
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
                        <button className="special-button" style={{flex: 1}}>Read Now</button>
                      </div>
                    </div>
                  </div>
                )
              ))}

              {/* Empty Placeholders */}
              {viewMode === 'grid' && [...Array(Math.max(0, 6 - pagedItems.length))].map((_, idx) => (
                <div key={`empty-${idx}`} className="resource-card empty-placeholder">
                  <div className="placeholder-cover">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="resource-body">
                    <div className="shimmer-line title"></div>
                    <div className="shimmer-line desc"></div>
                    <div className="shimmer-line desc short"></div>
                    <div className="placeholder-footer-text">Archived Resource</div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

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
        />

        <ResourceViewer 
          isOpen={!!readingResource} 
          onClose={() => setReadingResource(null)} 
          resource={readingResource} 
        />
    </div>
  );
};

export default Library;
