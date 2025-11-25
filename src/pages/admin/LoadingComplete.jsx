import React, { useState, useEffect } from "react";
import { Filter, X, Search, Edit, CheckCircle, Clock, ChevronDown, Upload, Camera } from "lucide-react";

const LoadingComplete = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showFilters, setShowFilters] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [editingIndent, setEditingIndent] = useState(null);
  
  const [filters, setFilters] = useState({
    plantName: "",
    officeDispatcher: "",
    partyName: "",
    vehicleNo: "",
    commodityType: "",
    indentNo: "",
  });

  const [processForm, setProcessForm] = useState({
    vehicleReached: "Yes",
    status: "Complete",
    munsiName: "",
    packetType: "",
    packetName: "",
    packetImage: null,
    imagePreview: null
  });

  const [editForm, setEditForm] = useState({
    plantName: "",
    officeDispatcher: "",
    partyName: "",
    vehicleNo: "",
    commodityType: "",
    noOfPkts: "",
    bhartiSize: "",
    totalQty: "",
    tyreWeight: "",
    vehicleReached: "Yes",
    status: "Complete",
    munsiName: "",
    packetType: "",
    packetName: "",
    packetImage: null,
    imagePreview: null,
    remarks: ""
  });

  // State for searchable dropdowns in process modal
  const [searchTerms, setSearchTerms] = useState({
    plantName: "",
    officeDispatcher: "",
    commodityType: "",
    munsiName: "",
  });

  const [editSearchTerms, setEditSearchTerms] = useState({
    plantName: "",
    officeDispatcher: "",
    commodityType: "",
    munsiName: "",
  });
  
  const [showDropdowns, setShowDropdowns] = useState({
    plantName: false,
    officeDispatcher: false,
    commodityType: false,
    munsiName: false,
  });

  const [showEditDropdowns, setShowEditDropdowns] = useState({
    plantName: false,
    officeDispatcher: false,
    commodityType: false,
    munsiName: false,
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

  // Complete Commodity Type options
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
  const filteredPlants = plantOptions.filter(plant =>
    plant.toLowerCase().includes(searchTerms.plantName.toLowerCase())
  );

  const filteredDispatchers = dispatcherOptions.filter(dispatcher =>
    dispatcher.toLowerCase().includes(searchTerms.officeDispatcher.toLowerCase())
  );

  const filteredCommodities = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.commodityType.toLowerCase())
  );

  const filteredMunsi = munsiOptions.filter(munsi =>
    munsi.toLowerCase().includes(searchTerms.munsiName.toLowerCase())
  );

  // Filtered options for edit modal
  const filteredEditPlants = plantOptions.filter(plant =>
    plant.toLowerCase().includes(editSearchTerms.plantName.toLowerCase())
  );

  const filteredEditDispatchers = dispatcherOptions.filter(dispatcher =>
    dispatcher.toLowerCase().includes(editSearchTerms.officeDispatcher.toLowerCase())
  );

  const filteredEditCommodities = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.commodityType.toLowerCase())
  );

  const filteredEditMunsi = munsiOptions.filter(munsi =>
    munsi.toLowerCase().includes(editSearchTerms.munsiName.toLowerCase())
  );

  // Load data from localStorage - connected with previous page
  useEffect(() => {
    loadIndents();
  }, []);

  // Apply filters whenever filters or data change
  useEffect(() => {
    applyFilters();
  }, [filters, pendingIndents, historyIndents]);

  const loadIndents = () => {
    // Get processed indents from the previous page (Indent Processing History)
    const processedIndents = localStorage.getItem("indentHistory");
    
    if (processedIndents) {
      const parsedData = JSON.parse(processedIndents);
      
      // Filter to get only completed indents for pending loading complete
      const completedIndents = parsedData.filter(item => 
        item.status === "Complete" && !item.loadingCompleted
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
    // Filter pending indents
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
      vehicleReached: "Yes",
      status: "Complete",
      munsiName: "",
      packetType: "",
      packetName: "",
      packetImage: null,
      imagePreview: null,
      ...indent // Pre-fill with indent data
    });
    setShowProcessModal(true);
  };

  // Edit button handler - opens popup form
  const handleEditClick = (indent) => {
    setEditingIndent(indent);
    setEditForm({
      plantName: indent.plantName || "",
      officeDispatcher: indent.officeDispatcher || "",
      partyName: indent.partyName || "",
      vehicleNo: indent.vehicleNo || "",
      commodityType: indent.commodityType || "",
      noOfPkts: indent.noOfPkts || "",
      bhartiSize: indent.bhartiSize || "",
      totalQty: indent.totalQty || "",
      tyreWeight: indent.tyreWeight || "",
      vehicleReached: indent.vehicleReached || "Yes",
      status: indent.status || "Complete",
      munsiName: indent.munsiName || "",
      packetType: indent.packetType || "",
      packetName: indent.packetName || "",
      packetImage: indent.packetImage || null,
      imagePreview: indent.imagePreview || null,
      remarks: indent.remarks || ""
    });
    setShowEditModal(true);
  };

  // Generic handler for dropdown selection in process modal
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

  // Generic handler for dropdown selection in edit modal
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

  // Handler for search input changes in process modal
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

  // Handler for search input changes in edit modal
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

  // Handler for dropdown focus in process modal
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

  // Handler for dropdown focus in edit modal
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

  // Handler for dropdown blur in process modal
  const handleDropdownBlur = (field) => {
    setTimeout(() => {
      setShowDropdowns((prev) => ({
        ...prev,
        [field]: false,
      }));
    }, 200);
  };

  // Handler for dropdown blur in edit modal
  const handleEditDropdownBlur = (field) => {
    setTimeout(() => {
      setShowEditDropdowns((prev) => ({
        ...prev,
        [field]: false,
      }));
    }, 200);
  };

  // Handler for regular input changes in process modal
  const handleProcessInputChange = (e) => {
    const { name, value } = e.target;
    setProcessForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for regular input changes in edit modal
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
            packetImage: file,
            imagePreview: reader.result
          }));
        } else {
          setEditForm(prev => ({
            ...prev,
            packetImage: file,
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
      plantName: "",
      officeDispatcher: "",
      commodityType: "",
      munsiName: "",
    });
    
    setShowDropdowns({
      plantName: false,
      officeDispatcher: false,
      commodityType: false,
      munsiName: false,
    });
  };

  // Handle edit form submission
  const handleEditSubmit = (e) => {
    e.preventDefault();

    const updatedHistory = historyIndents.map(item =>
      item.id === editingIndent.id
        ? { 
            ...editForm,
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
      plantName: "",
      officeDispatcher: "",
      commodityType: "",
      munsiName: "",
    });
    
    setShowEditDropdowns({
      plantName: false,
      officeDispatcher: false,
      commodityType: false,
      munsiName: false,
    });
  };

  const handleCancel = () => {
    setShowProcessModal(false);
    setSelectedIndent(null);
    
    // Reset search terms and dropdowns
    setSearchTerms({
      plantName: "",
      officeDispatcher: "",
      commodityType: "",
      munsiName: "",
    });
    
    setShowDropdowns({
      plantName: false,
      officeDispatcher: false,
      commodityType: false,
      munsiName: false,
    });
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingIndent(null);
    
    // Reset edit search terms and dropdowns
    setEditSearchTerms({
      plantName: "",
      officeDispatcher: "",
      commodityType: "",
      munsiName: "",
    });
    
    setShowEditDropdowns({
      plantName: false,
      officeDispatcher: false,
      commodityType: false,
      munsiName: false,
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Render searchable dropdown component for process modal
  const renderSearchableDropdown = (field, label, options, filteredOptions, placeholder, value) => (
    <div className="relative">
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label} <span className="text-red-600">*</span>
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
      
      {/* Dropdown Menu */}
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

  // Render searchable dropdown component for edit modal
  const renderEditSearchableDropdown = (field, label, options, filteredOptions, placeholder, value) => (
    <div className="relative">
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label} <span className="text-red-600">*</span>
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
      
      {/* Dropdown Menu */}
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

  // Render searchable dropdown for Munsi Name in process modal
  const renderMunsiDropdown = (field, label, options, filteredOptions, placeholder, value) => (
    <div className="relative">
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label} <span className="text-red-600">*</span>
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
      
      {/* Dropdown Menu */}
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

  // Render searchable dropdown for Munsi Name in edit modal
  const renderEditMunsiDropdown = (field, label, options, filteredOptions, placeholder, value) => (
    <div className="relative">
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label} <span className="text-red-600">*</span>
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
      
      {/* Dropdown Menu */}
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

  return (
    <div className="h-[88vh] bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Quick Actions */}
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

        {/* Compact Filters Section */}
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
                              Tyre Weight
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Vehicle Reached
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Status
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
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.status || '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="13" className="px-6 py-12 text-center text-gray-500">
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
                                  <span className="text-xs font-medium text-gray-600 block">Tyre Weight</span>
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
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Status</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.status || '-'}
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
                              No. of PKTS
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Bharti Size
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Total Quantity
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Tyre Weight
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Munsi Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Packet Type
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Packet Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Status
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
                                  {item.munsiName || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.packetType || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.packetName || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.status || '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="15" className="px-6 py-12 text-center text-gray-500">
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
                                  <span className="text-xs font-medium text-gray-600 block">Tyre Weight</span>
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
                                  <span className="text-xs font-medium text-gray-600 block">Packet Type</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.packetType || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Packet Name</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.packetName || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Status</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.status || '-'}
                                  </span>
                                </div>
                              </div>

                              {item.imagePreview && (
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Packet Image</span>
                                  <img 
                                    src={item.imagePreview} 
                                    alt="Packet" 
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
              {/* Editable Indent Summary Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Indent Summary (Editable)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Plant Name - Searchable Dropdown */}
                  {renderSearchableDropdown(
                    'plantName',
                    'Plant Name',
                    plantOptions,
                    filteredPlants,
                    'Search plant...',
                    processForm.plantName
                  )}

                  {/* Office Dispatcher - Searchable Dropdown */}
                  {renderSearchableDropdown(
                    'officeDispatcher',
                    'Office Dispatcher',
                    dispatcherOptions,
                    filteredDispatchers,
                    'Search dispatcher...',
                    processForm.officeDispatcher
                  )}

                  {/* Party Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Party Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="partyName"
                      value={processForm.partyName || ''}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter party name"
                      autoComplete="off"
                    />
                  </div>

                  {/* Vehicle No */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Vehicle No <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicleNo"
                      value={processForm.vehicleNo || ''}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter vehicle number"
                      autoComplete="off"
                    />
                  </div>

                  {/* Commodity Type - Searchable Dropdown */}
                  {renderSearchableDropdown(
                    'commodityType',
                    'Commodity Type',
                    commodityOptions,
                    filteredCommodities,
                    'Search commodity...',
                    processForm.commodityType
                  )}

                  {/* No. of PKTS */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      No. of PKTS
                    </label>
                    <input
                      type="number"
                      name="noOfPkts"
                      value={processForm.noOfPkts || ''}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter number of packets"
                    />
                  </div>

                  {/* Bharti Size */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Bharti Size
                    </label>
                    <input
                      type="text"
                      name="bhartiSize"
                      value={processForm.bhartiSize || ''}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter bharti size"
                      autoComplete="off"
                    />
                  </div>

                  {/* Total Quantity */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Total Quantity
                    </label>
                    <input
                      type="number"
                      name="totalQty"
                      value={processForm.totalQty || ''}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter total quantity"
                    />
                  </div>

                  {/* Tyre Weight */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Tyre Weight
                    </label>
                    <input
                      type="number"
                      name="tyreWeight"
                      value={processForm.tyreWeight || ''}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter tyre weight"
                    />
                  </div>
                </div>
              </div>

              {/* Loading Complete Form */}
              <form onSubmit={handleProcessSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Munsi Name - Searchable Dropdown */}
                  {renderMunsiDropdown(
                    'munsiName',
                    'Munsi Name',
                    munsiOptions,
                    filteredMunsi,
                    'Search munsi...',
                    processForm.munsiName
                  )}

                  {/* Packet Type */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Packet Type <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="packetType"
                      value={processForm.packetType}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter packet type"
                      required
                      autoComplete="off"
                    />
                  </div>

                  {/* Packet Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Packet Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="packetName"
                      value={processForm.packetName}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter packet name"
                      required
                      autoComplete="off"
                    />
                  </div>

                  {/* Packet Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Packet Image
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        {processForm.imagePreview ? (
                          <img 
                            src={processForm.imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Camera className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">Upload Image</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'process')}
                        />
                      </label>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">Upload packet image (optional)</p>
                        <p className="text-xs text-gray-500">Supported formats: JPG, PNG, JPEG</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Status <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="status"
                      value={processForm.status}
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
                    Complete Loading
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plant Name - Searchable Dropdown */}
                  {renderEditSearchableDropdown(
                    'plantName',
                    'Plant Name',
                    plantOptions,
                    filteredEditPlants,
                    'Search plant...',
                    editForm.plantName
                  )}

                  {/* Office Dispatcher - Searchable Dropdown */}
                  {renderEditSearchableDropdown(
                    'officeDispatcher',
                    'Office Dispatcher',
                    dispatcherOptions,
                    filteredEditDispatchers,
                    'Search dispatcher...',
                    editForm.officeDispatcher
                  )}

                  {/* Party Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Party Name
                    </label>
                    <input
                      type="text"
                      name="partyName"
                      value={editForm.partyName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* Vehicle No */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Vehicle No
                    </label>
                    <input
                      type="text"
                      name="vehicleNo"
                      value={editForm.vehicleNo}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* Commodity Type - Searchable Dropdown */}
                  {renderEditSearchableDropdown(
                    'commodityType',
                    'Commodity Type',
                    commodityOptions,
                    filteredEditCommodities,
                    'Search commodity...',
                    editForm.commodityType
                  )}

                  {/* No. of PKTS */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      No. of PKTS
                    </label>
                    <input
                      type="number"
                      name="noOfPkts"
                      value={editForm.noOfPkts}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    />
                  </div>

                  {/* Bharti Size */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Bharti Size
                    </label>
                    <input
                      type="text"
                      name="bhartiSize"
                      value={editForm.bhartiSize}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* Total Quantity */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Total Quantity
                    </label>
                    <input
                      type="number"
                      name="totalQty"
                      value={editForm.totalQty}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    />
                  </div>

                  {/* Tyre Weight */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Tyre Weight
                    </label>
                    <input
                      type="number"
                      name="tyreWeight"
                      value={editForm.tyreWeight}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    />
                  </div>

                  {/* Munsi Name - Searchable Dropdown */}
                  {renderEditMunsiDropdown(
                    'munsiName',
                    'Munsi Name',
                    munsiOptions,
                    filteredEditMunsi,
                    'Search munsi...',
                    editForm.munsiName
                  )}

                  {/* Packet Type */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Packet Type
                    </label>
                    <input
                      type="text"
                      name="packetType"
                      value={editForm.packetType}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* Packet Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Packet Name
                    </label>
                    <input
                      type="text"
                      name="packetName"
                      value={editForm.packetName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* Packet Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Packet Image
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        {editForm.imagePreview ? (
                          <img 
                            src={editForm.imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Camera className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">Upload Image</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'edit')}
                        />
                      </label>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">Upload packet image (optional)</p>
                        <p className="text-xs text-gray-500">Supported formats: JPG, PNG, JPEG</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    >
                      <option value="Complete">Complete</option>
                      <option value="Not Complete">Not Complete</option>
                    </select>
                  </div>

                  {/* Remarks */}
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={editForm.remarks || ''}
                      onChange={handleEditInputChange}
                      rows="3"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      placeholder="Enter remarks"
                      autoComplete="off"
                    />
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
    </div>
  );
};

export default LoadingComplete;