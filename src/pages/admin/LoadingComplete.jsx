import React, { useState, useEffect, useRef } from "react";
import { Filter, X, Search, Edit, CheckCircle, Clock, ChevronDown, Upload, Camera } from "lucide-react";

const LoadingComplete = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showFilters, setShowFilters] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [editingIndent, setEditingIndent] = useState(null);
  
  // Camera functionality
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [filters, setFilters] = useState({
    plantName: "",
    officeDispatcher: "",
    partyName: "",
    vehicleNo: "",
    commodityType: "",
    indentNo: "",
  });

  const [processForm, setProcessForm] = useState({
    munsiName: "",
    driverName: "",
    driverNumber: "",
    subCommodity1: "",
    noOfPkts1: "",
    subCommodity2: "",
    noOfPkts2: "",
    subCommodity3: "",
    noOfPkts3: "",
    totalPacket: 0,
    loadingBhartiSize: "",
    loadingQuantity: "",
    loadingPacketType: "",
    loadingPacketName: "",
    vehicleImage: null,
    imagePreview: null,
    loadingStatus: "Complete"
  });

  const [editForm, setEditForm] = useState({
    munsiName: "",
    driverName: "",
    driverNumber: "",
    subCommodity1: "",
    noOfPkts1: "",
    subCommodity2: "",
    noOfPkts2: "",
    subCommodity3: "",
    noOfPkts3: "",
    totalPacket: 0,
    loadingBhartiSize: "",
    loadingQuantity: "",
    loadingPacketType: "",
    loadingPacketName: "",
    vehicleImage: null,
    imagePreview: null,
    loadingStatus: "Complete"
  });

  // State for searchable dropdowns
  const [searchTerms, setSearchTerms] = useState({
    subCommodity1: "",
    subCommodity2: "",
    subCommodity3: "",
  });

  const [editSearchTerms, setEditSearchTerms] = useState({
    subCommodity1: "",
    subCommodity2: "",
    subCommodity3: "",
  });
  
  const [showDropdowns, setShowDropdowns] = useState({
    subCommodity1: false,
    subCommodity2: false,
    subCommodity3: false,
  });

  const [showEditDropdowns, setShowEditDropdowns] = useState({
    subCommodity1: false,
    subCommodity2: false,
    subCommodity3: false,
  });

  const [pendingIndents, setPendingIndents] = useState([]);
  const [historyIndents, setHistoryIndents] = useState([]);
  const [filteredPending, setFilteredPending] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Plant options
  const plantOptions = [
    'Shree Shyamji Paddy Processing Pvt. Ltd.',
    'Laddu Gopal Industries',
    'Radhe Govind Food Products',
    'Pellet Plant'
  ];

  // Office Dispatcher options
  const dispatcherOptions = [
    'MNG. BHAGHABA',
    'CRM ASHOK',
    'PYARI',
    'MANISH(UP)',
    'BINAY'
  ];

  // Munsi Name options
  const munsiOptions = [
    'FM PANDA',
    'SAHOO',
    'SUMAN',
    'KASHA',
    'TULSI',
    'BANCHHOR',
    'VINAY'
  ];

  // Commodity Type options (used for sub commodities)
  const commodityOptions = [
    'PADDY MOTA',
    'PADDY NEW',
    'PADDY IR',
    'CMR (FRK BOILED)',
    'CMR (NON FRK BOILED)',
    'CMR (FRK RAW)',
    'CMR (NON FRK RAW)',
    'RICE (FRK BOILED)',
    'RICE (NON FRK BOILED)',
    'RICE (FRK RAW)',
    'RICE (NON FRK RAW)',
    'MURI RICE',
    'REJECTION (BOILED)',
    'REJECTION (RAW)',
    'REJECTION (MURI)',
    'BROKEN (RAW SORTEX)',
    'BROKEN (RAW NON SORTEX)',
    'BROKEN (BOILED)',
    'RICE BRAN (BOILED)',
    'RICE BRAN (RAW)',
    'RICE BRAN (MURI)',
    'HUSK',
    'PELLETS (8 MM RICE HUSK)',
    'PELLETS (8 MM SAW DUST)',
    'PELLETS (8 MM GROUNDNUT)',
    'PELLETS (16 MM RICE HUSK)',
    'PELLETS (8 MM RICE HUSK & GROUNDNUT)',
    'PELLETS (16 MM GROUNDNUT)',
    'PELLETS (16 MM RICE HUSK & GROUNDNUT)',
    'BRIQUETTE (90 MM RICE HUSK)',
    'BRIQUETTE (90 MM GROUNDNUT)',
    'BRIQUETTE (90 MM SAWDUST)',
    'BRIQUETTE (90 MM RICE HUSK & GROUNDNUT)',
    'KAJU CHILKA',
    'RAKHAD',
    'PLASTIC PKT',
    'JUTE PKT'
  ];

  // Filtered options based on search
  const filteredSubCommodity1 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.subCommodity1.toLowerCase())
  );

  const filteredSubCommodity2 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.subCommodity2.toLowerCase())
  );

  const filteredSubCommodity3 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.subCommodity3.toLowerCase())
  );

  // Filtered options for edit modal
  const filteredEditSubCommodity1 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.subCommodity1.toLowerCase())
  );

  const filteredEditSubCommodity2 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.subCommodity2.toLowerCase())
  );

  const filteredEditSubCommodity3 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.subCommodity3.toLowerCase())
  );

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        const imageUrl = canvas.toDataURL('image/jpeg');
        
        if (showProcessModal) {
          setProcessForm(prev => ({
            ...prev,
            vehicleImage: file,
            imagePreview: imageUrl
          }));
        } else if (showEditModal) {
          setEditForm(prev => ({
            ...prev,
            vehicleImage: file,
            imagePreview: imageUrl
          }));
        }
        
        setShowCamera(false);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const openCamera = () => {
    setShowCamera(true);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const closeCamera = () => {
    setShowCamera(false);
    stopCamera();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Load data from localStorage
  useEffect(() => {
    loadIndents();
  }, []);

  // Apply filters whenever filters or data change
  useEffect(() => {
    applyFilters();
  }, [filters, pendingIndents, historyIndents]);

  // Calculate total packets whenever packet counts change
  useEffect(() => {
    const total = (parseInt(processForm.noOfPkts1) || 0) + 
                  (parseInt(processForm.noOfPkts2) || 0) + 
                  (parseInt(processForm.noOfPkts3) || 0);
    setProcessForm(prev => ({ ...prev, totalPacket: total }));
  }, [processForm.noOfPkts1, processForm.noOfPkts2, processForm.noOfPkts3]);

  useEffect(() => {
    const total = (parseInt(editForm.noOfPkts1) || 0) + 
                  (parseInt(editForm.noOfPkts2) || 0) + 
                  (parseInt(editForm.noOfPkts3) || 0);
    setEditForm(prev => ({ ...prev, totalPacket: total }));
  }, [editForm.noOfPkts1, editForm.noOfPkts2, editForm.noOfPkts3]);

  const loadIndents = () => {
    // Get processed indents from the previous page (Indent Processing History)
    const processedIndents = localStorage.getItem("indentHistory");
    
    if (processedIndents) {
      const parsedData = JSON.parse(processedIndents);
      
      // Filter to get only completed indents for pending loading complete
      const completedIndents = parsedData.filter(item => 
        item.vehicleReached === "Yes" && !item.loadingCompleted
      );
      
      setPendingIndents(completedIndents);
      setFilteredPending(completedIndents);
    }
    
    // Get loading complete history
    const savedHistory = localStorage.getItem("loadingCompleteHistory");
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setHistoryIndents(parsedHistory);
      setFilteredHistory(parsedHistory);
    }
  };

  const applyFilters = () => {
    let filteredPendingData = [...pendingIndents];
    let filteredHistoryData = [...historyIndents];

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filteredPendingData = filteredPendingData.filter((item) =>
          item[key]?.toLowerCase().includes(filters[key].toLowerCase())
        );
        filteredHistoryData = filteredHistoryData.filter((item) =>
          item[key]?.toLowerCase().includes(filters[key].toLowerCase())
        );
      }
    });

    setFilteredPending(filteredPendingData);
    setFilteredHistory(filteredHistoryData);
  };

  const handleClearFilters = () => {
    setFilters({
      plantName: "",
      officeDispatcher: "",
      partyName: "",
      vehicleNo: "",
      commodityType: "",
      indentNo: "",
    });
  };

  const handleProcessClick = (indent) => {
    setSelectedIndent(indent);
    setProcessForm({
      munsiName: "",
      driverName: "",
      driverNumber: "",
      subCommodity1: "",
      noOfPkts1: "",
      subCommodity2: "",
      noOfPkts2: "",
      subCommodity3: "",
      noOfPkts3: "",
      totalPacket: 0,
      loadingBhartiSize: "",
      loadingQuantity: "",
      loadingPacketType: "",
      loadingPacketName: "",
      vehicleImage: null,
      imagePreview: null,
      loadingStatus: "Complete",
      ...indent // Pre-fill with indent data
    });
    setShowProcessModal(true);
  };

  const handleEditClick = (indent) => {
    setEditingIndent(indent);
    setEditForm({
      munsiName: indent.munsiName || "",
      driverName: indent.driverName || "",
      driverNumber: indent.driverNumber || "",
      subCommodity1: indent.subCommodity1 || "",
      noOfPkts1: indent.noOfPkts1 || "",
      subCommodity2: indent.subCommodity2 || "",
      noOfPkts2: indent.noOfPkts2 || "",
      subCommodity3: indent.subCommodity3 || "",
      noOfPkts3: indent.noOfPkts3 || "",
      totalPacket: indent.totalPacket || 0,
      loadingBhartiSize: indent.loadingBhartiSize || "",
      loadingQuantity: indent.loadingQuantity || "",
      loadingPacketType: indent.loadingPacketType || "",
      loadingPacketName: indent.loadingPacketName || "",
      vehicleImage: indent.vehicleImage || null,
      imagePreview: indent.imagePreview || null,
      loadingStatus: indent.loadingStatus || "Complete"
    });
    setShowEditModal(true);
  };

  // Generic handler for dropdown selection
  const handleDropdownSelect = (field, value) => {
    setProcessForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSearchTerms((prev) => ({
      ...prev,
      [field]: "",
    }));
    setShowDropdowns((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  const handleEditDropdownSelect = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setEditSearchTerms((prev) => ({
      ...prev,
      [field]: "",
    }));
    setShowEditDropdowns((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  // Handler for search input changes
  const handleSearchChange = (field, value) => {
    setSearchTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
    setShowDropdowns((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleEditSearchChange = (field, value) => {
    setEditSearchTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
    setShowEditDropdowns((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Handler for dropdown focus
  const handleDropdownFocus = (field) => {
    setShowDropdowns((prev) => ({
      ...prev,
      [field]: true,
    }));
    setSearchTerms((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleEditDropdownFocus = (field) => {
    setShowEditDropdowns((prev) => ({
      ...prev,
      [field]: true,
    }));
    setEditSearchTerms((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // Handler for dropdown blur
  const handleDropdownBlur = (field) => {
    setTimeout(() => {
      setShowDropdowns((prev) => ({
        ...prev,
        [field]: false,
      }));
    }, 200);
  };

  const handleEditDropdownBlur = (field) => {
    setTimeout(() => {
      setShowEditDropdowns((prev) => ({
        ...prev,
        [field]: false,
      }));
    }, 200);
  };

  // Handler for regular input changes
  const handleProcessInputChange = (e) => {
    const { name, value } = e.target;
    setProcessForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageUpload = (e, formType = 'process') => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (formType === 'process') {
          setProcessForm(prev => ({
            ...prev,
            vehicleImage: file,
            imagePreview: reader.result
          }));
        } else {
          setEditForm(prev => ({
            ...prev,
            vehicleImage: file,
            imagePreview: reader.result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessSubmit = (e) => {
    e.preventDefault();

    // Move from pending to history
    const updatedPending = pendingIndents.filter(item => item.id !== selectedIndent.id);
    
    // Update the original indent data to mark as loading completed
    const originalIndents = JSON.parse(localStorage.getItem("indentHistory") || "[]");
    const updatedOriginalIndents = originalIndents.map(item =>
      item.id === selectedIndent.id
        ? { ...item, loadingCompleted: true }
        : item
    );

    const processedIndent = {
      ...processForm,
      ...selectedIndent, // Include all indent data
      id: selectedIndent.id,
      indentNo: selectedIndent.indentNo,
      loadingCompletedAt: new Date().toISOString(),
      originalData: { ...selectedIndent }
    };

    const updatedHistory = [...historyIndents, processedIndent];

    setPendingIndents(updatedPending);
    setHistoryIndents(updatedHistory);

    // Update localStorage
    localStorage.setItem("loadingCompletePending", JSON.stringify(updatedPending));
    localStorage.setItem("loadingCompleteHistory", JSON.stringify(updatedHistory));
    localStorage.setItem("indentHistory", JSON.stringify(updatedOriginalIndents));

    setShowProcessModal(false);
    setSelectedIndent(null);
    
    // Reset search terms and dropdowns
    setSearchTerms({
      subCommodity1: "",
      subCommodity2: "",
      subCommodity3: "",
    });
    
    setShowDropdowns({
      subCommodity1: false,
      subCommodity2: false,
      subCommodity3: false,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const updatedHistory = historyIndents.map(item =>
      item.id === editingIndent.id
        ? { 
            ...editForm,
            ...editingIndent, // Include all original data
            id: editingIndent.id,
            indentNo: editingIndent.indentNo,
            loadingCompletedAt: editingIndent.loadingCompletedAt,
            updatedAt: new Date().toISOString(),
            originalData: editingIndent.originalData || { ...editingIndent }
          }
        : item
    );

    setHistoryIndents(updatedHistory);
    localStorage.setItem("loadingCompleteHistory", JSON.stringify(updatedHistory));

    setShowEditModal(false);
    setEditingIndent(null);
    
    // Reset edit search terms and dropdowns
    setEditSearchTerms({
      subCommodity1: "",
      subCommodity2: "",
      subCommodity3: "",
    });
    
    setShowEditDropdowns({
      subCommodity1: false,
      subCommodity2: false,
      subCommodity3: false,
    });
  };

  const handleCancel = () => {
    setShowProcessModal(false);
    setSelectedIndent(null);
    
    setSearchTerms({
      subCommodity1: "",
      subCommodity2: "",
      subCommodity3: "",
    });
    
    setShowDropdowns({
      subCommodity1: false,
      subCommodity2: false,
      subCommodity3: false,
    });
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingIndent(null);
    
    setEditSearchTerms({
      subCommodity1: "",
      subCommodity2: "",
      subCommodity3: "",
    });
    
    setShowEditDropdowns({
      subCommodity1: false,
      subCommodity2: false,
      subCommodity3: false,
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Render searchable dropdown component
  const renderSearchableDropdown = (field, label, filteredOptions, placeholder, value) => (
    <div className="relative">
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={showDropdowns[field] ? searchTerms[field] : value}
          onChange={(e) => handleSearchChange(field, e.target.value)}
          onFocus={() => handleDropdownFocus(field)}
          onBlur={() => handleDropdownBlur(field)}
          className="w-full px-10 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder={placeholder}
          autoComplete="off"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>
      
      {showDropdowns[field] && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleDropdownSelect(field, option)}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No {label.toLowerCase()} found
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderEditSearchableDropdown = (field, label, filteredOptions, placeholder, value) => (
    <div className="relative">
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={showEditDropdowns[field] ? editSearchTerms[field] : value}
          onChange={(e) => handleEditSearchChange(field, e.target.value)}
          onFocus={() => handleEditDropdownFocus(field)}
          onBlur={() => handleEditDropdownBlur(field)}
          className="w-full px-10 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder={placeholder}
          autoComplete="off"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>
      
      {showEditDropdowns[field] && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleEditDropdownSelect(field, option)}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No {label.toLowerCase()} found
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Image upload section with camera option
  const renderImageUploadSection = (formType = 'process') => (
    <div className="md:col-span-2">
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        Vehicle Image
      </label>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            {formType === 'process' ? processForm.imagePreview : editForm.imagePreview ? (
              <img 
                src={formType === 'process' ? processForm.imagePreview : editForm.imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Upload Image</p>
              </div>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleImageUpload(e, formType)}
            />
          </label>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Upload vehicle image (optional)</p>
            <p className="text-xs text-gray-500">Supported formats: JPG, PNG, JPEG</p>
          </div>
        </div>
        
        {/* Camera Option */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Or</span>
          <button
            type="button"
            onClick={openCamera}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-900 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Take Photo with Camera
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[88vh] bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-4 lg:p-6 bg-gray-50">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Loading Complete</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="px-1.5 py-0.5 text-xs font-semibold text-white bg-red-800 rounded-full">
                      ●
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-4 lg:px-6">
          <div className="max-w-full mx-auto">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "pending"
                      ? "border-red-800 text-red-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending ({pendingIndents.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "history"
                      ? "border-red-800 text-red-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    History ({historyIndents.length})
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="flex-shrink-0 px-4 lg:px-6 pb-4 bg-gray-50">
            <div className="max-w-full mx-auto">
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quick Filters</h3>
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-red-800 hover:text-red-900 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {[
                    { key: 'indentNo', label: 'Indent No', placeholder: 'Search indent...' },
                    { key: 'plantName', label: 'Plant Name', placeholder: 'Search plant...' },
                    { key: 'officeDispatcher', label: 'Office Dispatcher', placeholder: 'Search dispatcher...' },
                    { key: 'partyName', label: 'Party Name', placeholder: 'Search party...' },
                    { key: 'vehicleNo', label: 'Vehicle No', placeholder: 'Search vehicle...' },
                    { key: 'commodityType', label: 'Commodity Type', placeholder: 'Search commodity...' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">
                        {label}
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 w-3 h-3 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={filters[key]}
                          onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                          placeholder={placeholder}
                          className="py-1.5 pr-2 pl-7 w-full text-xs rounded border border-gray-300 focus:ring-1 focus:ring-red-800 focus:border-transparent"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="flex-1 overflow-hidden px-4 lg:px-6 pb-4 lg:pb-6">
          <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            
            {/* Pending Table */}
            {activeTab === "pending" && (
              <>
                {/* Desktop View */}
                <div className="hidden lg:flex lg:flex-col lg:h-full lg:overflow-hidden">
                  <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-3">
                      <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{filteredPending.length}</span> pending loading indents
                      </div>
                      {hasActiveFilters && (
                        <div className="flex items-center gap-2 text-xs text-red-800">
                          <Filter className="w-3 h-3" />
                          <span>Filters Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <div className="min-w-full">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Action
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Indent No
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Plant Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Office Dispatcher
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Party Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Vehicle No
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Commodity Type
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              No. of PKTS
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Bharti Size
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Total Quantity
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Tare Weight
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Vehicle Reached
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredPending.length > 0 ? (
                            filteredPending.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                  <button
                                    onClick={() => handleProcessClick(item)}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90"
                                    style={{ backgroundColor: '#991b1b' }}
                                  >
                                    Process
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                  {item.indentNo}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                                  <div className="break-words" title={item.plantName}>
                                    {item.plantName}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                                  <div className="break-words" title={item.officeDispatcher}>
                                    {item.officeDispatcher}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                                  <div className="break-words" title={item.partyName}>
                                    {item.partyName}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-mono whitespace-nowrap">
                                  {item.vehicleNo}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                  {item.commodityType}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.noOfPkts || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.bhartiSize || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.totalQty || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.tyreWeight || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.vehicleReached || '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="12" className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col gap-2 items-center">
                                  <Clock className="w-8 h-8 text-gray-400" />
                                  <span>No pending loading complete records found</span>
                                  {hasActiveFilters && (
                                    <button
                                      onClick={handleClearFilters}
                                      className="text-sm text-red-800 hover:text-red-900 mt-2"
                                    >
                                      Clear filters to see all records
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden flex flex-col h-full overflow-hidden">
                  <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{filteredPending.length}</span> pending loading indents
                      </div>
                      {hasActiveFilters && (
                        <div className="flex items-center gap-1 text-xs text-red-800">
                          <Filter className="w-3 h-3" />
                          <span>Filters Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {filteredPending.length > 0 ? (
                      <div className="space-y-4">
                        {filteredPending.map((item) => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{item.indentNo}</h3>
                                  <p className="text-sm text-gray-600">{item.plantName}</p>
                                </div>
                                <button
                                  onClick={() => handleProcessClick(item)}
                                  className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90"
                                  style={{ backgroundColor: '#991b1b' }}
                                >
                                  Process
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Dispatcher</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.officeDispatcher}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Party</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.partyName}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Vehicle</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.vehicleNo}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Commodity</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.commodityType}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">PKTS</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.noOfPkts || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Bharti Size</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.bhartiSize || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Total Qty</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.totalQty || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Tare Weight</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.tyreWeight || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Vehicle Reached</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.vehicleReached || '-'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 items-center justify-center py-12 text-gray-500">
                        <Clock className="w-8 h-8 text-gray-400" />
                        <span>No pending loading complete records found</span>
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="text-sm text-red-800 hover:text-red-900 mt-2"
                          >
                            Clear filters to see all records
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* History Table */}
            {activeTab === "history" && (
              <>
                {/* Desktop View */}
                <div className="hidden lg:flex lg:flex-col lg:h-full lg:overflow-hidden">
                  <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-3">
                      <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{filteredHistory.length}</span> completed loading indents
                      </div>
                      {hasActiveFilters && (
                        <div className="flex items-center gap-2 text-xs text-red-800">
                          <Filter className="w-3 h-3" />
                          <span>Filters Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <div className="min-w-full">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Action
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Indent No
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Plant Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Office Dispatcher
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Party Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Vehicle No
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Commodity Type
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Tare Weight
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Munsi Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Driver Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Driver Number
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Sub Commodity 1
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              No. of PKTS 1
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Sub Commodity 2
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              No. of PKTS 2
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Sub Commodity 3
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              No. of PKTS 3
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Total Packet
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Bharti Size
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Quantity
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Packet Type
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Packet Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredHistory.length > 0 ? (
                            filteredHistory.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                  <button
                                    onClick={() => handleEditClick(item)}
                                    className="p-1 transition-colors hover:bg-blue-50 rounded text-blue-600"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                  {item.indentNo}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                                  <div className="break-words" title={item.plantName}>
                                    {item.plantName}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                                  <div className="break-words" title={item.officeDispatcher}>
                                    {item.officeDispatcher}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                                  <div className="break-words" title={item.partyName}>
                                    {item.partyName}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-mono whitespace-nowrap">
                                  {item.vehicleNo}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                  {item.commodityType}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.tyreWeight || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.munsiName || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.driverName || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.driverNumber || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.subCommodity1 || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.noOfPkts1 || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.subCommodity2 || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.noOfPkts2 || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.subCommodity3 || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.noOfPkts3 || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.totalPacket || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.loadingBhartiSize || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.loadingQuantity || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.loadingPacketType || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.loadingPacketName || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.loadingStatus || '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="23" className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col gap-2 items-center">
                                  <CheckCircle className="w-8 h-8 text-gray-400" />
                                  <span>No completed loading records found</span>
                                  {hasActiveFilters && (
                                    <button
                                      onClick={handleClearFilters}
                                      className="text-sm text-red-800 hover:text-red-900 mt-2"
                                    >
                                      Clear filters to see all records
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden flex flex-col h-full overflow-hidden">
                  <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{filteredHistory.length}</span> completed loading indents
                      </div>
                      {hasActiveFilters && (
                        <div className="flex items-center gap-1 text-xs text-red-800">
                          <Filter className="w-3 h-3" />
                          <span>Filters Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {filteredHistory.length > 0 ? (
                      <div className="space-y-4">
                        {filteredHistory.map((item) => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{item.indentNo}</h3>
                                  <p className="text-sm text-gray-600">{item.plantName}</p>
                                </div>
                                <button
                                  onClick={() => handleEditClick(item)}
                                  className="p-1 transition-colors hover:bg-blue-50 rounded text-blue-600"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Dispatcher</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.officeDispatcher}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Party</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.partyName}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Vehicle</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.vehicleNo}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Commodity</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.commodityType}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Tare Weight</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.tyreWeight || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Munsi Name</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.munsiName || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Driver Name</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.driverName || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Driver Number</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.driverNumber || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Sub Comm 1</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.subCommodity1 || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">PKTS 1</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.noOfPkts1 || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Sub Comm 2</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.subCommodity2 || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">PKTS 2</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.noOfPkts2 || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Sub Comm 3</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.subCommodity3 || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">PKTS 3</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.noOfPkts3 || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Total Packet</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.totalPacket || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Loading Bharti</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.loadingBhartiSize || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Loading Qty</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.loadingQuantity || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Packet Type</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.loadingPacketType || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Packet Name</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.loadingPacketName || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Status</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.loadingStatus || '-'}
                                  </span>
                                </div>
                              </div>

                              {item.imagePreview && (
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Vehicle Image</span>
                                  <img 
                                    src={item.imagePreview} 
                                    alt="Vehicle" 
                                    className="mt-1 w-20 h-20 object-cover rounded border"
                                  />
                                </div>
                              )}
                              
                              {item.loadingCompletedAt && (
                                <div className="text-xs text-gray-500">
                                  Loading Completed: {new Date(item.loadingCompletedAt).toLocaleString()}
                                  {item.updatedAt && item.updatedAt !== item.loadingCompletedAt && (
                                    <span> • Updated: {new Date(item.updatedAt).toLocaleString()}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 items-center justify-center py-12 text-gray-500">
                        <CheckCircle className="w-8 h-8 text-gray-400" />
                        <span>No completed loading records found</span>
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="text-sm text-red-800 hover:text-red-900 mt-2"
                          >
                            Clear filters to see all records
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Process Modal */}
      {showProcessModal && selectedIndent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                Complete Loading - {selectedIndent.indentNo}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Pre-filled Indent Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Indent Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Indent No</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.indentNo}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Plant Name</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.plantName}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Office Dispatcher</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.officeDispatcher}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Party Name</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.partyName}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Vehicle No</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.vehicleNo}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Commodity Type</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.commodityType}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">No. of PKTS</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.noOfPkts || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Bharti Size</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.bhartiSize || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Total Quantity</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.totalQty || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Tare Weight</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.tyreWeight || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading Complete Form */}
              <form onSubmit={handleProcessSubmit}>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Loading Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  {/* Munsi Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Munsi Name <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="munsiName"
                      value={processForm.munsiName}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      required
                    >
                      <option value="">Select Munsi</option>
                      {munsiOptions.map((munsi, index) => (
                        <option key={index} value={munsi}>{munsi}</option>
                      ))}
                    </select>
                  </div>

                  {/* Driver Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Driver Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="driverName"
                      value={processForm.driverName}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter driver name"
                      required
                      autoComplete="off"
                    />
                  </div>

                  {/* Driver Number */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Driver Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="driverNumber"
                      value={processForm.driverNumber}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter driver number"
                      required
                      autoComplete="off"
                    />
                  </div>

                  {/* Sub Commodity 1 */}
                  {renderSearchableDropdown(
                    'subCommodity1',
                    'Sub Commodity 1',
                    filteredSubCommodity1,
                    'Search commodity...',
                    processForm.subCommodity1
                  )}

                  {/* No. of PKTS 1 */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      No. of PKTS 1
                    </label>
                    <input
                      type="number"
                      name="noOfPkts1"
                      value={processForm.noOfPkts1}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter number of packets"
                    />
                  </div>

                  {/* Sub Commodity 2 */}
                  {renderSearchableDropdown(
                    'subCommodity2',
                    'Sub Commodity 2',
                    filteredSubCommodity2,
                    'Search commodity...',
                    processForm.subCommodity2
                  )}

                  {/* No. of PKTS 2 */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      No. of PKTS 2
                    </label>
                    <input
                      type="number"
                      name="noOfPkts2"
                      value={processForm.noOfPkts2}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter number of packets"
                    />
                  </div>

                  {/* Sub Commodity 3 */}
                  {renderSearchableDropdown(
                    'subCommodity3',
                    'Sub Commodity 3',
                    filteredSubCommodity3,
                    'Search commodity...',
                    processForm.subCommodity3
                  )}

                  {/* No. of PKTS 3 */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      No. of PKTS 3
                    </label>
                    <input
                      type="number"
                      name="noOfPkts3"
                      value={processForm.noOfPkts3}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter number of packets"
                    />
                  </div>

                  {/* Total Packet (Auto-calculated) */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Total Packet
                    </label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {processForm.totalPacket}
                    </div>
                  </div>

                  {/* Loading Bharti Size */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Bharti Size
                    </label>
                    <input
                      type="text"
                      name="loadingBhartiSize"
                      value={processForm.loadingBhartiSize}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter loading bharti size"
                      autoComplete="off"
                    />
                  </div>

                  {/* Loading Quantity */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Quantity
                    </label>
                    <input
                      type="number"
                      name="loadingQuantity"
                      value={processForm.loadingQuantity}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter loading quantity"
                    />
                  </div>

                  {/* Loading Packet Type */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Packet Type
                    </label>
                    <input
                      type="text"
                      name="loadingPacketType"
                      value={processForm.loadingPacketType}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter loading packet type"
                      autoComplete="off"
                    />
                  </div>

                  {/* Loading Packet Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Packet Name
                    </label>
                    <input
                      type="text"
                      name="loadingPacketName"
                      value={processForm.loadingPacketName}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter loading packet name"
                      autoComplete="off"
                    />
                  </div>

                  {/* Vehicle Image */}
                  {renderImageUploadSection('process')}

                  {/* Loading Status */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Status <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="loadingStatus"
                      value={processForm.loadingStatus}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      required
                    >
                      <option value="Complete">Complete</option>
                      <option value="Not Complete">Not Complete</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end p-4 border-t border-gray-200 sticky bottom-0 bg-white mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all hover:opacity-90"
                    style={{ backgroundColor: '#991b1b' }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingIndent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Loading Complete - {editingIndent.indentNo}
              </h3>
              <button
                onClick={handleEditCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              <form onSubmit={handleEditSubmit}>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Edit Loading Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  {/* Munsi Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Munsi Name
                    </label>
                    <select
                      name="munsiName"
                      value={editForm.munsiName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    >
                      <option value="">Select Munsi</option>
                      {munsiOptions.map((munsi, index) => (
                        <option key={index} value={munsi}>{munsi}</option>
                      ))}
                    </select>
                  </div>

                  {/* Driver Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      name="driverName"
                      value={editForm.driverName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter driver name"
                      autoComplete="off"
                    />
                  </div>

                  {/* Driver Number */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Driver Number
                    </label>
                    <input
                      type="text"
                      name="driverNumber"
                      value={editForm.driverNumber}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter driver number"
                      autoComplete="off"
                    />
                  </div>

                  {/* Sub Commodity 1 */}
                  {renderEditSearchableDropdown(
                    'subCommodity1',
                    'Sub Commodity 1',
                    filteredEditSubCommodity1,
                    'Search commodity...',
                    editForm.subCommodity1
                  )}

                  {/* No. of PKTS 1 */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      No. of PKTS 1
                    </label>
                    <input
                      type="number"
                      name="noOfPkts1"
                      value={editForm.noOfPkts1}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter number of packets"
                    />
                  </div>

                  {/* Sub Commodity 2 */}
                  {renderEditSearchableDropdown(
                    'subCommodity2',
                    'Sub Commodity 2',
                    filteredEditSubCommodity2,
                    'Search commodity...',
                    editForm.subCommodity2
                  )}

                  {/* No. of PKTS 2 */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      No. of PKTS 2
                    </label>
                    <input
                      type="number"
                      name="noOfPkts2"
                      value={editForm.noOfPkts2}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter number of packets"
                    />
                  </div>

                  {/* Sub Commodity 3 */}
                  {renderEditSearchableDropdown(
                    'subCommodity3',
                    'Sub Commodity 3',
                    filteredEditSubCommodity3,
                    'Search commodity...',
                    editForm.subCommodity3
                  )}

                  {/* No. of PKTS 3 */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      No. of PKTS 3
                    </label>
                    <input
                      type="number"
                      name="noOfPkts3"
                      value={editForm.noOfPkts3}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter number of packets"
                    />
                  </div>

                  {/* Total Packet (Auto-calculated) */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Total Packet
                    </label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {editForm.totalPacket}
                    </div>
                  </div>

                  {/* Loading Bharti Size */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Bharti Size
                    </label>
                    <input
                      type="text"
                      name="loadingBhartiSize"
                      value={editForm.loadingBhartiSize}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter loading bharti size"
                      autoComplete="off"
                    />
                  </div>

                  {/* Loading Quantity */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Quantity
                    </label>
                    <input
                      type="number"
                      name="loadingQuantity"
                      value={editForm.loadingQuantity}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter loading quantity"
                    />
                  </div>

                  {/* Loading Packet Type */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Packet Type
                    </label>
                    <input
                      type="text"
                      name="loadingPacketType"
                      value={editForm.loadingPacketType}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter loading packet type"
                      autoComplete="off"
                    />
                  </div>

                  {/* Loading Packet Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Packet Name
                    </label>
                    <input
                      type="text"
                      name="loadingPacketName"
                      value={editForm.loadingPacketName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter loading packet name"
                      autoComplete="off"
                    />
                  </div>

                  {/* Vehicle Image */}
                  {renderImageUploadSection('edit')}

                  {/* Loading Status */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Status
                    </label>
                    <select
                      name="loadingStatus"
                      value={editForm.loadingStatus}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    >
                      <option value="Complete">Complete</option>
                      <option value="Not Complete">Not Complete</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end p-4 border-t border-gray-200 sticky bottom-0 bg-white mt-6">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all hover:opacity-90"
                    style={{ backgroundColor: '#991b1b' }}
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
              <button
                onClick={closeCamera}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-white text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mt-4 gap-4">
                <button
                  onClick={closeCamera}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={captureImage}
                  disabled={!isCameraActive}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Capture Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingComplete;