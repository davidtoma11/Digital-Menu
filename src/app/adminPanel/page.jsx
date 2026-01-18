"use client";
import React, { useState, useRef } from 'react';
import './admin.css';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, item, type, onSave, onDelete, onUploadImage }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [localData, setLocalData] = useState({ ...item });
  const [isDragOver, setIsDragOver] = useState(false);
  const [imgTimestamp, setImgTimestamp] = useState(Date.now());
  
  const fileInputRef = useRef(null);

  const handleChange = (field, val) => {
    setLocalData(prev => ({ ...prev, [field]: val }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSave(localData.id, localData);
    }
  };

  const handleFileProcess = async (file) => {
    if (file && localData.imagine_url) {
      await onUploadImage(file, localData.imagine_url, type);
      setImgTimestamp(Date.now());
    } else {
      alert("Seteaza mai intai numele fisierului in baza de date (imagine_url)!");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileProcess(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileProcess(file);
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-item">
      <div {...attributes} {...listeners} className="drag-handle" title="Trage pentru a muta">
        ☰
      </div>

      <div 
        className={`image-dropzone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        style={{cursor: 'pointer'}}
        title="Click sau Drag & Drop pentru upload"
      >
        <img 
          src={`/photos/${type}/${localData.imagine_url}?t=${imgTimestamp}`} 
          alt="img" 
          onError={(e) => e.target.style.display = 'none'}
        />
        <div className="drop-overlay">UPLOAD IMG</div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{display: 'none'}} 
        accept="image/*"
        onChange={handleFileSelect}
      />

      <div className="item-inputs">
        <div className="input-group">
           <label>Nume</label>
           <input 
             className="custom-input" 
             value={localData.nume || ''} 
             onChange={e => handleChange('nume', e.target.value)} 
             onKeyDown={handleKeyDown}
           />
        </div>

        <div className="input-group">
           <label>Fisier Poza</label>
           <input 
             className="custom-input" 
             value={localData.imagine_url || ''} 
             onChange={e => handleChange('imagine_url', e.target.value)} 
             onKeyDown={handleKeyDown}
           />
        </div>

        {type === 'produse' && (
          <>
            <div className="input-group">
                <label>Ingrediente</label>
                <input 
                className="custom-input" 
                value={localData.ingrediente || ''} 
                onChange={e => handleChange('ingrediente', e.target.value)} 
                onKeyDown={handleKeyDown}
                />
            </div>

            <div className="input-group">
                <label>Gramaj</label>
                <input 
                className="custom-input" 
                value={localData.gramaj || ''} 
                onChange={e => handleChange('gramaj', e.target.value)} 
                onKeyDown={handleKeyDown}
                />
            </div>

            <div className="input-group">
                <label>Pret</label>
                <input 
                type="number"
                className="custom-input" 
                value={localData.pret || ''} 
                onChange={e => handleChange('pret', e.target.value)} 
                onKeyDown={handleKeyDown}
                />
            </div>

            <div className="input-group">
                <label>Alergeni</label>
                <input 
                className="custom-input" 
                value={localData.alergeni || ''} 
                onChange={e => handleChange('alergeni', e.target.value)} 
                onKeyDown={handleKeyDown}
                />
            </div>

            <div className="input-group">
                <label>Decl. Nutritionala</label>
                <input 
                className="custom-input" 
                value={localData.declaratie_nutritionala || ''} 
                onChange={e => handleChange('declaratie_nutritionala', e.target.value)} 
                onKeyDown={handleKeyDown}
                />
            </div>
          </>
        )}
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
        <button 
          onClick={() => onSave(localData.id, localData)}
          className="btn btn-primary"
          style={{fontSize: '0.8rem', padding: '5px'}}
        >
          SAVE
        </button>
        <button 
          onClick={() => onDelete(localData.id)}
          className="btn"
          style={{background: '#cf3838', color: 'white', fontSize: '0.8rem', padding: '5px'}}
        >
          STERGE
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [activeTab, setActiveTab] = useState('categorii'); 
  const [activeCatType, setActiveCatType] = useState('mancare');
  const [selectedCatId, setSelectedCatId] = useState(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = () => {
    fetch('/api/meniu')
      .then(res => res.json())
      .then(data => {
        const sCats = (data.categorii || []).sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
        const sProds = (data.produse || []).sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
        setCategories(sCats);
        setProducts(sProds);
      });
  };

  const handleLogin = () => {
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert("Parola gresita");
    }
  };

  const handleSave = async (id, updatedItem, table) => {
    const res = await fetch('/api/admin/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: table,
        id: id,
        data: updatedItem,
        password: password 
      })
    });
    if(!res.ok) alert("Eroare la salvare.");
  };

  const handleDelete = async (id, table) => {
    if (!confirm("Esti sigur ca vrei sa STERGI definitiv acest element?")) return;

    const res = await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: table,
        id: id,
        password: password 
      })
    });

    if (res.ok) {
      if (table === 'categorii') {
        setCategories(prev => prev.filter(item => item.id !== id));
      } else {
        setProducts(prev => prev.filter(item => item.id !== id));
      }
    } else {
      alert("Eroare la stergere.");
    }
  };

  const handleCreate = async () => {
    let payload = { ...newItem };
    const table = activeTab;

    if (table === 'produse') {
      if (!selectedCatId) return alert("Selecteaza o categorie mai intai!");
      payload.categorie_id = selectedCatId;
      payload.ordine = products.length + 1;
    } else {
      payload.tip = activeCatType; 
      payload.ordine = categories.length + 1;
    }

    const res = await fetch('/api/admin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: table,
        data: payload,
        password: password // Trimitem parola din state
      })
    });

    if (res.ok) {
      setIsAdding(false);
      setNewItem({});
      fetchData();
    } else {
      alert("Eroare la creare.");
    }
  };

  const handleNewItemKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  const handleUploadImage = async (file, dbFileName, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('fileName', dbFileName);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    });

    if(!res.ok) alert("Eroare upload.");
  };

  const handleReorder = async (event, fullList, setFullList, table, filteredList) => {
     const { active, over } = event;
     if (!over || active.id === over.id) return;

     const oldIndex = filteredList.findIndex(item => item.id === active.id);
     const newIndex = filteredList.findIndex(item => item.id === over.id);
     
     const newSubList = arrayMove(filteredList, oldIndex, newIndex);
     
     const reorderPayload = newSubList.map((item, index) => ({
       id: item.id,
       ordine: index
     }));

     const newFullList = fullList.map(item => {
       const movedItem = reorderPayload.find(x => x.id === item.id);
       if (movedItem) {
         return { ...item, ordine: movedItem.ordine };
       }
       return item;
     });

     newFullList.sort((a, b) => (a.ordine || 0) - (b.ordine || 0));
     
     setFullList(newFullList);

     try {
       await fetch('/api/admin/reorder', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ items: reorderPayload, table: table })
       });
     } catch (err) {
       console.error(err);
     }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Admin Zavat</h1>
          <input 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            className="custom-input"
            style={{marginBottom: '20px', textAlign: 'center'}}
            placeholder="Introduce Parola"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="btn btn-primary" style={{width: '100%'}}>INTRA</button>
        </div>
      </div>
    );
  }

  const filteredCategories = categories.filter(c => {
      const tip = c.tip ? c.tip.toLowerCase().trim() : 'mancare';
      return tip === activeCatType;
  });

  const filteredProducts = selectedCatId 
    ? products.filter(p => p.categorie_id === selectedCatId)
    : [];

  return (
    <div className="admin-wrapper">
      
      <div className="header-bar">
        <h1>Panou Administrare</h1>
        <div className="tabs-container">
           <button 
             onClick={() => { setActiveTab('categorii'); setIsAdding(false); }}
             className={`btn ${activeTab==='categorii' ? 'btn-active' : 'btn-secondary'}`}
           >
             Categorii
           </button>
           <button 
             onClick={() => { setActiveTab('produse'); setIsAdding(false); }}
             className={`btn ${activeTab==='produse' ? 'btn-active' : 'btn-secondary'}`}
           >
             Produse
           </button>
        </div>
      </div>

      {activeTab === 'categorii' && (
        <>
          <div className="filter-section" style={{justifyContent: 'center', gap: '10px'}}>
             {['mancare', 'bar', 'vinuri'].map(type => (
                <button
                  key={type}
                  onClick={() => setActiveCatType(type)}
                  className={`btn ${activeCatType === type ? 'btn-outline' : 'btn-secondary'}`}
                  style={activeCatType === type ? {background: '#876545', color: 'white'} : {}}
                >
                  {type.toUpperCase()}
                </button>
             ))}
          </div>

          <button 
            className="btn btn-outline" 
            style={{marginBottom: '20px', width: '100%'}}
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? "X ANULEAZA" : `+ ADAUGA CATEGORIE (${activeCatType.toUpperCase()})`}
          </button>

          {isAdding && (
            <div className="sortable-item" style={{border: '2px dashed #876545'}}>
              <div>NEW</div>
              <div className="image-dropzone"></div>
              <div className="item-inputs">
                <div className="input-group">
                   <label>Nume Categorie</label>
                   <input className="custom-input" onChange={e => setNewItem({...newItem, nume: e.target.value})} onKeyDown={handleNewItemKeyDown} />
                </div>
                <div className="input-group">
                   <label>Fisier Poza (ex: paste.jpg)</label>
                   <input className="custom-input" onChange={e => setNewItem({...newItem, imagine_url: e.target.value})} onKeyDown={handleNewItemKeyDown} />
                </div>
                <div className="input-group">
                   <label>Tip</label>
                   <input className="custom-input" value={activeCatType} disabled style={{opacity: 0.5}} />
                </div>
              </div>
              <button onClick={handleCreate} className="btn btn-primary">CREAZA</button>
            </div>
          )}

          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleReorder(e, categories, setCategories, 'categorii', filteredCategories)}
          >
            <SortableContext 
              items={filteredCategories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredCategories.map((cat) => (
                <SortableItem 
                  key={cat.id} 
                  id={cat.id} 
                  item={cat} 
                  type="categorii" 
                  onSave={(id, data) => handleSave(id, data, 'categorii')}
                  onDelete={(id) => handleDelete(id, 'categorii')}
                  onUploadImage={handleUploadImage}
                />
              ))}
              {filteredCategories.length === 0 && <p style={{textAlign:'center', color:'#666'}}>Nicio categorie in sectiunea {activeCatType}.</p>}
            </SortableContext>
          </DndContext>
        </>
      )}

      {activeTab === 'produse' && (
        <div>
          <div className="filter-section">
            <label style={{color: '#a0a0a0', fontWeight: 'bold'}}>ALEGE CATEGORIA:</label>
            <select 
              className="custom-select"
              onChange={(e) => setSelectedCatId(parseInt(e.target.value))}
              value={selectedCatId || ''}
            >
              <option value="">-- Selecteaza --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nume} ({c.tip})</option>
              ))}
            </select>
          </div>

          {selectedCatId && (
            <>
              <button 
                className="btn btn-outline" 
                style={{marginBottom: '20px', width: '100%'}}
                onClick={() => setIsAdding(!isAdding)}
              >
                {isAdding ? "X ANULEAZA" : "+ ADAUGA PRODUS NOU"}
              </button>

              {isAdding && (
                <div className="sortable-item" style={{border: '2px dashed #876545'}}>
                  <div>NEW</div>
                  <div className="image-dropzone"></div>
                  <div className="item-inputs">
                    <div className="input-group">
                       <label>Nume Produs</label>
                       <input className="custom-input" onChange={e => setNewItem({...newItem, nume: e.target.value})} onKeyDown={handleNewItemKeyDown} />
                    </div>
                    <div className="input-group">
                       <label>Fisier Poza</label>
                       <input className="custom-input" placeholder="calamar.jpg" onChange={e => setNewItem({...newItem, imagine_url: e.target.value})} onKeyDown={handleNewItemKeyDown} />
                    </div>
                    <div className="input-group">
                        <label>Ingrediente</label>
                        <input className="custom-input" onChange={e => setNewItem({...newItem, ingrediente: e.target.value})} onKeyDown={handleNewItemKeyDown} />
                    </div>
                    <div className="input-group">
                        <label>Gramaj</label>
                        <input className="custom-input" placeholder="200g" onChange={e => setNewItem({...newItem, gramaj: e.target.value})} onKeyDown={handleNewItemKeyDown} />
                    </div>
                    <div className="input-group">
                       <label>Pret</label>
                       <input type="number" className="custom-input" onChange={e => setNewItem({...newItem, pret: e.target.value})} onKeyDown={handleNewItemKeyDown} />
                    </div>
                    <div className="input-group">
                       <label>Alergeni</label>
                       <input className="custom-input" onChange={e => setNewItem({...newItem, alergeni: e.target.value})} onKeyDown={handleNewItemKeyDown} />
                    </div>
                    <div className="input-group">
                       <label>Decl. Nutritionala</label>
                       <input className="custom-input" onChange={e => setNewItem({...newItem, declaratie_nutritionala: e.target.value})} onKeyDown={handleNewItemKeyDown} />
                    </div>
                  </div>
                  <button onClick={handleCreate} className="btn btn-primary">CREAZA</button>
                </div>
              )}

              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleReorder(e, products, setProducts, 'produse', filteredProducts)}
              >
                <SortableContext 
                  items={filteredProducts.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredProducts.map((prod) => (
                    <SortableItem 
                      key={prod.id} 
                      id={prod.id} 
                      item={prod} 
                      type="produse" 
                      onSave={(id, data) => handleSave(id, data, 'produse')}
                      onDelete={(id) => handleDelete(id, 'produse')}
                      onUploadImage={handleUploadImage}
                    />
                  ))}
                  {filteredProducts.length === 0 && <p style={{color: '#888', textAlign: 'center'}}>Niciun produs in aceasta categorie.</p>}
                </SortableContext>
              </DndContext>
            </>
          )}
        </div>
      )}

    </div>
  );
}