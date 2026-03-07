import React, { useState, useEffect } from 'react';
import * as api from '../api/producers';
import '../styles/producers.css'; // Add exact CSS imports

const ProducersPage = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newBrandName, setNewBrandName] = useState('');
  const [expandedBrandId, setExpandedBrandId] = useState(null);
  
  // For adding models within an expanded brand
  const [newModelName, setNewModelName] = useState('');

  useEffect(() => {
    loadProducers();
  }, []);

  const loadProducers = async () => {
    try {
      setLoading(true);
      const res = await api.fetchProducers();
      if (res?.success) setProducers(res.data);
    } catch (error) {
      console.error('Error fetching producers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      await api.createProducer(newBrandName.trim());
      setNewBrandName('');
      loadProducers();
    } catch (error) {
      alert('Failed to add brand');
    }
  };

  const handleDeleteBrand = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} and all its models?`)) return;
    try {
      await api.deleteProducer(id);
      loadProducers();
    } catch (error) {
      alert('Failed to delete brand');
    }
  };

  const handleAddModel = async (producer) => {
    if (!newModelName.trim()) return;
    
    // Check if model already exists
    if (producer.models.some(m => m.toLowerCase() === newModelName.trim().toLowerCase())) {
      alert('Model already exists');
      return;
    }

    const updatedModels = [...producer.models, newModelName.trim()];
    
    try {
      await api.updateProducerModels(producer._id, updatedModels);
      setNewModelName('');
      loadProducers();    
    } catch (error) {
      alert('Failed to add model');
    }
  };

  const handleDeleteModel = async (producer, modelToRemove) => {
    if (!window.confirm(`Delete ${modelToRemove} from ${producer.name}?`)) return;
    
    const updatedModels = producer.models.filter(m => m !== modelToRemove);
    
    try {
      await api.updateProducerModels(producer._id, updatedModels);
      loadProducers();
    } catch (error) {
      alert('Failed to delete model');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Producers...</div>;
  }

  return (
    <div className="producers-container">
      <div className="producers-header">
        <h1 className="producers-title">Car Brands & Models</h1>
        <div className="producers-tip">
          💡 Any changes here instantly optimize the dealer's 0ms autocomplete forms.
        </div>
      </div>

      <div className="producers-card">
        <h2>Add New Brand</h2>
        <form onSubmit={handleAddBrand} className="add-brand-form">
          <input
            type="text"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            placeholder="e.g. Tesla"
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary-orange">
            Add Brand
          </button>
        </form>
      </div>

      <div className="brand-list">
        {producers.map((producer) => (
          <div key={producer._id} className="brand-item">
            <div 
              className="brand-header"
              onClick={() => {
                setExpandedBrandId(expandedBrandId === producer._id ? null : producer._id);
                setNewModelName(''); // Reset model input on toggle
              }}
            >
              <div className="brand-info">
                <span className="brand-name">{producer.name}</span>
                <span className="brand-count">
                  {producer.models.length} Models
                </span>
              </div>
              
              <div className="brand-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBrand(producer._id, producer.name);
                  }}
                  className="btn-delete-text"
                >
                  Delete Brand
                </button>
                <svg
                  className={`expand-icon ${expandedBrandId === producer._id ? 'rotated' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {expandedBrandId === producer._id && (
              <div className="brand-models-panel">
                <div className="add-model-section">
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder={`Add model to ${producer.name}...`}
                    className="input-field"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddModel(producer);
                    }}
                  />
                  <button
                    onClick={() => handleAddModel(producer)}
                    className="btn-dark"
                  >
                    Add Model
                  </button>
                </div>

                <div className="models-grid">
                  {producer.models.map(model => (
                    <div key={model} className="model-tag">
                      <span className="model-name">{model}</span>
                      <button
                        onClick={() => handleDeleteModel(producer, model)}
                        className="btn-remove-model"
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {producer.models.length === 0 && (
                    <span className="empty-text">No models added yet.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProducersPage;
