"use client";
import { useState, useEffect } from 'react';

export default function DigitalMenu() {
  const [data, setData] = useState({ categories: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [activeType, setActiveType] = useState('mancare');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = fetch('/api/meniu').then((res) => res.json());
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));

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
          <div className="logo-fill"></div>
          <img src="photos/header/logo.png" alt="Loading..." className="logo-image" />
        </div>
      </div>
    );
  }

  const filteredCategories = data.categories.filter(cat => {
    const dbType = cat.tip ? cat.tip.toLowerCase().trim() : '';
    const selectedType = activeType.toLowerCase().trim();
    return dbType === selectedType;
  });


  const canExpand = activeType === 'mancare';

  const toggleProduct = (id) => {
    if (!canExpand) return;

    if (expandedProductId === id) {
      setExpandedProductId(null);
    } else {
      setExpandedProductId(id);
    }
  };

  const filteredProducts = selectedCategory
    ? data.products.filter(p => p.categorie_id === selectedCategory.id)
    : [];

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
              <img src="photos/header/phone.png" alt="Phone" />
              <p>12:00 - 22:00</p>
            </div>
            <div className="contact-info">
              <img src="photos/header/clock.png" alt="Clock" />
              <p>+40 766 526 791</p>
            </div>
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
            {['mancare', 'bar', 'vinuri'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={activeType === type ? 'type-btn active' : 'type-btn'}
              >
                {type}
              </button>
            ))}
          </nav>
        )}

        <div className="content-zone">
          {!selectedCategory ? (
            <div className="categories-grid">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="category-card" onClick={() => setSelectedCategory(cat)}>
                  <img
                    src={`photos/categorii/${cat.imagine_url}`}
                    alt={cat.nume}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <div className="overlay-text">
                    <h2>{cat.nume}</h2>
                  </div>
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <p className="empty-message">No categories found for {activeType}.</p>
              )}
            </div>
          ) : (
            <div className="products-list">
              <div className="sticky-category-header">
                <button className="back-btn" onClick={() => { setSelectedCategory(null); setExpandedProductId(null); }}>
                  <img src="photos/header/backBtn.webp" alt="Back Button" />
                </button>
                <h2>{selectedCategory.nume}</h2>
              </div>

              {filteredProducts.map((product) => {
                const isExpanded = expandedProductId === product.id;

                return (
                  <div
                    key={product.id}
                    className={`product-card ${isExpanded ? 'expanded' : ''} ${canExpand ? 'expandable' : ''}`}
                    onClick={() => toggleProduct(product.id)}
                    style={{ cursor: canExpand ? 'pointer' : 'default' }}
                  >
                    {product.imagine_url && (
                      <div className="product-img-wrapper">
                        <img src={`photos/produse/${product.imagine_url}`} alt={product.nume} />
                      </div>
                    )}
                    <div className="product-info">
                      <div className="product-title-price">
                        <h3>{product.nume}</h3>
                        <span className="price">{Math.floor(product.pret)} <small>lei</small></span>
                      </div>

                      <p className="ingredients">
                        {product.ingrediente ? product.ingrediente : "\u00A0"}
                      </p>

                      {product.gramaj > 0 && (
                        <span className="weight">
                          {product.gramaj} {selectedCategory.tip === 'Mancare' ? 'g' : 'ml'}
                        </span>
                      )}

                      {isExpanded && canExpand && (
                        <div className="nutritional-info">
                          <p>
                            <strong>DECLARAȚIE NUTRIȚIONALĂ / 100 G:</strong> <br />
                            {product.declaratie_nutritionala || "Informatie indisponibila"}
                          </p>
                          {product.alergeni && (
                            <p className="allergens">
                              <span style={{ color: '#d9534f', fontWeight: 'bold' }}>!</span> Alergeni: {product.alergeni}
                            </p>
                          )}
                        </div>
                      )}

                      {canExpand && (
                        <div className="expand-arrow">
                          {isExpanded ? '⌃' : '⌄'}
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