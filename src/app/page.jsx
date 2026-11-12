"use client";
import { useState, useEffect } from 'react';

const TYPES = [
  { key: 'mancare', label: 'Mâncare' },
  { key: 'bar', label: 'Bar' },
  { key: 'vinuri', label: 'Vinuri' },
];

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

export default function DigitalMenu() {
  const [data, setData] = useState({ categories: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [activeType, setActiveType] = useState('mancare');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = fetch('/api/meniu').then((res) => res.json());
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 700));

    Promise.all([fetchData, minLoadingTime])
      .then(([serverData]) => {
        if (!serverData.error) {
          const sortedCategories = (serverData.categorii || []).sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
          const sortedProducts = (serverData.produse || []).sort((a, b) => (a.ordine || 0) - (b.ordine || 0));

          setData({
            categories: sortedCategories,
            products: sortedProducts
          });
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
      timer = setTimeout(() => {
        setExpandedProductId(null);
      }, 20000);
    }

    return () => clearTimeout(timer);
  }, [expandedProductId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo-loader">
          <img src="photos/header/logo.png" alt="Loading..." className="logo-image" />
        </div>
      </div>
    );
  }

  const filteredCategories = data.categories.filter(cat => {
    const dbType = cat.tip ? cat.tip.toLowerCase().trim() : '';
    return dbType === activeType;
  });

  const canExpand = activeType === 'mancare';

  const toggleProduct = (id) => {
    if (!canExpand) return;
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  const openCategory = (cat) => {
    setSelectedCategory(cat);
    window.scrollTo({ top: 0 });
  };

  const closeCategory = () => {
    setSelectedCategory(null);
    setExpandedProductId(null);
  };

  const filteredProducts = selectedCategory
    ? data.products.filter(p => p.categorie_id === selectedCategory.id)
    : [];

  const countFor = (catId) => data.products.filter(p => p.categorie_id === catId).length;

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
              <a href="https://www.facebook.com/taverna.lazavat" target="_blank" rel="noopener noreferrer">
                <img src="photos/header/facebook.png" alt="Facebook" className="social-icon" />
              </a>
              <a href="https://www.instagram.com/la_zavat/" target="_blank" rel="noopener noreferrer">
                <img src="photos/header/instagram.png" alt="Instagram" className="social-icon" />
              </a>
              <a href="https://www.tiktok.com/@tavernalazavat" target="_blank" rel="noopener noreferrer">
                <img src="photos/header/tiktok.png" alt="TikTok" className="social-icon" />
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
            >
              <img src="photos/header/maps.png" alt="Locatie Taverna La Zavat" />
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
                >
                  {type.label}
                </button>
              ))}
            </div>
          </nav>
        )}

        <div className="content-zone">
          {!selectedCategory ? (
            <div className="categories-grid" key={activeType}>
              {filteredCategories.map((cat, i) => (
                <button
                  key={cat.id}
                  className="category-card"
                  style={{ '--d': `${i * 45}ms` }}
                  onClick={() => openCategory(cat)}
                >
                  <img
                    src={`photos/categorii/${(cat.imagine_url || '').trim()}`}
                    alt=""
                    loading={i > 3 ? 'lazy' : 'eager'}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="overlay-text">
                    <h2>{cat.nume.trim()}</h2>
                    <span className="category-count">{countFor(cat.id)} produse</span>
                  </div>
                  <span className="category-go" aria-hidden="true">›</span>
                </button>
              ))}
              {filteredCategories.length === 0 && (
                <p className="empty-message">Nu există categorii aici momentan.</p>
              )}
            </div>
          ) : (
            <div className="products-list">
              <div className="sticky-category-header">
                <button className="back-btn" onClick={closeCategory} aria-label="Înapoi">
                  <img src="photos/header/backBtn.webp" alt="" />
                </button>
                <h2>{selectedCategory.nume.trim()}</h2>
                <span className="header-spacer" />
              </div>

              {filteredProducts.map((product, i) => {
                const isExpanded = expandedProductId === product.id;
                const nutrition = parseNutrition(product.declaratie_nutritionala);

                return (
                  <div
                    key={product.id}
                    className={`product-card ${isExpanded ? 'expanded' : ''} ${canExpand ? 'expandable' : ''}`}
                    style={{ '--d': `${Math.min(i, 8) * 40}ms` }}
                    onClick={() => toggleProduct(product.id)}
                  >
                    {product.imagine_url && (
                      <div className="product-img-wrapper">
                        <img
                          src={`photos/produse/${product.imagine_url.trim()}`}
                          alt={product.nume}
                          loading={i > 1 ? 'lazy' : 'eager'}
                        />
                        {product.gramaj > 0 && (
                          <span className="weight-chip">
                            {product.gramaj} {selectedCategory.tip === 'Mancare' ? 'g' : 'ml'}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="product-info">
                      <div className="product-title-price">
                        <h3>{product.nume}</h3>
                        <span className="price">{Math.floor(product.pret)} <small>lei</small></span>
                      </div>

                      {product.ingrediente && (
                        <p className="ingredients">{product.ingrediente}</p>
                      )}

                      {!product.imagine_url && product.gramaj > 0 && (
                        <span className="weight">
                          {product.gramaj} {selectedCategory.tip === 'Mancare' ? 'g' : 'ml'}
                        </span>
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
          )}
        </div>
      </main>
    </div>
  );
}
