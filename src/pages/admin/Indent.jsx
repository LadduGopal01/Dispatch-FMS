import React, { useState, useEffect } from "react";
import { Calendar, Filter, X, Plus, Search, Trash2, ChevronDown, ChevronUp, Edit } from "lucide-react";

const IndentPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [indents, setIndents] = useState([]);
  const [filteredIndents, setFilteredIndents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [editingIndent, setEditingIndent] = useState(null);
  const [filters, setFilters] = useState({
    plantName: "",
    officeDispatcher: "",
    partyName: "",
    vehicleNo: "",
    commodityType: "",
    indentNo: "",
  });

  const [formData, setFormData] = useState({
    plantName: "",
    officeDispatcher: "",
    partyName: "",
    vehicleNo: "",
    commodityType: "",
    noOfPkts: "",
    bhartiSize: "",
    totalQty: "",
    tyreWeight: "",
    remarks: "",
  });

  // State for searchable dropdowns
  const [searchTerms, setSearchTerms] = useState({
    plantName: "",
    officeDispatcher: "",
    commodityType: "",
  });
  
  const [showDropdowns, setShowDropdowns] = useState({
    plantName: false,
    officeDispatcher: false,
    commodityType: false,
  });

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

  // Generate Indent Number - FIXED VERSION
  const generateIndentNumber = () => {
    try {
      const savedIndents = localStorage.getItem("indents");
      if (savedIndents) {
        const parsedIndents = JSON.parse(savedIndents);
        const lastNumber = parsedIndents.length;
        return `IN-${String(lastNumber + 1).padStart(3, '0')}`;
      }
      return 'IN-001';
    } catch (error) {
      console.error('Error generating indent number:', error);
      return 'IN-001';
    }
  };

  // Load data from localStorage on mount - FIXED VERSION
  useEffect(() => {
    // In IndentPage, update the loadIndents function:
const loadIndents = () => {
  try {
    const saved = localStorage.getItem("indents");
    const savedHistory = localStorage.getItem("indentHistory");
    
    let allIndents = [];
    
    if (saved) {
      const parsedData = JSON.parse(saved);
      allIndents = [...parsedData];
    }
    
    // Also include processed indents from history
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      // Mark history items as processed
      const processedIndents = parsedHistory.map(item => ({
        ...item,
        isProcessed: true
      }));
      allIndents = [...allIndents, ...processedIndents];
    }
    
    console.log('All indents loaded:', allIndents);
    setIndents(allIndents);
    setFilteredIndents(allIndents);
    
  } catch (error) {
    console.error('Error loading indents:', error);
    setIndents([]);
    setFilteredIndents([]);
  }
};

    loadIndents();
  }, []);

  // Apply filters whenever filters or indents change
  useEffect(() => {
    applyFilters();
  }, [filters, indents]);

  const applyFilters = () => {
    let filtered = [...indents];

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filtered = filtered.filter((item) =>
          item[key]?.toLowerCase().includes(filters[key].toLowerCase())
        );
      }
    });

    setFilteredIndents(filtered);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generic handler for dropdown selection
  const handleDropdownSelect = (field, value) => {
    setFormData((prev) => ({
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

  // Handler for dropdown blur
  const handleDropdownBlur = (field) => {
    setTimeout(() => {
      setShowDropdowns((prev) => ({
        ...prev,
        [field]: false,
      }));
    }, 200);
  };

  // FIXED SUBMIT HANDLER
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const requiredFields = ['plantName', 'officeDispatcher', 'partyName', 'vehicleNo', 'commodityType'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const newIndent = {
        id: editingIndent ? editingIndent.id : Date.now(),
        indentNo: editingIndent ? editingIndent.indentNo : generateIndentNumber(),
        ...formData,
      };

      console.log('Saving indent:', newIndent); // Debug log

      let updatedIndents;
      if (editingIndent) {
        // Update existing indent
        updatedIndents = indents.map(item => 
          item.id === editingIndent.id ? newIndent : item
        );
      } else {
        // Add new indent
        updatedIndents = [...indents, newIndent];
      }

      setIndents(updatedIndents);
      localStorage.setItem("indents", JSON.stringify(updatedIndents));
      console.log('Saved to localStorage:', updatedIndents); // Debug log

      // Reset form
      setFormData({
        plantName: "",
        officeDispatcher: "",
        partyName: "",
        vehicleNo: "",
        commodityType: "",
        noOfPkts: "",
        bhartiSize: "",
        totalQty: "",
        tyreWeight: "",
        remarks: "",
      });
      
      // Reset search terms and dropdowns
      setSearchTerms({
        plantName: "",
        officeDispatcher: "",
        commodityType: "",
      });
      
      setShowDropdowns({
        plantName: false,
        officeDispatcher: false,
        commodityType: false,
      });
      
      setEditingIndent(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving indent:', error);
      alert('Error saving indent. Please try again.');
    }
  };

  const handleEdit = (indent) => {
    setFormData({
      plantName: indent.plantName || "",
      officeDispatcher: indent.officeDispatcher || "",
      partyName: indent.partyName || "",
      vehicleNo: indent.vehicleNo || "",
      commodityType: indent.commodityType || "",
      noOfPkts: indent.noOfPkts || "",
      bhartiSize: indent.bhartiSize || "",
      totalQty: indent.totalQty || "",
      tyreWeight: indent.tyreWeight || "",
      remarks: indent.remarks || "",
    });
    setEditingIndent(indent);
    setShowModal(true);
  };

  const handleDelete = (id) => {
  if (window.confirm("Are you sure you want to delete this indent?")) {
    try {
      // Remove from main indents
      const updatedIndents = indents.filter((item) => item.id !== id);
      setIndents(updatedIndents);
      localStorage.setItem("indents", JSON.stringify(updatedIndents));
      
      // Also remove from history if it exists there
      const savedHistory = localStorage.getItem("indentHistory");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        const updatedHistory = parsedHistory.filter((item) => item.id !== id);
        localStorage.setItem("indentHistory", JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Error deleting indent:', error);
      alert('Error deleting indent. Please try again.');
    }
  }
};

  const handleCancel = () => {
    setFormData({
      plantName: "",
      officeDispatcher: "",
      partyName: "",
      vehicleNo: "",
      commodityType: "",
      noOfPkts: "",
      bhartiSize: "",
      totalQty: "",
      tyreWeight: "",
      remarks: "",
    });
    
    // Reset search terms and dropdowns
    setSearchTerms({
      plantName: "",
      officeDispatcher: "",
      commodityType: "",
    });
    
    setShowDropdowns({
      plantName: false,
      officeDispatcher: false,
      commodityType: false,
    });
    
    setEditingIndent(null);
    setShowModal(false);
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // ADD DEBUG FUNCTION
  const debugLocalStorage = () => {
    const data = localStorage.getItem("indents");
    console.log('Current localStorage data:', data);
    console.log('Current indents state:', indents);
    console.log('Current filteredIndents:', filteredIndents);
  };

  // Render searchable dropdown component
  const renderSearchableDropdown = (field, label, options, filteredOptions, placeholder) => (
    <div className="relative">
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label} <span className="text-red-600">*</span>
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={showDropdowns[field] ? searchTerms[field] : formData[field]}
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

  return (
    <div className="h-[88vh] bg-gray-50 flex flex-col overflow-hidden">
      {/* DEBUG BUTTON - Remove in production */}
      <button 
        onClick={debugLocalStorage}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-md text-xs z-50"
        style={{display: 'none'}} // Hidden by default, change to 'block' to debug
      >
        Debug
      </button>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Quick Actions */}
        <div className="flex-shrink-0 p-4 lg:p-6 bg-gray-50">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Indent Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Total Indents: {indents.length} | Showing: {filteredIndents.length}
                </p>
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
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-md transition-all hover:opacity-90"
                  style={{ backgroundColor: '#991b1b' }}
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">New Indent</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of your component remains the same */}
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

        {/* Table Section - Scrollable */}
        <div className="flex-1 overflow-hidden px-4 lg:px-6 pb-4 lg:pb-6">
          <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:flex lg:flex-col lg:h-full lg:overflow-hidden">
              {/* Table Header - Fixed */}
              <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between px-6 py-3">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredIndents.length}</span> indents
                  </div>
                  {hasActiveFilters && (
                    <div className="flex items-center gap-2 text-xs text-red-800">
                      <Filter className="w-3 h-3" />
                      <span>Filters Active</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scrollable Table Container */}
              <div className="flex-1 overflow-auto">
                <div className="min-w-full">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Actions
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Indent No
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Plant Name
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Dispatcher
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Party Name
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Vehicle No
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Commodity
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          No. of PKTS
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Bharti Size
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Total Qty
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Tyre Weight
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredIndents.length > 0 ? (
                        filteredIndents.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1 transition-colors hover:bg-blue-50 rounded text-blue-600"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1 transition-colors hover:bg-red-50 rounded text-red-800"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                              <div className="break-words" title={item.remarks}>
                                {item.remarks || '-'}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="12" className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col gap-2 items-center">
                              <Filter className="w-8 h-8 text-gray-400" />
                              <span>No indent records found</span>
                              {hasActiveFilters ? (
                                <button
                                  onClick={handleClearFilters}
                                  className="text-sm text-red-800 hover:text-red-900 mt-2"
                                >
                                  Clear filters to see all records
                                </button>
                              ) : (
                                <button
                                  onClick={() => setShowModal(true)}
                                  className="text-sm text-red-800 hover:text-red-900 mt-2"
                                >
                                  Create your first indent
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

            {/* Mobile Card View */}
            <div className="flex-1 overflow-y-auto lg:hidden">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {filteredIndents.length} indents
                  </div>
                  {hasActiveFilters && (
                    <div className="flex items-center gap-1 text-xs text-red-800">
                      <Filter className="w-3 h-3" />
                      <span>Filtered</span>
                    </div>
                  )}
                </div>
              </div>

              {filteredIndents.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredIndents.map((item) => (
                    <div key={item.id} className="p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-gray-900">
                            {item.indentNo}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">{item.plantName}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 transition-colors hover:bg-blue-50 rounded-md text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 transition-colors hover:bg-red-50 rounded-md text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs font-medium text-gray-500">Dispatcher</span>
                            <p className="text-sm text-gray-900 mt-0.5">{item.officeDispatcher}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">Party</span>
                            <p className="text-sm text-gray-900 mt-0.5">{item.partyName}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs font-medium text-gray-500">Vehicle</span>
                            <p className="text-sm text-gray-900 font-mono mt-0.5">{item.vehicleNo}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">Commodity</span>
                            <p className="text-sm text-gray-900 mt-0.5">{item.commodityType}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                          <div className="text-center">
                            <span className="text-xs font-medium text-gray-500">PKTS</span>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.noOfPkts || '-'}</p>
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-medium text-gray-500">Size</span>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.bhartiSize || '-'}</p>
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-medium text-gray-500">Qty</span>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.totalQty || '-'}</p>
                          </div>
                        </div>

                        {item.tyreWeight && (
                          <div className="pt-2 border-t border-gray-100">
                            <span className="text-xs font-medium text-gray-500">Tyre Weight</span>
                            <p className="text-sm text-gray-700 mt-0.5">{item.tyreWeight}</p>
                          </div>
                        )}

                        {item.remarks && (
                          <div className="pt-2 border-t border-gray-100">
                            <span className="text-xs font-medium text-gray-500">Remarks</span>
                            <p className="text-sm text-gray-700 mt-0.5">{item.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 p-4 text-center text-gray-500">
                  <div className="flex flex-col gap-2 items-center">
                    <Filter className="w-8 h-8 text-gray-400" />
                    <p className="text-sm">No records found</p>
                    {!hasActiveFilters && (
                      <button
                        onClick={() => setShowModal(true)}
                        className="text-sm text-red-800 hover:text-red-900 mt-1"
                      >
                        Create your first indent
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Same as before */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingIndent ? 'Edit Indent' : 'New Indent'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plant Name - Searchable Dropdown */}
                {renderSearchableDropdown(
                  'plantName',
                  'Plant Name',
                  plantOptions,
                  filteredPlants,
                  'Search plant...'
                )}

                {/* Office Dispatcher Name - Searchable Dropdown */}
                {renderSearchableDropdown(
                  'officeDispatcher',
                  'Office Dispatcher Name',
                  dispatcherOptions,
                  filteredDispatchers,
                  'Search dispatcher...'
                )}

                {/* Party Name */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Party Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="partyName"
                    value={formData.partyName}
                    onChange={handleInputChange}
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
                    value={formData.vehicleNo}
                    onChange={handleInputChange}
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
                  'Search commodity...'
                )}

                {/* No. of PKTS */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    No. of PKTS
                  </label>
                  <input
                    type="text"
                    name="noOfPkts"
                    value={formData.noOfPkts}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter number of packets"
                    autoComplete="off"
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
                    value={formData.bhartiSize}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter bharti size"
                    autoComplete="off"
                  />
                </div>

                {/* Total Qty */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Total Qty
                  </label>
                  <input
                    type="text"
                    name="totalQty"
                    value={formData.totalQty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter total quantity"
                    autoComplete="off"
                  />
                </div>

                {/* Tyre Weight */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Tyre Weight
                  </label>
                  <input
                    type="text"
                    name="tyreWeight"
                    value={formData.tyreWeight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter tyre weight"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  placeholder="Enter remarks"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end p-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all hover:opacity-90"
                style={{ backgroundColor: '#991b1b' }}
              >
                {editingIndent ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndentPage;