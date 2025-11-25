import React, { useState, useEffect } from "react";
import { Filter, X, Search, Edit, CheckCircle, Clock, ChevronDown } from "lucide-react";

const GatePass = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showFilters, setShowFilters] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [editingIndent, setEditingIndent] = useState(null);
  const [gatePassType, setGatePassType] = useState("Civil Supply");
  
  const [filters, setFilters] = useState({
    plantName: "",
    officeDispatcher: "",
    partyName: "",
    vehicleNo: "",
    commodityType: "",
    indentNo: "",
  });

  const [processForm, setProcessForm] = useState({
    gatePassType: "Civil Supply",
    date: new Date().toISOString().split('T')[0],
    partyName: "",
    commodityType: "",
    vehicleType: "",
    vehicleNo: "",
    commoditySubType1: "",
    commoditySubType2: "",
    commoditySubType3: "",
    totalPkts: "",
    bhartiSize: "",
    netWeight: "",
    driverName: "",
    driverNumber: "",
    cmrNumber: "",
    lotNumber: "",
    kmsYear: "",
    // Gate Pass specific fields
    totalQty: "",
    sizeOfPackets: "",
    rate: "",
    billDetails: "",
    billWeight: "",
    invoiceNumber: "",
    invoiceValue: "",
    // Indent Summary fields (editable)
    indentNo: "",
    plantName: "",
    officeDispatcher: "",
    munsiName: "",
    packetType: "",
    packetName: "",
    status: ""
  });

  const [editForm, setEditForm] = useState({
    gatePassType: "Civil Supply",
    date: new Date().toISOString().split('T')[0],
    partyName: "",
    commodityType: "",
    vehicleType: "",
    vehicleNo: "",
    commoditySubType1: "",
    commoditySubType2: "",
    commoditySubType3: "",
    totalPkts: "",
    bhartiSize: "",
    netWeight: "",
    driverName: "",
    driverNumber: "",
    cmrNumber: "",
    lotNumber: "",
    kmsYear: "",
    // Gate Pass specific fields
    totalQty: "",
    sizeOfPackets: "",
    rate: "",
    billDetails: "",
    billWeight: "",
    invoiceNumber: "",
    invoiceValue: "",
    // Indent Summary fields (editable)
    indentNo: "",
    plantName: "",
    officeDispatcher: "",
    munsiName: "",
    packetType: "",
    packetName: "",
    status: "",
    remarks: ""
  });

  // State for searchable dropdowns
  const [searchTerms, setSearchTerms] = useState({
    commoditySubType1: "",
    commoditySubType2: "",
    commoditySubType3: "",
  });

  const [editSearchTerms, setEditSearchTerms] = useState({
    commoditySubType1: "",
    commoditySubType2: "",
    commoditySubType3: "",
  });
  
  const [showDropdowns, setShowDropdowns] = useState({
    commoditySubType1: false,
    commoditySubType2: false,
    commoditySubType3: false,
  });

  const [showEditDropdowns, setShowEditDropdowns] = useState({
    commoditySubType1: false,
    commoditySubType2: false,
    commoditySubType3: false,
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

  // Gate Pass Type options
  const gatePassTypeOptions = ['Civil Supply', 'Gate Pass'];

  // Vehicle Type options
  const vehicleTypeOptions = ['Company', 'Party', 'Transporter'];

  // KMS Year options
  const kmsYearOptions = ['Kharif', 'Ravi', 'Other Ravi (Koraport)'];

  // Complete Commodity Type options
  const commodityOptions = [
    'PADDY MOTA', 'PADDY NEW', 'PADDY IR', 'CMR (FRK BOILED)', 'CMR (NON FRK BOILED)', 
    'CMR (FRK RAW)', 'CMR (NON FRK RAW)', 'RICE (FRK BOILED)', 'RICE (NON FRK BOILED)', 
    'RICE (FRK RAW)', 'RICE (NON FRK RAW)', 'MURI RICE', 'REJECTION (BOILED)', 
    'REJECTION (RAW)', 'REJECTION (MURI)', 'BROKEN (RAW SORTEX)', 'BROKEN (RAW NON SORTEX)', 
    'BROKEN (BOILED)', 'RICE BRAN (BOILED)', 'RICE BRAN (RAW)', 'RICE BRAN (MURI)', 
    'HUSK', 'PELLETS (8 MM RICE HUSK)', 'PELLETS (8 MM SAW DUST)', 'PELLETS (8 MM GROUNDNUT)', 
    'PELLETS (16 MM RICE HUSK)', 'PELLETS (8 MM RICE HUSK & GROUNDNUT)', 'PELLETS (16 MM GROUNDNUT)', 
    'PELLETS (16 MM RICE HUSK & GROUNDNUT)', 'BRIQUETTE (90 MM RICE HUSK)', 
    'BRIQUETTE (90 MM GROUNDNUT)', 'BRIQUETTE (90 MM SAWDUST)', 
    'BRIQUETTE (90 MM RICE HUSK & GROUNDNUT)', 'KAJU CHILKA', 'RAKHAD', 'PLASTIC PKT', 'JUTE PKT'
  ];

  // Filtered options based on search
  const filteredCommodities1 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.commoditySubType1.toLowerCase())
  );

  const filteredCommodities2 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.commoditySubType2.toLowerCase())
  );

  const filteredCommodities3 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.commoditySubType3.toLowerCase())
  );

  // Filtered options for edit modal
  const filteredEditCommodities1 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.commoditySubType1.toLowerCase())
  );

  const filteredEditCommodities2 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.commoditySubType2.toLowerCase())
  );

  const filteredEditCommodities3 = commodityOptions.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.commoditySubType3.toLowerCase())
  );

  // Load data from localStorage - connected with Loading Complete page
  useEffect(() => {
    loadIndents();
  }, []);

  // Apply filters whenever filters or data change
  useEffect(() => {
    applyFilters();
  }, [filters, pendingIndents, historyIndents]);

  const loadIndents = () => {
    // Get completed loading indents from Loading Complete page
    const loadingCompleteHistory = localStorage.getItem("loadingCompleteHistory");
    
    if (loadingCompleteHistory) {
      const parsedData = JSON.parse(loadingCompleteHistory);
      
      // Filter to get only completed loading indents that haven't been processed for gate pass
      const completedIndents = parsedData.filter(item => 
        item.status === "Complete" && !item.gatePassCompleted
      );
      
      setPendingIndents(completedIndents);
      setFilteredPending(completedIndents);
    }
    
    // Get gate pass history
    const savedHistory = localStorage.getItem("gatePassHistory");
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
    setGatePassType("Civil Supply");
    setProcessForm({
      gatePassType: "Civil Supply",
      date: new Date().toISOString().split('T')[0],
      partyName: indent.partyName || "",
      commodityType: indent.commodityType || "",
      vehicleType: "",
      vehicleNo: indent.vehicleNo || "",
      commoditySubType1: "",
      commoditySubType2: "",
      commoditySubType3: "",
      totalPkts: indent.noOfPkts || "",
      bhartiSize: indent.bhartiSize || "",
      netWeight: "",
      driverName: "",
      driverNumber: "",
      cmrNumber: "",
      lotNumber: "",
      kmsYear: "",
      totalQty: indent.totalQty || "",
      sizeOfPackets: "",
      rate: "",
      billDetails: "",
      billWeight: "",
      invoiceNumber: "",
      invoiceValue: "",
      // Indent Summary fields (editable)
      indentNo: indent.indentNo || "",
      plantName: indent.plantName || "",
      officeDispatcher: indent.officeDispatcher || "",
      munsiName: indent.munsiName || "",
      packetType: indent.packetType || "",
      packetName: indent.packetName || "",
      status: indent.status || ""
    });
    setShowProcessModal(true);
  };

  // Edit button handler - opens popup form
  const handleEditClick = (indent) => {
    setEditingIndent(indent);
    setEditForm({
      gatePassType: indent.gatePassType || "Civil Supply",
      date: indent.date || new Date().toISOString().split('T')[0],
      partyName: indent.partyName || "",
      commodityType: indent.commodityType || "",
      vehicleType: indent.vehicleType || "",
      vehicleNo: indent.vehicleNo || "",
      commoditySubType1: indent.commoditySubType1 || "",
      commoditySubType2: indent.commoditySubType2 || "",
      commoditySubType3: indent.commoditySubType3 || "",
      totalPkts: indent.totalPkts || "",
      bhartiSize: indent.bhartiSize || "",
      netWeight: indent.netWeight || "",
      driverName: indent.driverName || "",
      driverNumber: indent.driverNumber || "",
      cmrNumber: indent.cmrNumber || "",
      lotNumber: indent.lotNumber || "",
      kmsYear: indent.kmsYear || "",
      totalQty: indent.totalQty || "",
      sizeOfPackets: indent.sizeOfPackets || "",
      rate: indent.rate || "",
      billDetails: indent.billDetails || "",
      billWeight: indent.billWeight || "",
      invoiceNumber: indent.invoiceNumber || "",
      invoiceValue: indent.invoiceValue || "",
      // Indent Summary fields (editable)
      indentNo: indent.indentNo || "",
      plantName: indent.plantName || "",
      officeDispatcher: indent.officeDispatcher || "",
      munsiName: indent.munsiName || "",
      packetType: indent.packetType || "",
      packetName: indent.packetName || "",
      status: indent.status || "",
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

  const handleProcessSubmit = (e) => {
    e.preventDefault();

    // Move from pending to history
    const updatedPending = pendingIndents.filter(item => item.id !== selectedIndent.id);
    
    // Update the original loading complete data to mark as gate pass completed
    const loadingCompleteHistory = JSON.parse(localStorage.getItem("loadingCompleteHistory") || "[]");
    const updatedLoadingComplete = loadingCompleteHistory.map(item =>
      item.id === selectedIndent.id
        ? { ...item, gatePassCompleted: true }
        : item
    );

    const processedIndent = {
      ...processForm,
      id: selectedIndent.id,
      gatePassCompletedAt: new Date().toISOString(),
      originalData: { ...selectedIndent }
    };

    const updatedHistory = [...historyIndents, processedIndent];

    setPendingIndents(updatedPending);
    setHistoryIndents(updatedHistory);

    // Update localStorage
    localStorage.setItem("gatePassPending", JSON.stringify(updatedPending));
    localStorage.setItem("gatePassHistory", JSON.stringify(updatedHistory));
    localStorage.setItem("loadingCompleteHistory", JSON.stringify(updatedLoadingComplete));

    setShowProcessModal(false);
    setSelectedIndent(null);
    
    // Reset search terms and dropdowns
    setSearchTerms({
      commoditySubType1: "",
      commoditySubType2: "",
      commoditySubType3: "",
    });
    
    setShowDropdowns({
      commoditySubType1: false,
      commoditySubType2: false,
      commoditySubType3: false,
    });
  };

  // Handle edit form submission
  const handleEditSubmit = (e) => {
    e.preventDefault();

    const updatedHistory = historyIndents.map(item =>
      item.id === editingIndent.id
        ? { 
            ...editForm,
            gatePassCompletedAt: editingIndent.gatePassCompletedAt,
            updatedAt: new Date().toISOString(),
            originalData: editingIndent.originalData || { ...editingIndent }
          }
        : item
    );

    setHistoryIndents(updatedHistory);
    localStorage.setItem("gatePassHistory", JSON.stringify(updatedHistory));

    setShowEditModal(false);
    setEditingIndent(null);
    
    // Reset edit search terms and dropdowns
    setEditSearchTerms({
      commoditySubType1: "",
      commoditySubType2: "",
      commoditySubType3: "",
    });
    
    setShowEditDropdowns({
      commoditySubType1: false,
      commoditySubType2: false,
      commoditySubType3: false,
    });
  };

  const handleCancel = () => {
    setShowProcessModal(false);
    setSelectedIndent(null);
    
    // Reset search terms and dropdowns
    setSearchTerms({
      commoditySubType1: "",
      commoditySubType2: "",
      commoditySubType3: "",
    });
    
    setShowDropdowns({
      commoditySubType1: false,
      commoditySubType2: false,
      commoditySubType3: false,
    });
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingIndent(null);
    
    // Reset edit search terms and dropdowns
    setEditSearchTerms({
      commoditySubType1: "",
      commoditySubType2: "",
      commoditySubType3: "",
    });
    
    setShowEditDropdowns({
      commoditySubType1: false,
      commoditySubType2: false,
      commoditySubType3: false,
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

  // Render editable Indent Summary section
  const renderEditableIndentSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Indent No */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Indent No <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="indentNo"
          value={processForm.indentNo}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter indent number"
          required
          autoComplete="off"
        />
      </div>

      {/* Plant Name */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Plant Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="plantName"
          value={processForm.plantName}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter plant name"
          required
          autoComplete="off"
        />
      </div>

      {/* Office Dispatcher */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Office Dispatcher <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="officeDispatcher"
          value={processForm.officeDispatcher}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter office dispatcher"
          required
          autoComplete="off"
        />
      </div>

      {/* Munsi Name */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Munsi Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="munsiName"
          value={processForm.munsiName}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter munsi name"
          required
          autoComplete="off"
        />
      </div>

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
  );

  // Render Civil Supply form fields
  const renderCivilSupplyForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Date */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Date <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          name="date"
          value={processForm.date}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          required
        />
      </div>

      {/* Party Name */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Party Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="partyName"
          value={processForm.partyName}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter party name"
          required
          autoComplete="off"
        />
      </div>

      {/* Commodity Type */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Commodity Type <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="commodityType"
          value={processForm.commodityType}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter commodity type"
          required
          autoComplete="off"
        />
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Vehicle Type <span className="text-red-600">*</span>
        </label>
        <select
          name="vehicleType"
          value={processForm.vehicleType}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          required
        >
          <option value="">Select Vehicle Type</option>
          {vehicleTypeOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Vehicle No */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Vehicle No <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="vehicleNo"
          value={processForm.vehicleNo}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter vehicle number"
          required
          autoComplete="off"
        />
      </div>

      {/* Commodity Sub-type 1 */}
      {renderSearchableDropdown(
        'commoditySubType1',
        'Commodity Sub-type 1',
        commodityOptions,
        filteredCommodities1,
        'Search commodity...',
        processForm.commoditySubType1
      )}

      {/* Commodity Sub-type 2 */}
      {renderSearchableDropdown(
        'commoditySubType2',
        'Commodity Sub-type 2',
        commodityOptions,
        filteredCommodities2,
        'Search commodity...',
        processForm.commoditySubType2
      )}

      {/* Commodity Sub-type 3 */}
      {renderSearchableDropdown(
        'commoditySubType3',
        'Commodity Sub-type 3',
        commodityOptions,
        filteredCommodities3,
        'Search commodity...',
        processForm.commoditySubType3
      )}

      {/* Total PKTS */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Total PKTS <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          name="totalPkts"
          value={processForm.totalPkts}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter total packets"
          required
        />
      </div>

      {/* Bharti Size */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Bharti Size <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="bhartiSize"
          value={processForm.bhartiSize}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter bharti size"
          required
          autoComplete="off"
        />
      </div>

      {/* Net Weight */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Net Weight (Kg) <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          name="netWeight"
          value={processForm.netWeight}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter net weight"
          required
        />
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

      {/* CMR Number */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          CMR Number <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="cmrNumber"
          value={processForm.cmrNumber}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter CMR number"
          required
          autoComplete="off"
        />
      </div>

      {/* Lot Number */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Lot Number <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="lotNumber"
          value={processForm.lotNumber}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter lot number"
          required
          autoComplete="off"
        />
      </div>

      {/* KMS Year */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          KMS Year <span className="text-red-600">*</span>
        </label>
        <select
          name="kmsYear"
          value={processForm.kmsYear}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          required
        >
          <option value="">Select KMS Year</option>
          {kmsYearOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // Render Gate Pass form fields
  const renderGatePassForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Date */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Date <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          name="date"
          value={processForm.date}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          required
        />
      </div>

      {/* Party Name */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Party Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="partyName"
          value={processForm.partyName}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter party name"
          required
          autoComplete="off"
        />
      </div>

      {/* Commodity Type */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Commodity Type <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="commodityType"
          value={processForm.commodityType}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter commodity type"
          required
          autoComplete="off"
        />
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Vehicle Type <span className="text-red-600">*</span>
        </label>
        <select
          name="vehicleType"
          value={processForm.vehicleType}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          required
        >
          <option value="">Select Vehicle Type</option>
          {vehicleTypeOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Vehicle No */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Vehicle No <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="vehicleNo"
          value={processForm.vehicleNo}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter vehicle number"
          required
          autoComplete="off"
        />
      </div>

      {/* Commodity Sub-type 1 */}
      {renderSearchableDropdown(
        'commoditySubType1',
        'Commodity Sub-type 1',
        commodityOptions,
        filteredCommodities1,
        'Search commodity...',
        processForm.commoditySubType1
      )}

      {/* Commodity Sub-type 2 */}
      {renderSearchableDropdown(
        'commoditySubType2',
        'Commodity Sub-type 2',
        commodityOptions,
        filteredCommodities2,
        'Search commodity...',
        processForm.commoditySubType2
      )}

      {/* Commodity Sub-type 3 */}
      {renderSearchableDropdown(
        'commoditySubType3',
        'Commodity Sub-type 3',
        commodityOptions,
        filteredCommodities3,
        'Search commodity...',
        processForm.commoditySubType3
      )}

      {/* Total PKTS */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Total PKTS <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          name="totalPkts"
          value={processForm.totalPkts}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter total packets"
          required
        />
      </div>

      {/* Bharti Size */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Bharti Size <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="bhartiSize"
          value={processForm.bhartiSize}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter bharti size"
          required
          autoComplete="off"
        />
      </div>

      {/* Net Weight */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Net Weight (Kg) <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          name="netWeight"
          value={processForm.netWeight}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter net weight"
          required
        />
      </div>

      {/* Total Qty */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Total Qty <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          name="totalQty"
          value={processForm.totalQty}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter total quantity"
          required
        />
      </div>

      {/* Size of Packets */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Size of Packets <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="sizeOfPackets"
          value={processForm.sizeOfPackets}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter size of packets"
          required
          autoComplete="off"
        />
      </div>

      {/* Rate */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Rate <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          name="rate"
          value={processForm.rate}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter rate"
          required
        />
      </div>

      {/* Bill Details */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Bill Details <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="billDetails"
          value={processForm.billDetails}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter bill details"
          required
          autoComplete="off"
        />
      </div>

      {/* Bill Weight */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Bill Weight (KG) <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          name="billWeight"
          value={processForm.billWeight}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter bill weight"
          required
        />
      </div>

      {/* Invoice Number */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Invoice Number <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="invoiceNumber"
          value={processForm.invoiceNumber}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter invoice number"
          required
          autoComplete="off"
        />
      </div>

      {/* Invoice Value */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          Invoice Value <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          name="invoiceValue"
          value={processForm.invoiceValue}
          onChange={handleProcessInputChange}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
          placeholder="Enter invoice value"
          required
        />
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gate Pass</h1>
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
                        Showing <span className="font-semibold">{filteredPending.length}</span> pending gate pass indents
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
                                  <Clock className="w-8 h-8 text-gray-400" />
                                  <span>No pending gate pass records found</span>
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
                        <span className="font-semibold">{filteredPending.length}</span> pending gate pass indents
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
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 items-center justify-center py-12 text-gray-500">
                        <Clock className="w-8 h-8 text-gray-400" />
                        <span>No pending gate pass records found</span>
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
                        Showing <span className="font-semibold">{filteredHistory.length}</span> completed gate pass indents
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
                              Gate Pass Type
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
                              Total PKTS
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Net Weight
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Driver Name
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
                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                  {item.gatePassType || '-'}
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
                                  {item.totalPkts || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.netWeight || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.driverName || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.status || '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col gap-2 items-center">
                                  <CheckCircle className="w-8 h-8 text-gray-400" />
                                  <span>No completed gate pass records found</span>
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
                        <span className="font-semibold">{filteredHistory.length}</span> completed gate pass indents
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
                                  <p className="text-sm text-gray-600">{item.gatePassType || 'Gate Pass'}</p>
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
                                  <span className="text-xs font-medium text-gray-600 block">Total PKTS</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.totalPkts || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Net Weight</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.netWeight || '-'}
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
                              </div>
                              
                              {item.gatePassCompletedAt && (
                                <div className="text-xs text-gray-500">
                                  Gate Pass Completed: {new Date(item.gatePassCompletedAt).toLocaleString()}
                                  {item.updatedAt && item.updatedAt !== item.gatePassCompletedAt && (
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
                        <span>No completed gate pass records found</span>
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Gate Pass - {selectedIndent.indentNo}
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
                {renderEditableIndentSummary()}
              </div>

              {/* Gate Pass Form */}
              <form onSubmit={handleProcessSubmit}>
                {/* Gate Pass Type */}
                <div className="mb-6">
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Gate Pass Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="gatePassType"
                    value={processForm.gatePassType}
                    onChange={(e) => {
                      setGatePassType(e.target.value);
                      handleProcessInputChange(e);
                    }}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    required
                  >
                    {gatePassTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Form based on Gate Pass Type */}
                {gatePassType === "Civil Supply" ? renderCivilSupplyForm() : renderGatePassForm()}

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
                    Create Gate Pass
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Gate Pass - {editingIndent.indentNo}
              </h3>
              <button
                onClick={handleEditCancel}
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
                  {/* Indent No */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Indent No
                    </label>
                    <input
                      type="text"
                      name="indentNo"
                      value={editForm.indentNo}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* Plant Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Plant Name
                    </label>
                    <input
                      type="text"
                      name="plantName"
                      value={editForm.plantName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
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
                      value={editForm.officeDispatcher}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* Munsi Name */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Munsi Name
                    </label>
                    <input
                      type="text"
                      name="munsiName"
                      value={editForm.munsiName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

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
                </div>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gate Pass Type */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Gate Pass Type
                    </label>
                    <select
                      name="gatePassType"
                      value={editForm.gatePassType}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    >
                      {gatePassTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
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
                      value={editForm.partyName}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
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
                      value={editForm.commodityType}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Vehicle Type
                    </label>
                    <select
                      name="vehicleType"
                      value={editForm.vehicleType}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
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

                  {/* Commodity Sub-type 1 */}
                  {renderEditSearchableDropdown(
                    'commoditySubType1',
                    'Commodity Sub-type 1',
                    commodityOptions,
                    filteredEditCommodities1,
                    'Search commodity...',
                    editForm.commoditySubType1
                  )}

                  {/* Commodity Sub-type 2 */}
                  {renderEditSearchableDropdown(
                    'commoditySubType2',
                    'Commodity Sub-type 2',
                    commodityOptions,
                    filteredEditCommodities2,
                    'Search commodity...',
                    editForm.commoditySubType2
                  )}

                  {/* Commodity Sub-type 3 */}
                  {renderEditSearchableDropdown(
                    'commoditySubType3',
                    'Commodity Sub-type 3',
                    commodityOptions,
                    filteredEditCommodities3,
                    'Search commodity...',
                    editForm.commoditySubType3
                  )}

                  {/* Total PKTS */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Total PKTS
                    </label>
                    <input
                      type="number"
                      name="totalPkts"
                      value={editForm.totalPkts}
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

                  {/* Net Weight */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Net Weight (Kg)
                    </label>
                    <input
                      type="number"
                      name="netWeight"
                      value={editForm.netWeight}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    />
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
                      autoComplete="off"
                    />
                  </div>

                  {/* CMR Number */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      CMR Number
                    </label>
                    <input
                      type="text"
                      name="cmrNumber"
                      value={editForm.cmrNumber}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* Lot Number */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Lot Number
                    </label>
                    <input
                      type="text"
                      name="lotNumber"
                      value={editForm.lotNumber}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  {/* KMS Year */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      KMS Year
                    </label>
                    <select
                      name="kmsYear"
                      value={editForm.kmsYear}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    >
                      <option value="">Select KMS Year</option>
                      {kmsYearOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Additional fields for Gate Pass type */}
                  {editForm.gatePassType === "Gate Pass" && (
                    <>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                          Total Qty
                        </label>
                        <input
                          type="number"
                          name="totalQty"
                          value={editForm.totalQty}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                          Size of Packets
                        </label>
                        <input
                          type="text"
                          name="sizeOfPackets"
                          value={editForm.sizeOfPackets}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                          Rate
                        </label>
                        <input
                          type="number"
                          name="rate"
                          value={editForm.rate}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                          Bill Details
                        </label>
                        <input
                          type="text"
                          name="billDetails"
                          value={editForm.billDetails}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                          Bill Weight (KG)
                        </label>
                        <input
                          type="number"
                          name="billWeight"
                          value={editForm.billWeight}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          name="invoiceNumber"
                          value={editForm.invoiceNumber}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                          Invoice Value
                        </label>
                        <input
                          type="number"
                          name="invoiceValue"
                          value={editForm.invoiceValue}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

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

export default GatePass;