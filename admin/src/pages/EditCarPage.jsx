import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import apiClient from '../../../services/api';
import carProducers from '../data/carproducers.json';
import { getAdminCarById, editAdminCar } from "../api/cars";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ✅ Sortable Image Card */
function SortableImage({ id, file, index, removeImage, isExisting }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-full h-28 rounded-xl overflow-hidden border cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <img
        src={isExisting ? file : URL.createObjectURL(file)}
        alt="preview"
        className="w-full h-full object-cover"
      />
      {index === 0 && (
        <span className="absolute bottom-1 left-1 bg-black text-white text-[10px] px-2 py-1 rounded">
          Cover
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeImage();
        }}
        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-600"
      >
        ✕
      </button>
    </div>
  );
}

// Reusable YearDropdown component
function YearDropdown({ value, onChange, placeholder, required }) {
  const [showList, setShowList] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 27 }, (_, i) => currentYear - i);

  return (
    <div className="relative">
      <input
        type="text"
        readOnly
        value={value}
        onFocus={() => setShowList(true)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 cursor-pointer"
        required={required}
      />
      {showList && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border rounded-lg shadow">
          {years.map((year) => (
            <div
              key={year}
              onClick={() => {
                onChange(year);
                setShowList(false);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-orange-50"
            >
              {year}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Editpage() {
  const navigate = useNavigate();
  const { carId } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
  // ✅ ADD: Brand/Model search states
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [showBrandList, setShowBrandList] = useState(false);
  const [showModelList, setShowModelList] = useState(false);
  const [showModelYearList, setShowModelYearList] = useState(false);
  const [showRegYearList, setShowRegYearList] = useState(false);
  // Accordion state
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    registrationYear: '',
    price: '',
    priceAdditionalText: '',
    type: '',
    body: '',
    fuelType: '',
    transmission: '',
    mileage: '',
    distance: '',
    engineInfo: '',
    vin: '',
    ownerType: '',
    ownersCount: '',
    representative: '',
    businessPartner: '',
    location: '',
    doors: '',
    interiorColor: '',
    exteriorColor: '',
    description: '',
    interiorEquipment: {
      numberOfSeats: '',
      parkingSensors: '',
      interiorDesign: '',
      climateControl: '',
      airbags: '',
      airbagType: '',
      tunerRadio: false,
      bluetooth: false,
      cdPlayer: false,
      mp3Interface: false,
      auxiliaryHeating: false,
      electricHeatedSeats: false,
      electricSideMirror: false,
      electricSeatAdjustment: false,
      startStopSystem: false,
      skiBag: false,
      rainSensor: false,
      powerSteering: false,
      onboardComputer: false,
      navigationSystem: false,
      cruiseControl: false,
      handsFreeKit: false,
      isofix: false,
      electricWindows: false,
      headUpDisplay: false,
      centralLocking: false,
      multifunctionSteeringWheel: false
    },
    exteriorEquipment: {
      sunroof: false,
      roofRack: false,
      panoramicRoof: false,
      metallicExterior: false,
      alloyWheels: false,
      trailerCoupling: false
    },
    environment: {
      fuelConsumption: '',
      emissionSticker: '',
      emissionClass: '',
      roofBars: false,
      xenonHeadlights: false,
      tractionControl: false,
      particleFilter: false,
      lightSensor: false,
      immobilizer: false,
      fourWheelDrive: false,
      fogLamp: false,
      esp: false,
      daytimeRunningLights: false,
      adaptiveLighting: false,
      abs: false
    },
    extras: {
      sportsSuspension: false,
      sportsPackage: false,
      sportsSeats: false
    }
  });
  console.log("formData : ",formData);
  
  // ✅ ADD: Selected brand computation
  const selectedBrand = carProducers.find(
    (b) => b.name === formData.brand
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    if (carId) {
      fetchCarData();
    } else {
      setLoadingData(false);
    }
  }, [carId]);

  const fetchCarData = async () => {
    try {
      setLoadingData(true);
      //const response = await apiClient.get(`/dealer/cars/${carId}`);
      const response = await getAdminCarById(carId);
     console.log("Car data carData:", response);
      console.log("Car id ",carId);
      
      if (response.data && response.success) {
        const carData = response.data;
         console.log("Car data carData:", carData);
        setFormData({
          brand: carData?.brand || '',
          model: carData?.model || '',
          year: carData?.year || '',
          registrationYear: carData?.registrationYear || '',
          price: carData?.price || '',
          priceAdditionalText: carData?.priceAdditionalText || '',
          type: carData?.type || '',
          body: carData?.body || '',
          fuelType: carData?.fuelType || '',
          transmission: carData?.transmission || '',
          mileage: carData?.mileage || '',
          distance: carData?.distance || '',
          engineInfo: carData?.engineInfo || '',
          vin: carData?.vin || '',
          ownerType: carData?.ownerType || '',
          ownersCount: carData?.ownersCount || '',
          representative: carData?.representative || '',
          businessPartner: carData?.businessPartner || '',
          location: carData?.location || '',
          doors: carData?.doors || '',
          interiorColor: carData?.interiorColor || '',
          exteriorColor: carData?.exteriorColor || '',
          description: carData?.description || '',
          interiorEquipment: carData?.interiorEquipment || {
            numberOfSeats: '',
            parkingSensors: '',
            interiorDesign: '',
            climateControl: '',
            airbags: '',
            airbagType: '',
            tunerRadio: false,
            bluetooth: false,
            cdPlayer: false,
            mp3Interface: false,
            auxiliaryHeating: false,
            electricHeatedSeats: false,
            electricSideMirror: false,
            electricSeatAdjustment: false,
            startStopSystem: false,
            skiBag: false,
            rainSensor: false,
            powerSteering: false,
            onboardComputer: false,
            navigationSystem: false,
            cruiseControl: false,
            handsFreeKit: false,
            isofix: false,
            electricWindows: false,
            headUpDisplay: false,
            centralLocking: false,
            multifunctionSteeringWheel: false
          },
          exteriorEquipment: carData?.exteriorEquipment || {
            sunroof: false,
            roofRack: false,
            panoramicRoof: false,
            metallicExterior: false,
            alloyWheels: false,
            trailerCoupling: false
          },
          environment: carData?.environment || {
            fuelConsumption: '',
            emissionSticker: '',
            emissionClass: '',
            roofBars: false,
            xenonHeadlights: false,
            tractionControl: false,
            particleFilter: false,
            lightSensor: false,
            immobilizer: false,
            fourWheelDrive: false,
            fogLamp: false,
            esp: false,
            daytimeRunningLights: false,
            adaptiveLighting: false,
            abs: false
          },
          extras: carData?.extras || {
            sportsSuspension: false,
            sportsPackage: false,
            sportsSeats: false
          }
        });

        if (carData?.images && carData?.images.length > 0) {
          setExistingImages(carData?.images);
        }
      }
    } catch (error) {
      console.error('Error fetching car data:', error);
      alert('Failed to load car data');
      navigate('/dealer/profile?tab=Garage');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (section, field, checked) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked
      }
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + existingImages.length;
    
    if (files.length + totalImages > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    const newFiles = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
    }));

    setImages((prev) => [...prev, ...newFiles]);
  };

  const removeImageAtIndex = (index, isExisting) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const allImagesForDisplay = [
    ...existingImages.map((img, idx) => ({ 
      id: `existing-${idx}`, 
      file: img, 
      isExisting: true, 
      originalIndex: idx 
    })),
    ...images.map((img, idx) => ({ 
      id: img.id, 
      file: img.file, 
      isExisting: false, 
      originalIndex: idx 
    }))
  ];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = allImagesForDisplay.findIndex((i) => i.id === active.id);
    const newIndex = allImagesForDisplay.findIndex((i) => i.id === over.id);

    const reordered = arrayMove(allImagesForDisplay, oldIndex, newIndex);
    
    const newExisting = reordered.filter(img => img.isExisting).map(img => img.file);
    const newImages = reordered.filter(img => !img.isExisting);
    
    setExistingImages(newExisting);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model || !formData.year || !formData.price) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      
      images.forEach((image) => {
        submitData.append('images', image.file);
      });

      if (existingImages.length > 0) {
        submitData.append('existingImages', JSON.stringify(existingImages));
      }

      submitData.append('brand', formData.brand);
      submitData.append('model', formData.model);
      submitData.append('year', formData.year);
      submitData.append('price', formData.price);
      
      if (formData.registrationYear) submitData.append('registrationYear', formData.registrationYear);
      if (formData.priceAdditionalText) submitData.append('priceAdditionalText', formData.priceAdditionalText);
      if (formData.type) submitData.append('type', formData.type);
      if (formData.body) submitData.append('body', formData.body);
      if (formData.fuelType) submitData.append('fuelType', formData.fuelType);
      if (formData.transmission) submitData.append('transmission', formData.transmission);
      if (formData.mileage) submitData.append('mileage', formData.mileage);
      if (formData.distance) submitData.append('distance', formData.distance);
      if (formData.engineInfo) submitData.append('engineInfo', formData.engineInfo);
      if (formData.vin) submitData.append('vin', formData.vin);
      if (formData.ownerType) submitData.append('ownerType', formData.ownerType);
      if (formData.ownersCount) submitData.append('ownersCount', formData.ownersCount);
      if (formData.representative) submitData.append('representative', formData.representative);
      if (formData.businessPartner) submitData.append('businessPartner', formData.businessPartner);
      if (formData.doors) submitData.append('doors', formData.doors);
      if (formData.interiorColor) submitData.append('interiorColor', formData.interiorColor);
      if (formData.exteriorColor) submitData.append('exteriorColor', formData.exteriorColor);
      if (formData.description) submitData.append('description', formData.description);

      if (formData.location) submitData.append('location', JSON.stringify(formData.location));
      
      submitData.append('interiorEquipment', JSON.stringify(formData.interiorEquipment));
      submitData.append('exteriorEquipment', JSON.stringify(formData.exteriorEquipment));
      submitData.append('environment', JSON.stringify(formData.environment));
      submitData.append('extras', JSON.stringify(formData.extras));

      let response;
      if (carId) {
        response = await editAdminCar(carId, submitData);
        console.log("Edit response:", response);
      } else {
        console.log("Edit response dddddddd:");
        response = await apiClient.post('/dealer/cars', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data && response.success) {
        alert('Car added successfully!!');
        navigate('/cars');
        
      }
    } catch (error) {
      console.error('Error saving car:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to save car. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-w-full bg-white p-4 sm:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg sm:text-xl">Loading car data...</div>
        </div>
      </div>
    );
  }
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 27 }, (_, i) => currentYear - i);
  return (
    <div className="min-h-screen flex flex-col">
    <div className="grow flex justify-center">
        <div className="min-w-full bg-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-lg sm:text-2xl font-semibold text-center mb-4 sm:mb-8">
            <span className="text-orange-500">
                {carId ? `${formData.brand} ${formData.model} ${formData.year}` : 'Add Car Details'}
            </span>
            </h1>

            <form onSubmit={handleSubmit}>
            {/* ========== MOBILE ACCORDION VIEW ========== */}
            <div className="block md:hidden space-y-3">
                {/* Media Section */}
                <div className="bg-white rounded-xl border border-gray-200">
                <button
                    type="button"
                    onClick={() => toggleSection('media')}
                    className="w-full flex items-center justify-between p-4 text-left"
                >
                    <span className="font-semibold">Media</span>
                    <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'media' ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {expandedSection === 'media' && (
                    <div className="p-4 border-t space-y-4">
                    <div className="flex justify-center">
                        <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 w-full">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-gray-600">Tap to add</div>
                        <div className="text-xs text-gray-500 mt-2">
                            Select Car Images to Upload<br />(each file size less then x mb)
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        </label>
                    </div>

                    {allImagesForDisplay.length > 0 && (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={allImagesForDisplay.map((img) => img.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 gap-4">
                            {allImagesForDisplay.map((imgObj, index) => (
                                <SortableImage
                                key={imgObj.id}
                                id={imgObj.id}
                                file={imgObj.file}
                                index={index}
                                removeImage={() => removeImageAtIndex(imgObj.originalIndex, imgObj.isExisting)}
                                isExisting={imgObj.isExisting}
                                />
                            ))}
                            </div>
                        </SortableContext>
                        </DndContext>
                    )}
                    </div>
                )}
                </div>

                {/* General Info Section - MOBILE */}
                <div className="bg-white rounded-xl border border-gray-200">
                <button
                    type="button"
                    onClick={() => toggleSection('general')}
                    className="w-full flex items-center justify-between p-4 text-left"
                >
                    <span className="font-semibold">General Info</span>
                    <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'general' ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {expandedSection === 'general' && (
                    <div className="p-4 border-t space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* ✅ BRAND - AUTOCOMPLETE */}
                        <div>
                        <label className="block text-sm font-medium mb-2">Car Brand *</label>
                        <div className="relative">
                            <input
                            type="text"
                            value={brandSearch || formData.brand}
                            onChange={(e) => {
                                setBrandSearch(e.target.value);
                                setShowBrandList(true);
                                setFormData(prev => ({ ...prev, brand: '', model: '' }));
                            }}
                            onFocus={() => setShowBrandList(true)}
                            placeholder="Search brand..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            required
                            />

                            {showBrandList && (
                            <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow">
                                {carProducers
                                .filter(b =>
                                    b.name.toLowerCase().includes(brandSearch.toLowerCase())
                                )
                                .map(brand => (
                                    <div
                                    key={brand.term_id}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, brand: brand.name, model: '' }));
                                        setBrandSearch('');
                                        setShowBrandList(false);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-orange-50"
                                    >
                                    {brand.name}
                                    </div>
                                ))}
                            </div>
                            )}
                        </div>
                        </div>

                        {/* ✅ MODEL - AUTOCOMPLETE */}
                        <div>
                        <label className="block text-sm font-medium mb-2">Model Name *</label>
                        <div className="relative">
                            <input
                            type="text"
                            value={modelSearch || formData.model}
                            onChange={(e) => {
                                setModelSearch(e.target.value);
                                setShowModelList(true);
                            }}
                            onFocus={() => setShowModelList(true)}
                            placeholder={formData.brand ? 'Search model...' : 'Select brand first'}
                            disabled={!formData.brand}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-orange-500"
                            required
                            />

                            {showModelList && selectedBrand && (
                            <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow">
                                {selectedBrand.childs
                                .filter(m =>
                                    m.name.toLowerCase().includes(modelSearch.toLowerCase())
                                )
                                .map(model => (
                                    <div
                                    key={model.term_id}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, model: model.name }));
                                        setModelSearch('');
                                        setShowModelList(false);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-orange-50"
                                    >
                                    {model.name}
                                    </div>
                                ))}
                            </div>
                            )}
                        </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Model Year</label>

                        <div className="relative">
                            <input
                            type="text"
                            readOnly
                            value={formData.year}
                            onFocus={() => setShowModelYearList(true)}
                            placeholder="Select Model Year"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 cursor-pointer"
                            required
                            />

                            {showModelYearList && (
                            <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border rounded-lg shadow">
                                {years.map((year) => (
                                <div
                                    key={year}
                                    onClick={() => {
                                    setFormData(prev => ({ ...prev, year }));
                                    setShowModelYearList(false);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-orange-50"
                                >
                                    {year}
                                </div>
                                ))}
                            </div>
                            )}
                        </div>
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Car Type</label>
                        <div className="relative">
                            <select
                            name="type"
                            value={formData.type}
                            required
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-orange-500"
                            >
                            <option value="">Select</option>
                            <option value="SUV">SUV</option>
                            <option value="Sedan">Sedan</option>
                            <option value="Hatchback">Hatchback</option>
                            <option value="Muv">Muv</option>
                            <option value="Luxury Sedan">Luxury Sedan</option>
                            <option value="Luxury Suv">Luxury Suv</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Fuel Type</label>
                        <div className="relative">
                            <select
                            name="fuelType"
                            value={formData.fuelType}
                            required
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-orange-500"
                            >
                            <option value="">Select</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Hydrogen">Hydrogen</option>
                            <option value="CNG">CNG</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Gear Type</label>
                        <div className="relative">
                            <select
                            name="transmission"
                            value={formData.transmission}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-orange-500"
                            >
                            <option value="">Select</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Dual-clutch">Dual-clutch</option>
                            <option value="Auto-Manual">Auto-Manual</option>
                            <option value="Int-Manual">Int-Manual</option>
                            <option value="Single-Speed">Single-Speed</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Price *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Owner Type</label>
                        <select
                            name="ownerType"
                            value={formData.ownerType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select</option>
                            <option value="First">1st Owner</option>
                            <option value="Second">2nd Owner</option>
                            <option value="Third">3rd Owner</option>
                            <option value="Fourth+">4th+ Owner</option>
                        </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Distance (km)</label>
                        <input
                            type="number"
                            name="distance"
                            value={formData.distance}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">
                            Registration Year
                        </label>
                        <div className="relative">
                            <input
                            type="text"
                            readOnly
                            value={formData.registrationYear}
                            onFocus={() => setShowRegYearList(true)}
                            placeholder="Select Registration Year"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 cursor-pointer"
                            required
                            />

                            {showRegYearList && (
                            <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border rounded-lg shadow">
                                {years.map((year) => (
                                <div
                                    key={year}
                                    onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        registrationYear: year
                                    }));
                                    setShowRegYearList(false);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-orange-50"
                                >
                                    {year}
                                </div>
                                ))}
                            </div>
                            )}
                        </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Mileage</label>
                        <input
                            type="text"
                            name="mileage"
                            value={formData.mileage}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Engine Info.</label>
                        <input
                            type="text"
                            name="engineInfo"
                            value={formData.engineInfo}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">No. of Doors</label>
                        <input
                            type="number"
                            name="doors"
                            value={formData.doors}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Interior Color</label>
                        <input
                            type="text"
                            name="interiorColor"
                            value={formData.interiorColor}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Exterior Color</label>
                        <input
                            type="text"
                            name="exteriorColor"
                            value={formData.exteriorColor}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Vin</label>
                        <input
                            type="text"
                            name="vin"
                            value={formData.vin}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">#Owner</label>
                        <input
                            type="number"
                            name="ownersCount"
                            value={formData.ownersCount}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Business Partner</label>
                        <input
                            type="text"
                            name="businessPartner"
                            value={formData.businessPartner}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Price Additional Text</label>
                        <input
                            type="text"
                            name="priceAdditionalText"
                            value={formData.priceAdditionalText}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Car Description</label>
                        <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="4"
                        />
                    </div>
                    </div>
                )}
                </div>

                {/* Internal Equipment Section */}
                <div className="bg-white rounded-xl border border-gray-200">
                <button
                    type="button"
                    onClick={() => toggleSection('internal')}
                    className="w-full flex items-center justify-between p-4 text-left"
                >
                    <span className="font-semibold">Internal Equipment</span>
                    <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'internal' ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {expandedSection === 'internal' && (
                    <div className="p-4 border-t space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">No. of Seats</label>
                        <input
                            type="number"
                            value={formData.interiorEquipment.numberOfSeats}
                            onChange={(e) => handleNestedChange('interiorEquipment', 'numberOfSeats', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Parking Sensor</label>
                        <select
                            value={formData.interiorEquipment.parkingSensors}
                            onChange={(e) => handleNestedChange('interiorEquipment', 'parkingSensors', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select</option>
                            <option value="Front">Front</option>
                            <option value="Rear">Rear</option>
                            <option value="Front & Rear">Front & Rear</option>
                            <option value="Camera">Camera</option>
                        </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Interior Design</label>
                        <select
                            value={formData.interiorEquipment.interiorDesign}
                            onChange={(e) => handleNestedChange('interiorEquipment', 'interiorDesign', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select</option>
                            <option value="Leather">Leather</option>
                            <option value="Fabric">Fabric</option>
                            <option value="Alcantara">Alcantara</option>
                            <option value="Vinyl">Vinyl</option>
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Climate Change</label>
                        <select
                            value={formData.interiorEquipment.climateControl}
                            onChange={(e) => handleNestedChange('interiorEquipment', 'climateControl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                            <option value="2-Zone">2-Zone</option>
                            <option value="3-Zone">3-Zone</option>
                            <option value="4-Zone">4-Zone</option>
                        </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Airbags</label>
                        <input
                            type="number"
                            value={formData.interiorEquipment.airbags}
                            onChange={(e) => handleNestedChange('interiorEquipment', 'airbags', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Airbag Type</label>
                        <select
                            value={formData.interiorEquipment.airbagType}
                            onChange={(e) => handleNestedChange('interiorEquipment', 'airbagType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select</option>
                            <option value="Front">Front</option>
                            <option value="Side">Side</option>
                            <option value="Curtain">Curtain</option>
                            <option value="All">All</option>
                        </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                        { label: 'Tuner/Radio', key: 'tunerRadio' },
                        { label: 'Bluetooth', key: 'bluetooth' },
                        { label: 'CD Player', key: 'cdPlayer' },
                        { label: 'MP3 Interface', key: 'mp3Interface' },
                        { label: 'Auxiliary Heating', key: 'auxiliaryHeating' },
                        { label: 'Electric Heated Seats', key: 'electricHeatedSeats' },
                        { label: 'Electric Side Mirror', key: 'electricSideMirror' },
                        { label: 'Electric Seat Adjustment', key: 'electricSeatAdjustment' },
                        { label: 'Start-Stop System', key: 'startStopSystem' },
                        { label: 'Ski Bag', key: 'skiBag' },
                        { label: 'Rain Sensor', key: 'rainSensor' },
                        { label: 'Power Assisted Steering', key: 'powerSteering' },
                        { label: 'On-board Computer', key: 'onboardComputer' },
                        { label: 'Navigation System', key: 'navigationSystem' },
                        { label: 'Cruise control', key: 'cruiseControl' },
                        { label: 'Hands Free Kit', key: 'handsFreeKit' },
                        { label: 'Isofix (child seats)', key: 'isofix' },
                        { label: 'Electric Window', key: 'electricWindows' },
                        { label: 'Head-up Display', key: 'headUpDisplay' },
                        { label: 'Central Locking', key: 'centralLocking' },
                        { label: 'Multifunction Steering Wheel', key: 'multifunctionSteeringWheel' }
                        ].map(item => (
                        <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                            type="checkbox"
                            checked={formData.interiorEquipment[item.key] || false}
                            onChange={(e) => handleCheckboxChange('interiorEquipment', item.key, e.target.checked)}
                            className="w-4 h-4"
                            />
                            <span className="text-xs">{item.label}</span>
                        </label>
                        ))}
                    </div>
                    </div>
                )}
                </div>

                {/* Exterior Equipment Section */}
                <div className="bg-white rounded-xl border border-gray-200">
                <button
                    type="button"
                    onClick={() => toggleSection('exterior')}
                    className="w-full flex items-center justify-between p-4 text-left"
                >
                    <span className="font-semibold">Exterior Equipment</span>
                    <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'exterior' ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {expandedSection === 'exterior' && (
                    <div className="p-4 border-t">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                        { label: 'Sunroof', key: 'sunroof' },
                        { label: 'Roof Rack', key: 'roofRack' },
                        { label: 'Panoramic Roof', key: 'panoramicRoof' },
                        { label: 'Metallic Exterior', key: 'metallicExterior' },
                        { label: 'Alloy Wheels', key: 'alloyWheels' },
                        { label: 'Trailer Coupling', key: 'trailerCoupling' }
                        ].map(item => (
                        <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                            type="checkbox"
                            checked={formData.exteriorEquipment[item.key] || false}
                            onChange={(e) => handleCheckboxChange('exteriorEquipment', item.key, e.target.checked)}
                            className="w-4 h-4"
                            />
                            <span className="text-sm">{item.label}</span>
                        </label>
                        ))}
                    </div>
                    </div>
                )}
                </div>

                {/* Environmentals Section */}
                <div className="bg-white rounded-xl border border-gray-200">
                <button
                    type="button"
                    onClick={() => toggleSection('environment')}
                    className="w-full flex items-center justify-between p-4 text-left"
                >
                    <span className="font-semibold">Environmentals</span>
                    <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'environment' ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {expandedSection === 'environment' && (
                    <div className="p-4 border-t space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2">Fuel Consumption</label>
                        <input
                            type="text"
                            value={formData.environment.fuelConsumption}
                            onChange={(e) => handleNestedChange('environment', 'fuelConsumption', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="e.g., 8.5 L/100km"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Emission Sticker</label>
                        <select
                            value={formData.environment.emissionSticker}
                            onChange={(e) => handleNestedChange('environment', 'emissionSticker', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select</option>
                            <option value="Green">Green (4)</option>
                            <option value="Yellow">Yellow (3)</option>
                            <option value="Red">Red (2)</option>
                            <option value="No Badge">No Badge</option>
                        </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Emission Class</label>
                        <select
                        value={formData.environment.emissionClass}
                        onChange={(e) => handleNestedChange('environment', 'emissionClass', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                        <option value="">Select</option>
                        <option value="Euro 6">Euro 6</option>
                        <option value="Euro 5">Euro 5</option>
                        <option value="Euro 4">Euro 4</option>
                        <option value="Euro 3">Euro 3</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                        { label: 'Roof Bars', key: 'roofBars' },
                        { label: 'Xenon Headlights', key: 'xenonHeadlights' },
                        { label: 'Traction Control', key: 'tractionControl' },
                        { label: 'Particular Filter', key: 'particleFilter' },
                        { label: 'Light Sensor', key: 'lightSensor' },
                        { label: 'Immobilizer', key: 'immobilizer' },
                        { label: 'Four Wheel Drive', key: 'fourWheelDrive' },
                        { label: 'Fog Lamp', key: 'fogLamp' },
                        { label: 'ESP', key: 'esp' },
                        { label: 'Daytime running lights', key: 'daytimeRunningLights' },
                        { label: 'Adaptive lighting', key: 'adaptiveLighting' },
                        { label: 'ABS', key: 'abs' }
                        ].map(item => (
                        <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                            type="checkbox"
                            checked={formData.environment[item.key] || false}
                            onChange={(e) => handleCheckboxChange('environment', item.key, e.target.checked)}
                            className="w-4 h-4"
                            />
                            <span className="text-xs">{item.label}</span>
                        </label>
                        ))}
                    </div>
                    </div>
                )}
                </div>

                {/* Others Section */}
                <div className="bg-white rounded-xl border border-gray-200">
                <button
                    type="button"
                    onClick={() => toggleSection('others')}
                    className="w-full flex items-center justify-between p-4 text-left"
                >
                    <span className="font-semibold">Others</span>
                    <svg
                    className={`w-5 h-5 transition-transform ${expandedSection === 'others' ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {expandedSection === 'others' && (
                    <div className="p-4 border-t">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                        { label: 'Sports Suspension', key: 'sportsSuspension' },
                        { label: 'Sports Package', key: 'sportsPackage' },
                        { label: 'Sports Seats', key: 'sportsSeats' }
                        ].map(item => (
                        <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                            type="checkbox"
                            checked={formData.extras[item.key] || false}
                            onChange={(e) => handleCheckboxChange('extras', item.key, e.target.checked)}
                            className="w-4 h-4"
                            />
                            <span className="text-sm">{item.label}</span>
                        </label>
                        ))}
                    </div>
                    </div>
                )}
                </div>

                {/* Submit Button Mobile */}
                <div className="text-center pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white border border-gray-300 text-gray-700 px-12 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 w-full font-medium"
                >
                    {loading ? 'Submitting...' : carId ? 'Update Vehicle' : 'Submit'}
                </button>
                </div>
            </div>

            {/* ========== DESKTOP VIEW ========== */}
            <div className="hidden md:block">
                {/* General Car Info - DESKTOP */}
                <div className="bg-white rounded-lg p-6 mb-6 border">
                <h2 className="text-xl font-semibold text-center mb-6">General Info</h2>
                
                <div className="grid grid-cols-3 gap-4">
                    {/* ✅ BRAND - AUTOCOMPLETE */}
                    <div>
                    <label className="block text-sm font-medium mb-2">Car Brand *</label>
                    <div className="relative">
                        <input
                        type="text"
                        value={brandSearch || formData.brand}
                        onChange={(e) => {
                            setBrandSearch(e.target.value);
                            setShowBrandList(true);
                            setFormData(prev => ({ ...prev, brand: '', model: '' }));
                        }}
                        onFocus={() => setShowBrandList(true)}
                        placeholder="Search brand..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                        />

                        {showBrandList && (
                        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow">
                            {carProducers
                            .filter(b =>
                                b.name.toLowerCase().includes(brandSearch.toLowerCase())
                            )
                            .map(brand => (
                                <div
                                key={brand.term_id}
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, brand: brand.name, model: '' }));
                                    setBrandSearch('');
                                    setShowBrandList(false);
                                }}
                                className="px-4 py-2 cursor-pointer hover:bg-orange-50"
                                >
                                {brand.name}
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                    </div>
                    
                    {/* ✅ MODEL - AUTOCOMPLETE */}
                    <div>
                    <label className="block text-sm font-medium mb-2">Model Name *</label>
                    <div className="relative">
                        <input
                        type="text"
                        value={modelSearch || formData.model}
                        onChange={(e) => {
                            setModelSearch(e.target.value);
                            setShowModelList(true);
                        }}
                        onFocus={() => setShowModelList(true)}
                        placeholder={formData.brand ? 'Search model...' : 'Select brand first'}
                        disabled={!formData.brand}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-orange-500"
                        required
                        />

                        {showModelList && selectedBrand && (
                        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow">
                            {selectedBrand.childs
                            .filter(m =>
                                m.name.toLowerCase().includes(modelSearch.toLowerCase())
                            )
                            .map(model => (
                                <div
                                key={model.term_id}
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, model: model.name }));
                                    setModelSearch('');
                                    setShowModelList(false);
                                }}
                                className="px-4 py-2 cursor-pointer hover:bg-orange-50"
                                >
                                {model.name}
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Model Year *</label>
                    <YearDropdown
                        value={formData.year}
                        onChange={(year) => setFormData(prev => ({ ...prev, year }))}
                        placeholder="Select Model Year"
                        required
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Car Type</label>
                    <div className="relative">
                        <select
                        name="type"
                        value={formData.type}
                        required
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                        <option value="">Select</option>
                        <option value="SUV">SUV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Muv">Muv</option>
                        <option value="Luxury Sedan">Luxury Sedan</option>
                        <option value="Luxury Suv">Luxury Suv</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Fuel Type</label>
                    <div className="relative">
                        <select
                        name="fuelType"
                        value={formData.fuelType}
                        required
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                        <option value="">Select</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Hydrogen">Hydrogen</option>
                        <option value="CNG">CNG</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Gear Type</label>
                    <div className="relative">
                        <select
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                        <option value="">Select</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Dual-clutch">Dual-clutch</option>
                        <option value="Auto-Manual">Auto-Manual</option>
                        <option value="Int-Manual">Int-Manual</option>
                        <option value="Single-Speed">Single-Speed</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Price *</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Owner Type</label>
                    <div className="relative">
                        <select
                        name="ownerType"
                        value={formData.ownerType}
                        required
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                        <option value="">Select</option>
                        <option value="First">1st Owner</option>
                        <option value="Second">2nd Owner</option>
                        <option value="Third">3rd Owner</option>
                        <option value="Fourth+">4th+ Owner</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Registration Year</label>
                    <YearDropdown
                        value={formData.registrationYear}
                        onChange={(year) => setFormData(prev => ({ ...prev, registrationYear: year }))}
                        placeholder="Select Registration Year"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Distance (km)</label>
                    <input
                        type="number"
                        name="distance"
                        value={formData.distance}
                        required
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Mileage</label>
                    <input
                        type="text"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Engine Info</label>
                    <input
                        type="text"
                        name="engineInfo"
                        value={formData.engineInfo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">No. of Doors</label>
                    <input
                        type="number"
                        name="doors"
                        value={formData.doors}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Interior Color</label>
                    <input
                        type="text"
                        name="interiorColor"
                        value={formData.interiorColor}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Exterior Color</label>
                    <input
                        type="text"
                        name="exteriorColor"
                        value={formData.exteriorColor}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">VIN</label>
                    <input
                        type="text"
                        name="vin"
                        value={formData.vin}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">#Owner</label>
                    <input
                        type="number"
                        name="ownersCount"
                        value={formData.ownersCount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Business Partner</label>
                    <input
                        type="text"
                        name="businessPartner"
                        value={formData.businessPartner}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Price Additional Text</label>
                    <input
                        type="text"
                        name="priceAdditionalText"
                        value={formData.priceAdditionalText}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div className="col-span-3">
                    <label className="block text-sm font-medium mb-2">Car Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="4"
                    />
                    </div>
                </div>
                </div>

                {/* Media Section */}
                <div className="bg-white rounded-lg p-6 mb-6 border">
                <h2 className="text-xl font-semibold text-center mb-6">Media</h2>
                
                <div className="flex items-center justify-center">
                    <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-gray-600">Tap to add</div>
                    <div className="text-xs text-gray-500 mt-2">
                        Select Car Images to Upload<br />(Max 10 images, each file size less than 5 MB)
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    </label>
                </div>

                {allImagesForDisplay.length > 0 && (
                    <div className="mt-6">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={allImagesForDisplay.map((img) => img.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-5 gap-4">
                            {allImagesForDisplay.map((imgObj, index) => (
                            <SortableImage
                                key={imgObj.id}
                                id={imgObj.id}
                                file={imgObj.file}
                                index={index}
                                removeImage={() => removeImageAtIndex(imgObj.originalIndex, imgObj.isExisting)}
                                isExisting={imgObj.isExisting}
                            />
                            ))}
                        </div>
                        </SortableContext>
                    </DndContext>
                    </div>
                )}
                </div>

                {/* Interior Equipment */}
                <div className="bg-white rounded-lg p-6 mb-6 border">
                <h2 className="text-xl font-semibold text-center mb-6">Interior Equipment</h2>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div>
                    <label className="block text-sm font-medium mb-2">No. of Seats</label>
                    <input
                        type="number"
                        value={formData.interiorEquipment.numberOfSeats}
                        onChange={(e) => handleNestedChange('interiorEquipment', 'numberOfSeats', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Parking Sensors</label>
                    <select
                        value={formData.interiorEquipment.parkingSensors}
                        onChange={(e) => handleNestedChange('interiorEquipment', 'parkingSensors', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select</option>
                        <option value="Front">Front</option>
                        <option value="Rear">Rear</option>
                        <option value="Front & Rear">Front & Rear</option>
                        <option value="Camera">Camera</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Interior Design</label>
                    <select
                        value={formData.interiorEquipment.interiorDesign}
                        onChange={(e) => handleNestedChange('interiorEquipment', 'interiorDesign', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select</option>
                        <option value="Leather">Leather</option>
                        <option value="Fabric">Fabric</option>
                        <option value="Alcantara">Alcantara</option>
                        <option value="Vinyl">Vinyl</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Climate Control</label>
                    <select
                        value={formData.interiorEquipment.climateControl}
                        onChange={(e) => handleNestedChange('interiorEquipment', 'climateControl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                        <option value="2-Zone">2-Zone</option>
                        <option value="3-Zone">3-Zone</option>
                        <option value="4-Zone">4-Zone</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Airbags</label>
                    <input
                        type="number"
                        value={formData.interiorEquipment.airbags}
                        onChange={(e) => handleNestedChange('interiorEquipment', 'airbags', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Airbag Type</label>
                    <select
                        value={formData.interiorEquipment.airbagType}
                        onChange={(e) => handleNestedChange('interiorEquipment', 'airbagType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select</option>
                        <option value="Front">Front</option>
                        <option value="Side">Side</option>
                        <option value="Curtain">Curtain</option>
                        <option value="All">All</option>
                    </select>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {[
                    { label: 'Tuner/Radio', key: 'tunerRadio' },
                    { label: 'Bluetooth', key: 'bluetooth' },
                    { label: 'CD Player', key: 'cdPlayer' },
                    { label: 'MP3 Interface', key: 'mp3Interface' },
                    { label: 'Auxiliary Heating', key: 'auxiliaryHeating' },
                    { label: 'Electric Heated Seats', key: 'electricHeatedSeats' },
                    { label: 'Electric Side Mirror', key: 'electricSideMirror' },
                    { label: 'Electric Seat Adjustment', key: 'electricSeatAdjustment' },
                    { label: 'Start-Stop System', key: 'startStopSystem' },
                    { label: 'Ski Bag', key: 'skiBag' },
                    { label: 'Rain Sensor', key: 'rainSensor' },
                    { label: 'Power Assisted Steering', key: 'powerSteering' },
                    { label: 'On-board Computer', key: 'onboardComputer' },
                    { label: 'Navigation System', key: 'navigationSystem' },
                    { label: 'Cruise control', key: 'cruiseControl' },
                    { label: 'Hands Free Kit', key: 'handsFreeKit' },
                    { label: 'Isofix (child seats)', key: 'isofix' },
                    { label: 'Electric Window', key: 'electricWindows' },
                    { label: 'Head-up Display', key: 'headUpDisplay' },
                    { label: 'Central Locking', key: 'centralLocking' },
                    { label: 'Multifunction Steering Wheel', key: 'multifunctionSteeringWheel' }
                    ].map(item => (
                    <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                        type="checkbox"
                        checked={formData.interiorEquipment[item.key] || false}
                        onChange={(e) => handleCheckboxChange('interiorEquipment', item.key, e.target.checked)}
                        className="w-4 h-4"
                        />
                        <span className="text-sm">{item.label}</span>
                    </label>
                    ))}
                </div>
                </div>

                {/* Exterior Equipment */}
                <div className="bg-white rounded-lg p-6 mb-6 border">
                <h2 className="text-xl font-semibold text-center mb-6">Exterior Equipment</h2>
                
                <div className="grid grid-cols-4 gap-4">
                    {[
                    { label: 'Sunroof', key: 'sunroof' },
                    { label: 'Roof Rack', key: 'roofRack' },
                    { label: 'Panoramic Roof', key: 'panoramicRoof' },
                    { label: 'Metallic Exterior', key: 'metallicExterior' },
                    { label: 'Alloy Wheels', key: 'alloyWheels' },
                    { label: 'Trailer Coupling', key: 'trailerCoupling' }
                    ].map(item => (
                    <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                        type="checkbox"
                        checked={formData.exteriorEquipment[item.key] || false}
                        onChange={(e) => handleCheckboxChange('exteriorEquipment', item.key, e.target.checked)}
                        className="w-4 h-4"
                        />
                        <span className="text-sm">{item.label}</span>
                    </label>
                    ))}
                </div>
                </div>

                {/* Environments */}
                <div className="bg-white rounded-lg p-6 mb-6 border">
                <h2 className="text-xl font-semibold text-center mb-6">Environments</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                    <label className="block text-sm font-medium mb-2">Fuel Consumption</label>
                    <input
                        type="text"
                        value={formData.environment.fuelConsumption}
                        onChange={(e) => handleNestedChange('environment', 'fuelConsumption', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 8.5 L/100km"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Emission Sticker</label>
                    <select
                        value={formData.environment.emissionSticker}
                        onChange={(e) => handleNestedChange('environment', 'emissionSticker', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select</option>
                        <option value="Green">Green (4)</option>
                        <option value="Yellow">Yellow (3)</option>
                        <option value="Red">Red (2)</option>
                        <option value="No Badge">No Badge</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-2">Emission Class</label>
                    <select
                        value={formData.environment.emissionClass}
                        onChange={(e) => handleNestedChange('environment', 'emissionClass', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select</option>
                        <option value="Euro 6">Euro 6</option>
                        <option value="Euro 5">Euro 5</option>
                        <option value="Euro 4">Euro 4</option>
                        <option value="Euro 3">Euro 3</option>
                    </select>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {[
                    { label: 'Roof Bars', key: 'roofBars' },
                    { label: 'Xenon Headlights', key: 'xenonHeadlights' },
                    { label: 'Traction Control', key: 'tractionControl' },
                    { label: 'Particular Filter', key: 'particleFilter' },
                    { label: 'Light Sensor', key: 'lightSensor' },
                    { label: 'Immobilizer', key: 'immobilizer' },
                    { label: 'Four Wheel Drive', key: 'fourWheelDrive' },
                    { label: 'Fog Lamp', key: 'fogLamp' },
                    { label: 'ESP', key: 'esp' },
                    { label: 'Daytime running lights', key: 'daytimeRunningLights' },
                    { label: 'Adaptive lighting', key: 'adaptiveLighting' },
                    { label: 'ABS', key: 'abs' }
                    ].map(item => (
                    <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                        type="checkbox"
                        checked={formData.environment[item.key] || false}
                        onChange={(e) => handleCheckboxChange('environment', item.key, e.target.checked)}
                        className="w-4 h-4"
                        />
                        <span className="text-sm">{item.label}</span>
                    </label>
                    ))}
                </div>
                </div>

                {/* Extras */}
                <div className="bg-white rounded-lg p-6 mb-6 border">
                <h2 className="text-xl font-semibold text-center mb-6">Extras</h2>
                
                <div className="grid grid-cols-4 gap-4">
                    {[
                    { label: 'Sports Suspension', key: 'sportsSuspension' },
                    { label: 'Sports Package', key: 'sportsPackage' },
                    { label: 'Sports Seats', key: 'sportsSeats' }
                    ].map(item => (
                    <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                        type="checkbox"
                        checked={formData.extras[item.key] || false}
                        onChange={(e) => handleCheckboxChange('extras', item.key, e.target.checked)}
                        className="w-4 h-4"
                        />
                        <span className="text-sm">{item.label}</span>
                    </label>
                    ))}
                </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-12 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : carId ? 'Update Vehicle' : 'Submit'}
                </button>
                </div>
            </div>
            </form>
        </div>
        </div>
    </div>
    </div>
  );
}

export default Editpage;