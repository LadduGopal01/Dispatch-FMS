import React, { useState, useEffect } from "react";
import { Filter, X, Search, Edit, CheckCircle, Clock, ChevronDown, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_SHEET_API_URL;
const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const DROP_DOWN_SHEET = import.meta.env.VITE_SHEET_DROP_NAME;
const DISPATCH_SHEET = import.meta.env.VITE_SHEET_DISPATCH;

const IndentProcessingPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showFilters, setShowFilters] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [editingIndent, setEditingIndent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState({
    plantName: [],
    officeDispatcher: [],
    commodityType: []
  });

  const [filters, setFilters] = useState({
    plantName: "",
    officeDispatcher: "",
    partyName: "",
    vehicleNo: "",
    commodityType: "",
    indentNo: "",
  });

  const [processForm, setProcessForm] = useState({
    vehicleReached: "Yes"
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
    remarks: ""
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

  const [pendingIndents, setPendingIndents] = useState([]);
  const [historyIndents, setHistoryIndents] = useState([]);
  const [filteredPending, setFilteredPending] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Fetch dropdown options from Google Sheets
  const fetchDropdownOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}?sheet=${DROP_DOWN_SHEET}&action=getData`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch dropdown data');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        // Extract data from columns A, B, C (skip header row)
        const sheetData = data.data;
        
        // Get Plant Names from column A (A2:A)
        const plantNames = [];
        for (let i = 1; i < sheetData.length; i++) {
          if (sheetData[i][0]) {
            plantNames.push(sheetData[i][0].trim());
          }
        }
        
        // Get Office Dispatcher Names from column B (B2:B)
        const dispatcherNames = [];
        for (let i = 1; i < sheetData.length; i++) {
          if (sheetData[i][1]) {
            dispatcherNames.push(sheetData[i][1].trim());
          }
        }
        
        // Get Commodity Types from column C (C2:C)
        const commodityTypes = [];
        for (let i = 1; i < sheetData.length; i++) {
          if (sheetData[i][2]) {
            commodityTypes.push(sheetData[i][2].trim());
          }
        }
        
        setDropdownOptions({
          plantName: [...new Set(plantNames)], // Remove duplicates
          officeDispatcher: [...new Set(dispatcherNames)], // Remove duplicates
          commodityType: [...new Set(commodityTypes)] // Remove duplicates
        });
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      alert('Failed to load dropdown options. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch indents from Google Sheets
  const fetchIndents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}?sheet=${DISPATCH_SHEET}&action=getData`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch indent data');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        const sheetData = data.data;
        const pendingData = [];
        const historyData = [];
        
        // Start from row 7 (index 6) as per specification
        for (let i = 6; i < sheetData.length; i++) {
          const row = sheetData[i];
          
          // Check if row has at least basic data (Indent No in column B)
          if (row[1]) { // Column B has data (Indent No)
            const indent = {
              id: i + 1, // Use row number as ID for editing
              indentNo: row[1] || '', // Column B
              plantName: row[2] || '', // Column C
              officeDispatcher: row[3] || '', // Column D
              partyName: row[4] || '', // Column E
              vehicleNo: row[5] || '', // Column F
              commodityType: row[6] || '', // Column G
              noOfPkts: row[7] || '', // Column H
              bhartiSize: row[8] || '', // Column I
              totalQty: row[9] || '', // Column J
              tyreWeight: row[10] || '', // Column K
              remarks: row[11] || '', // Column L
              // Column M (12) - Not Null condition for pending
              // Column N (13) - Not Null condition for history
              // Column P (15) - Vehicle Reached at Loading Point
              vehicleReached: row[15] || '', // Column P
              rowIndex: i + 1 // Store actual row index for updates
            };
            
            // Check conditions for pending vs history
            const hasColumnM = row[12] && row[12].trim() !== ''; // Column M not null
            const hasColumnN = row[13] && row[13].trim() !== ''; // Column N not null
            
            if (hasColumnM && !hasColumnN) {
              // Pending: Column M = Not Null, Column N = Null
              pendingData.push(indent);
            } else if (hasColumnM && hasColumnN) {
              // History: Column M = Not Null, Column N = Not Null
              historyData.push(indent);
            }
          }
        }
        
        setPendingIndents(pendingData);
        setHistoryIndents(historyData);
        setFilteredPending(pendingData);
        setFilteredHistory(historyData);
      }
    } catch (error) {
      console.error('Error fetching indents:', error);
      alert('Failed to load indents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDropdownOptions();
    fetchIndents();
  }, []);

  // Apply filters whenever filters or data change
  useEffect(() => {
    applyFilters();
  }, [filters, pendingIndents, historyIndents]);

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
      plantName: indent.plantName || "",
      officeDispatcher: indent.officeDispatcher || "",
      partyName: indent.partyName || "",
      vehicleNo: indent.vehicleNo || "",
      commodityType: indent.commodityType || "",
      noOfPkts: indent.noOfPkts || "",
      bhartiSize: indent.bhartiSize || "",
      totalQty: indent.totalQty || "",
      tyreWeight: indent.tyreWeight || "",
      remarks: indent.remarks || ""
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
      remarks: indent.remarks || ""
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

  // Process form submission - Mark vehicle as reached
  const handleProcessSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      // Generate timestamp in DD/MM/YYYY hh:mm:ss format
      const now = new Date();
      const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      // Update only columns N and P for the specific row
      const rowIndex = selectedIndent.rowIndex;
      
      // Prepare update data - only update columns N (timestamp) and P (vehicleReached)
      // We need to update all columns, but keep original values for others
      const rowData = [
        '', // Column A - keep original timestamp
        selectedIndent.indentNo, // Column B - keep original
        processForm.plantName, // Column C - keep original
        processForm.officeDispatcher, // Column D - keep original
        processForm.partyName, // Column E - keep original
        processForm.vehicleNo, // Column F - keep original
        processForm.commodityType, // Column G - keep original
        processForm.noOfPkts, // Column H - keep original
        processForm.bhartiSize, // Column I - keep original
        processForm.totalQty, // Column J - keep original
        processForm.tyreWeight, // Column K - keep original
        processForm.remarks, // Column L - keep original
        '', // Column M - keep original (assuming it's already set)
        timestamp, // Column N - NEW: Timestamp when vehicle reached
        '', // Column O - keep original (if exists)
        processForm.vehicleReached, // Column P - NEW: Vehicle reached status
        '', // Column Q - keep original (if exists)
        '', // Column R - keep original (if exists)
        '', // Column S - keep original (if exists)
        ''  // Column T - keep original (if exists)
      ];

      const response = await fetch(API_URL, {
        method: 'POST',
        body: new URLSearchParams({
          action: 'update',
          sheetName: DISPATCH_SHEET,
          rowIndex: rowIndex,
          rowData: JSON.stringify(rowData)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Vehicle marked as reached successfully!');
        
        // Reset form
        setProcessForm({
          vehicleReached: "Yes"
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
        
        setSelectedIndent(null);
        setShowProcessModal(false);
        
        // Refresh data from sheet
        await fetchIndents();
      } else {
        throw new Error(result.error || 'Failed to process indent');
      }
    } catch (error) {
      console.error('Error processing indent:', error);
      alert(`Error processing indent: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      const rowIndex = editingIndent.rowIndex;
      
      // Prepare update data - only update specific columns based on editForm
      const rowData = [
        '', // Column A - keep original timestamp
        editingIndent.indentNo, // Column B - keep original
        editForm.plantName, // Column C - updated
        editForm.officeDispatcher, // Column D - updated
        editForm.partyName, // Column E - updated
        editForm.vehicleNo, // Column F - updated
        editForm.commodityType, // Column G - updated
        editForm.noOfPkts, // Column H - updated
        editForm.bhartiSize, // Column I - updated
        editForm.totalQty, // Column J - updated
        editForm.tyreWeight, // Column K - updated
        editForm.remarks, // Column L - updated
        '', // Column M - keep original
        '', // Column N - keep original timestamp
        '', // Column O - keep original
        editForm.vehicleReached, // Column P - updated
        '', // Column Q - keep original
        '', // Column R - keep original
        '', // Column S - keep original
        ''  // Column T - keep original
      ];

      const response = await fetch(API_URL, {
        method: 'POST',
        body: new URLSearchParams({
          action: 'update',
          sheetName: DISPATCH_SHEET,
          rowIndex: rowIndex,
          rowData: JSON.stringify(rowData)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Indent updated successfully!');
        
        // Reset form
        setEditForm({
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
          remarks: ""
        });
        
        setEditingIndent(null);
        setShowEditModal(false);
        
        // Refresh data from sheet
        await fetchIndents();
      } else {
        throw new Error(result.error || 'Failed to update indent');
      }
    } catch (error) {
      console.error('Error updating indent:', error);
      alert(`Error updating indent: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowProcessModal(false);
    setSelectedIndent(null);
    
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
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingIndent(null);
    
    // Reset edit form
    setEditForm({
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
      remarks: ""
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Filter options based on search
  const filteredPlants = dropdownOptions.plantName.filter(plant =>
    plant.toLowerCase().includes(searchTerms.plantName.toLowerCase())
  );

  const filteredDispatchers = dropdownOptions.officeDispatcher.filter(dispatcher =>
    dispatcher.toLowerCase().includes(searchTerms.officeDispatcher.toLowerCase())
  );

  const filteredCommodities = dropdownOptions.commodityType.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.commodityType.toLowerCase())
  );

  // Function to render label with proper content display
  const renderLabelContent = (label, value) => {
    return (
      <div className="space-y-1">
        <span className="text-xs font-medium text-gray-600 block">{label}</span>
        <div className="min-h-[20px] py-1">
          <span className="text-sm font-medium text-gray-900 break-words">
            {value || "-"}
          </span>
        </div>
      </div>
    );
  };

  // Render searchable dropdown component for process modal
  const renderSearchableDropdown = (field, label, filteredOptions, placeholder, value) => (
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
          className="w-full px-10 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
          placeholder={placeholder}
          autoComplete="off"
          disabled={loading}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        )}
      </div>
      
      {/* Dropdown Menu */}
      {showDropdowns[field] && !loading && (
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
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-red-800 animate-spin" />
            <p className="text-gray-700">Loading...</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Quick Actions */}
        <div className="flex-shrink-0 p-4 lg:p-6 bg-gray-50">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Indent Processing</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                    disabled={loading}
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
                          className="py-1.5 pr-2 pl-7 w-full text-xs rounded border border-gray-300 focus:ring-1 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          autoComplete="off"
                          disabled={loading}
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
                        Showing <span className="font-semibold">{filteredPending.length}</span> pending indents
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
                              Remarks
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
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: '#991b1b' }}
                                    disabled={loading}
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
                                  <Clock className="w-8 h-8 text-gray-400" />
                                  <span>No pending indent records found</span>
                                  {hasActiveFilters && (
                                    <button
                                      onClick={handleClearFilters}
                                      className="text-sm text-red-800 hover:text-red-900 mt-2"
                                      disabled={loading}
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
                        <span className="font-semibold">{filteredPending.length}</span> pending indents
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
                                  className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                                  style={{ backgroundColor: '#991b1b' }}
                                  disabled={loading}
                                >
                                  Process
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {renderLabelContent("Dispatcher", item.officeDispatcher)}
                                {renderLabelContent("Party", item.partyName)}
                                {renderLabelContent("Vehicle", item.vehicleNo)}
                                {renderLabelContent("Commodity", item.commodityType)}
                                {renderLabelContent("PKTS", item.noOfPkts)}
                                {renderLabelContent("Bharti Size", item.bhartiSize)}
                                {renderLabelContent("Total Qty", item.totalQty)}
                                {renderLabelContent("Tare Weight", item.tyreWeight)}
                              </div>
                              
                              {item.remarks && (
                                <div>
                                  <span className="text-sm text-gray-600">Remarks:</span>
                                  <p className="text-sm mt-1 break-words">{item.remarks}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 items-center justify-center py-12 text-gray-500">
                        <Clock className="w-8 h-8 text-gray-400" />
                        <span>No pending indent records found</span>
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="text-sm text-red-800 hover:text-red-900 mt-2"
                            disabled={loading}
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
                        Showing <span className="font-semibold">{filteredHistory.length}</span> processed indents
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
                          {filteredHistory.length > 0 ? (
                            filteredHistory.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                  <button
                                    onClick={() => handleEditClick(item)}
                                    className="p-1 transition-colors hover:bg-blue-50 rounded text-blue-600 disabled:opacity-50"
                                    title="Edit"
                                    disabled={loading}
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
                                  {item.vehicleReached || '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="12" className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col gap-2 items-center">
                                  <CheckCircle className="w-8 h-8 text-gray-400" />
                                  <span>No processed indent records found</span>
                                  {hasActiveFilters && (
                                    <button
                                      onClick={handleClearFilters}
                                      className="text-sm text-red-800 hover:text-red-900 mt-2"
                                      disabled={loading}
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
                        <span className="font-semibold">{filteredHistory.length}</span> processed indents
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
                                  className="p-1 transition-colors hover:bg-blue-50 rounded text-blue-600 disabled:opacity-50"
                                  title="Edit"
                                  disabled={loading}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {renderLabelContent("Dispatcher", item.officeDispatcher)}
                                {renderLabelContent("Party", item.partyName)}
                                {renderLabelContent("Vehicle", item.vehicleNo)}
                                {renderLabelContent("Commodity", item.commodityType)}
                                {renderLabelContent("PKTS", item.noOfPkts)}
                                {renderLabelContent("Bharti Size", item.bhartiSize)}
                                {renderLabelContent("Total Qty", item.totalQty)}
                                {renderLabelContent("Tare Weight", item.tyreWeight)}
                                {renderLabelContent("Vehicle Reached", item.vehicleReached)}
                              </div>
                              
                              {item.remarks && (
                                <div>
                                  <span className="text-sm text-gray-600">Remarks:</span>
                                  <p className="text-sm mt-1 break-words">{item.remarks}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 items-center justify-center py-12 text-gray-500">
                        <CheckCircle className="w-8 h-8 text-gray-400" />
                        <span>No processed indent records found</span>
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="text-sm text-red-800 hover:text-red-900 mt-2"
                            disabled={loading}
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
                Process Indent - {selectedIndent.indentNo}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Editable Indent Summary Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Indent Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Plant Name - Searchable Dropdown */}
                  {renderSearchableDropdown(
                    'plantName',
                    'Plant Name',
                    filteredPlants,
                    'Search plant...',
                    processForm.plantName
                  )}

                  {/* Office Dispatcher - Searchable Dropdown */}
                  {renderSearchableDropdown(
                    'officeDispatcher',
                    'Office Dispatcher',
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter party name"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter vehicle number"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Commodity Type - Searchable Dropdown */}
                  {renderSearchableDropdown(
                    'commodityType',
                    'Commodity Type',
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
                      type="text"
                      name="noOfPkts"
                      value={processForm.noOfPkts || ''}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter bharti size"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Total Quantity */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Total Quantity
                    </label>
                    <input
                      type="text"
                      name="totalQty"
                      value={processForm.totalQty || ''}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter total quantity"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Tare Weight */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Tare Weight
                    </label>
                    <input
                      type="text"
                      name="tyreWeight"
                      value={processForm.tyreWeight || ''}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter Tare Weight"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Remarks */}
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={processForm.remarks || ''}
                      onChange={handleProcessInputChange}
                      rows="3"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter remarks"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Process Form */}
              <form onSubmit={handleProcessSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Vehicle Reached at Loading Point
                    </label>
                    <select
                      value={processForm.vehicleReached}
                      onChange={(e) => setProcessForm({...processForm, vehicleReached: e.target.value})}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end p-4 border-t border-gray-200 sticky bottom-0 bg-white mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#991b1b' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      'Save'
                    )}
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
                Edit Indent - {editingIndent.indentNo}
              </h3>
              <button
                onClick={handleEditCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Editable Indent Summary Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Edit Indent Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Plant Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Plant Name
                    </label>
                    <input
                      type="text"
                      name="plantName"
                      value={editForm.plantName || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter plant name"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Office Dispatcher */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Office Dispatcher
                    </label>
                    <input
                      type="text"
                      name="officeDispatcher"
                      value={editForm.officeDispatcher || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter office dispatcher"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Party Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Party Name
                    </label>
                    <input
                      type="text"
                      name="partyName"
                      value={editForm.partyName || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter party name"
                      autoComplete="off"
                      disabled={loading}
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
                      value={editForm.vehicleNo || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter vehicle number"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Commodity Type */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Commodity Type
                    </label>
                    <input
                      type="text"
                      name="commodityType"
                      value={editForm.commodityType || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter commodity type"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* No. of PKTS */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      No. of PKTS
                    </label>
                    <input
                      type="text"
                      name="noOfPkts"
                      value={editForm.noOfPkts || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      autoComplete="off"
                      disabled={loading}
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
                      value={editForm.bhartiSize || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter bharti size"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Total Quantity */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Total Quantity
                    </label>
                    <input
                      type="text"
                      name="totalQty"
                      value={editForm.totalQty || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter total quantity"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Tare Weight */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Tare Weight
                    </label>
                    <input
                      type="text"
                      name="tyreWeight"
                      value={editForm.tyreWeight || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter Tare Weight"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Vehicle Reached */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Vehicle Reached at Loading Point
                    </label>
                    <select
                      name="vehicleReached"
                      value={editForm.vehicleReached}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="Yes">Yes</option>
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter remarks"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="flex gap-3 justify-end p-4 border-t border-gray-200 sticky bottom-0 bg-white mt-6">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#991b1b' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      'Update'
                    )}
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

export default IndentProcessingPage;