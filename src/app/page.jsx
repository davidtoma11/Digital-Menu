"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import PLACEHOLDERS from '@/lib/placeholders.json';

const TYPES = [
  { key: 'mancare', label: 'Mâncare' },
  { key: 'bar', label: 'Bar' },
  { key: 'vinuri', label: 'Vinuri' },
];

const PLACEHOLDER_SET = new Set(PLACEHOLDERS);
const realPhoto = (url) => {
  const file = (url || '').trim();
  return file && !PLACEHOLDER_SET.has(file) ? file : null;
};

// "Energie: 120kcal, Grasimi: 3g, ..." -> [['Energie','120kcal'], ...]
function parseNutrition(str) {
  if (!str) return [];
  return str
    .split(',')
    .map((part) => part.split(':').map((s) => s.trim()))
    .filter(([k, v]) => k && v);
}

function Chevron({ open }) {
  return (
    <svg className={`chevron ${open ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Imagine care apare lin când s-a încărcat (fără „pop”) și dispare curat dacă lipsește.
function FadeImg({ src, alt = '', eager = false, className = '' }) {
  const [state, setState] = useState('loading');
  const ref = useCallback((node) => {
    if (node && node.complete && node.naturalWidth) setState('loaded');
  }, []);
  if (state === 'error') return null;
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`fade-img ${state === 'loaded' ? 'is-loaded' : ''} ${className}`}
      onLoad={() => setState('loaded')}
      onError={() => setState('error')}
    />
  );
}

export default function DigitalMenu() {
  const [data, setData] = useState({ categories: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [activeType, setActiveType] = useState('mancare');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const listScroll = useRef(0);
  const chipsRef = useRef(null);

  useEffect(() => {
    const fetchData = fetch('/api/meniu').then((res) => res.json());
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 350));

    Promise.all([fetchData, minLoadingTime])
      .then(([serverData]) => {
        if (!serverData.error) {
          const sortedCategories = (serverData.categorii || []).sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
          const sortedProducts = (serverData.produse || []).sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
          setData({ categories: sortedCategories, products: sortedProducts });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let timer;
    if (expandedProductId) {
      timer = setTimeout(() => setExpandedProductId(null), 20000);
    }
    return () => clearTimeout(timer);
  }, [expandedProductId]);

  // Butonul „înapoi” al telefonului închide categoria în loc să părăsească meniul.
  useEffect(() => {
    const onPop = () => {
      setSelectedCategory(null);
      setExpandedProductId(null);
      requestAnimationFrame(() => window.scrollTo({ top: listScroll.current }));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Ține categoria activă vizibilă în bara de categorii.
  useEffect(() => {
    const active = chipsRef.current?.querySelector('.chip.active');
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo-loader">
          <img src="photos/header/logo.png" alt="Se încarcă meniul" className="logo-image" />
        </div>
      </div>
    );
  }

  const typeOf = (cat) => (cat.tip ? cat.tip.toLowerCase().trim() : '');
  const filteredCategories = data.categories.filter(cat => typeOf(cat) === activeType);
  const canExpand = activeType === 'mancare';

  const toggleProduct = (id) => {
    if (!canExpand) return;
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  const openCategory = (cat) => {
    if (!selectedCategory) {
      listScroll.current = window.scrollY;
      window.history.pushState({ category: cat.id }, '');
    } else {
      window.history.replaceState({ category: cat.id }, '');
    }
    setSelectedCategory(cat);
    setExpandedProductId(null);
    window.scrollTo({ top: 0 });
  };

  const closeCategory = () => {
    if (window.history.state?.category) {
      window.history.back(); // declanșează popstate -> închide categoria
    } else {
      setSelectedCategory(null);
      setExpandedProductId(null);
    }
  };

  const filteredProducts = selectedCategory
    ? data.products.filter(p => p.categorie_id === selectedCategory.id)
    : [];

  const siblingCategories = selectedCategory
    ? data.categories.filter(c => typeOf(c) === typeOf(selectedCategory))
    : [];

  const unitFor = (cat) => (cat.tip === 'Mancare' ? 'g' : 'ml');

  return (
    <div className="desktop-wrapper">
      <main className="mobile-container">
        <div className="cover-photo"></div>
        <header className="header-grid">
          <div className="grid-logo">
            <img src="photos/header/logo.png" alt="Taverna La Zavat Logo" />
          </div>
          <div className="grid-name">
            <h1>Taverna La Zavat</h1>
          </div>
          <div className="grid-details">
            <div className='socialMedia'>
              <a href="https://www.facebook.com/taverna.lazavat" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <img src="photos/header/facebook.png" alt="" className="social-icon" />
              </a>
              <a href="https://www.instagram.com/la_zavat/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <img src="photos/header/instagram.png" alt="" className="social-icon" />
              </a>
              <a href="https://www.tiktok.com/@tavernalazavat" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <img src="photos/header/tiktok.png" alt="" className="social-icon" />
              </a>
            </div>
            <div className="contact-info">
              <img src="photos/header/clock.png" alt="Program" />
              <p>12:00 - 22:00</p>
            </div>
            <a className="contact-info" href="tel:+40766526791">
              <img src="photos/header/phone.png" alt="Telefon" />
              <p>+40 766 526 791</p>
            </a>
            <div className="contact-info">
              <img src="photos/header/wifi.png" alt="WiFi" />
              <p>caracatita</p>
            </div>
          </div>
          <div className="grid-map">
            <a
              href="https://www.google.com/maps/place/La+Zavat/@44.438217,26.1218274,17.25z/data=!4m6!3m5!1s0x40b1ff2e132cb559:0xd32fd1b99cffd568!8m2!3d44.4379606!4d26.1233078!16s%2Fg%2F1hc4v9zc_?entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3M0gBUAM%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
              aria-label="Deschide locația în Google Maps"
            >
              <img src="photos/header/maps.png" alt="" />
            </a>
          </div>
        </header>

        {!selectedCategory && (
          <nav className="nav-types">
            <div className="nav-types-track" style={{ '--i': TYPES.findIndex(t => t.key === activeType) }}>
              <span className="nav-types-pill" aria-hidden="true" />
              {TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setActiveType(type.key)}
                  className={activeType === type.key ? 'type-btn active' : 'type-btn'}
                  aria-pressed={activeType === type.key}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </nav>
        )}

        <div className="content-zone">
          {!selectedCategory ? (
            <div className="categories-grid view-enter" key={activeType}>
              {filteredCategories.map((cat, i) => (
                <button
                  key={cat.id}
                  className="category-card"
                  style={{ '--d': `${Math.min(i, 6) * 50}ms` }}
                  onClick={() => openCategory(cat)}
                >
                  <FadeImg src={`photos/categorii/${(cat.imagine_url || '').trim()}`} eager={i < 4} />
                  <div className="overlay-text">
                    <h2>{cat.nume.trim()}</h2>
                  </div>
                  <span className="category-go" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </button>
              ))}
              {filteredCategories.length === 0 && (
                <p className="empty-message">Nu există categorii aici momentan.</p>
              )}
            </div>
          ) : (
            <div className="products-list">
              <div className="sticky-category-header">
                <div className="sticky-bar">
                  <button className="back-btn" onClick={closeCategory} aria-label="Înapoi la categorii">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <h2>{selectedCategory.nume.trim()}</h2>
                  <span className="header-spacer" />
                </div>
                {siblingCategories.length > 1 && (
                  <div className="chips" ref={chipsRef}>
                    {siblingCategories.map((c) => (
                      <button
                        key={c.id}
                        className={`chip ${c.id === selectedCategory.id ? 'active' : ''}`}
                        onClick={() => c.id !== selectedCategory.id && openCategory(c)}
                      >
                        {c.nume.trim()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="view-enter" key={selectedCategory.id}>
                {filteredProducts.map((product, i) => {
                  const isExpanded = expandedProductId === product.id;
                  const nutrition = parseNutrition(product.declaratie_nutritionala);
                  const photo = realPhoto(product.imagine_url);
                  const weight = product.gramaj > 0 ? `${product.gramaj} ${unitFor(selectedCategory)}` : null;

                  return (
                    <div
                      key={product.id}
                      className={`product-card ${isExpanded ? 'expanded' : ''} ${canExpand ? 'expandable' : ''} ${photo ? '' : 'no-photo'}`}
                      style={{ '--d': `${Math.min(i, 6) * 40}ms` }}
                      onClick={() => toggleProduct(product.id)}
                      role={canExpand ? 'button' : undefined}
                      tabIndex={canExpand ? 0 : undefined}
                      aria-expanded={canExpand ? isExpanded : undefined}
                      onKeyDown={(e) => { if (canExpand && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleProduct(product.id); } }}
                    >
                      {photo && (
                        <div className="product-img-wrapper">
                          <FadeImg src={`photos/produse/${photo}`} alt={product.nume} eager={i < 2} />
                          {weight && <span className="weight-chip">{weight}</span>}
                        </div>
                      )}
                      <div className="product-info">
                        <div className="product-title-price">
                          <h3>{product.nume}</h3>
                          <span className="price">{Math.floor(product.pret)} <small>lei</small></span>
                        </div>

                        {(product.ingrediente || (!photo && weight)) && (
                          <p className="ingredients">
                            {!photo && weight && <span className="weight-inline">{weight}</span>}
                            {product.ingrediente}
                          </p>
                        )}

                        {canExpand && (
                          <div className={`nutritional-wrap ${isExpanded ? 'open' : ''}`}>
                            <div className="nutritional-info">
                              <strong>Declarație nutrițională / 100 g</strong>
                              {nutrition.length > 0 ? (
                                <dl className="nutrition-grid">
                                  {nutrition.map(([k, v]) => (
                                    <div key={k}>
                                      <dt>{k}</dt>
                                      <dd>{v}</dd>
                                    </div>
                                  ))}
                                </dl>
                              ) : (
                                <p className="nutrition-empty">Informație indisponibilă</p>
                              )}
                              {product.alergeni && (
                                <p className="allergens">
                                  <b>!</b> Alergeni: {product.alergeni}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {canExpand && (
                          <div className="expand-arrow">
                            <span>{isExpanded ? 'Ascunde' : 'Valori nutriționale'}</span>
                            <Chevron open={isExpanded} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
