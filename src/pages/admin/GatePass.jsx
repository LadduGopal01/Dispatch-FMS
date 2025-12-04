import React, { useState, useEffect, useRef } from "react";
import { Filter, X, Search, Edit, CheckCircle, Clock, ChevronDown, Loader2, Eye, FileText, Truck, Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_SHEET_API_URL;
const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const DROP_DOWN_SHEET = import.meta.env.VITE_SHEET_DROP_NAME;
const DISPATCH_SHEET = import.meta.env.VITE_SHEET_DISPATCH;

const GatePass = () => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [showFilters, setShowFilters] = useState(false);
  const [showGatePassModal, setShowGatePassModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [editingIndent, setEditingIndent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [dropdownOptions, setDropdownOptions] = useState({
    plantName: [],
    officeDispatcher: [],
    commodityType: [],
    munsiName: [],
    subCommodity: [],
    kmsYear: []
  });
  
  const [filters, setFilters] = useState({
    plantName: "",
    officeDispatcher: "",
    partyName: "",
    vehicleNo: "",
    commodityType: "",
    indentNo: "",
  });

  const [gatePassForm, setGatePassForm] = useState({
    indentNo: "",
    plantName: "",
    officeDispatcher: "",
    partyName: "",
    vehicleNo: "",
    commodityType: "",
    tareWeight: "",
    loadingBhartiSize: "",
    loadingQuantity: "",
    loadingPacketType: "",
    loadingPacketName: "",
    vehicleImage: "",
    munsiName: "",
    loadingWeight: "",
    netWeight: "",
    gatePassType: "Civil Supply",
    gatePassNumber: "",
    date: "",
    vehicleNumber: "",
    vehicleType: "",
    transporterName: "",
    advanceGiven: "",
    freightPerQty: "",
    pumpName: "",
    dieselGiven: "",
    subCommodity1: "",
    noOfPkts1: "",
    subCommodity2: "",
    noOfPkts2: "",
    subCommodity3: "",
    noOfPkts3: "",
    totalPacket: 0,
    netWeightQuintal: 0,
    // Civil Supply Fields
    cmrNumber: "",
    lotNumber: "",
    driverName: "",
    driverNumber: "",
    kmsYear: "",
    // Normal Gate Pass Fields
    rate: "",
    billDetails: "",
    billWeight: "",
    invoiceNumber: "",
    invoiceValue: ""
  });

  const [editForm, setEditForm] = useState({
    loadingWeight: "",
    netWeight: "",
    gatePassType: "Civil Supply",
    gatePassNumber: "",
    date: "",
    vehicleNumber: "",
    vehicleType: "",
    transporterName: "",
    advanceGiven: "",
    freightPerQty: "",
    pumpName: "",
    dieselGiven: "",
    subCommodity1: "",
    noOfPkts1: "",
    subCommodity2: "",
    noOfPkts2: "",
    subCommodity3: "",
    noOfPkts3: "",
    totalPacket: 0,
    netWeightQuintal: 0,
    // Civil Supply Fields
    cmrNumber: "",
    lotNumber: "",
    driverName: "",
    driverNumber: "",
    kmsYear: "",
    // Normal Gate Pass Fields
    rate: "",
    billDetails: "",
    billWeight: "",
    invoiceNumber: "",
    invoiceValue: ""
  });

  const [pendingIndents, setPendingIndents] = useState([]);
  const [historyIndents, setHistoryIndents] = useState([]);
  const [filteredPending, setFilteredPending] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Format date to DD/MM/YYYY HH:MM:SS
  const formatDateTime = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Format date to YYYY-MM-DDTHH:MM for datetime-local input
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    
    const dateStr = String(dateString); // Convert to string to be safe
    // Check if date is already in DD/MM/YYYY HH:MM:SS format
    if (dateStr.includes('/')) {
      const parts = dateString.split(' ');
      const dateParts = parts[0].split('/');
      const timeParts = parts[1] ? parts[1].split(':') : ['00', '00', '00'];
      
      const day = dateParts[0].padStart(2, '0');
      const month = dateParts[1].padStart(2, '0');
      const year = dateParts[2];
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1] ? timeParts[1].padStart(2, '0') : '00';
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // If not in expected format, try to parse it
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Return current date if parsing fails
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch dropdown options from Google Sheets (Drop Down Master)
  const fetchDropdownOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}?sheet=${DROP_DOWN_SHEET}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch dropdown data');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        const sheetData = data.data;
        
        // Get Plant Names from column A (A2:A)
        const plantNames = [];
        // Get Office Dispatcher Names from column B (B2:B)
        const dispatcherNames = [];
        // Get Commodity Types from column C (C2:C)
        const commodityTypes = [];
        // Get Munsi Names from column D (D2:D)
        const munsiNames = [];
        // Get Sub Commodities from column E (E2:E)
        const subCommodities = [];
        // Get KMS Year from column F (F2:F)
        const kmsYears = [];
        
        for (let i = 1; i < sheetData.length; i++) {
          if (sheetData[i][0]) plantNames.push(sheetData[i][0].trim());
          if (sheetData[i][1]) dispatcherNames.push(sheetData[i][1].trim());
          if (sheetData[i][2]) commodityTypes.push(sheetData[i][2].trim());
          if (sheetData[i][3]) munsiNames.push(sheetData[i][3].trim());
          if (sheetData[i][4]) subCommodities.push(sheetData[i][4].trim());
          if (sheetData[i][5]) kmsYears.push(sheetData[i][5].trim());
        }
        
        setDropdownOptions({
          plantName: [...new Set(plantNames)],
          officeDispatcher: [...new Set(dispatcherNames)],
          commodityType: [...new Set(commodityTypes)],
          munsiName: [...new Set(munsiNames)],
          subCommodity: [...new Set(subCommodities)],
          kmsYear: [...new Set(kmsYears)]
        });
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      alert('Failed to load dropdown options. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch indents from Dispatch sheet
  const fetchIndents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}?sheet=${DISPATCH_SHEET}`
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
          
          if (row[1]) { // Column B has data (Indent No)
            const indent = {
              rowIndex: i + 1,
              // Pending/History Columns
              indentNo: row[1] || '', // Column B
              plantName: row[2] || '', // Column C
              officeDispatcher: row[3] || '', // Column D
              partyName: row[4] || '', // Column E
              vehicleNo: row[5] || '', // Column F
              commodityType: row[6] || '', // Column G
              noOfPkts: row[7] || '', // Column H
              bhartiSize: row[8] || '', // Column I
              loadingBhartiSize: row[29] || '', // Column AD
              loadingQuantity: row[30] || '', // Column AE
              loadingPacketType: row[31] || '', // Column AF
              loadingPacketName: row[67] || '', // Column BP
              vehicleImage: row[32] || '', // Column AG
              totalQty: row[9] || '', // Column J
              tareWeight: row[10] || '', // Column K
              vehicleReached: row[15] || '', // Column P
              munsiName: row[19] || '', // Column T
              driverName: row[20] || '', // Column U
              driverNumber: row[21] || '', // Column V
              subCommodity1: row[22] || '', // Column W
              noOfPkts1: row[23] || '', // Column X
              subCommodity2: row[24] || '', // Column Y
              noOfPkts2: row[25] || '', // Column Z
              subCommodity3: row[26] || '', // Column AA
              noOfPkts3: row[27] || '', // Column AB
              totalPacket: row[28] || '', // Column AC
              loadingBhartiSize: row[29] || '', // Column AD
              loadingQuantity: row[30] || '', // Column AE
              loadingPacketType: row[31] || '', // Column AF
              vehicleImage: row[32] || '', // Column AG
              // Gate Pass Columns
              loadingWeight: row[37] || '', // Column AL
              netWeight: row[38] || '', // Column AM
              gatePassType: row[39] || '', // Column AN
              gatePassNumber: row[40] || '', // Column AO
              date: row[41] || '', // Column AP
              vehicleNumber: row[42] || '', // Column AQ
              vehicleType: row[43] || '', // Column AR
              transporterName: row[44] || '', // Column AS
              advanceGiven: row[45] || '', // Column AT
              freightPerQty: row[46] || '', // Column AU
              pumpName: row[47] || '', // Column AV
              dieselGiven: row[48] || '', // Column AW
              subCommodity1_gp: row[49] || '', // Column AX
              noOfPkts1_gp: row[50] || '', // Column AY
              subCommodity2_gp: row[51] || '', // Column AZ
              noOfPkts2_gp: row[52] || '', // Column BA
              subCommodity3_gp: row[53] || '', // Column BB
              noOfPkts3_gp: row[54] || '', // Column BC
              totalPacket_gp: row[55] || '', // Column BD
              netWeightQuintal: row[56] || '', // Column BE
              rate: row[57] || '', // Column BF
              billDetails: row[58] || '', // Column BG
              billWeight: row[59] || '', // Column BH
              invoiceNumber: row[60] || '', // Column BI
              invoiceValue: row[61] || '', // Column BJ
              driverName_gp: row[62] || '', // Column BK
              driverNumber_gp: row[63] || '', // Column BL
              cmrNumber: row[64] || '', // Column BM
              lotNumber: row[65] || '', // Column BN
              kmsYear: row[66] || '' // Column BO
            };
            
            // Check conditions for pending vs history
            const hasColumnAI = row[34] && row[34].trim() !== ''; // Column AI (index 34) not null
            const hasColumnAJ = row[35] && row[35].trim() !== ''; // Column AJ (index 35) not null
            
            if (hasColumnAI && !hasColumnAJ) {
              // Pending: Column AI = Not Null, Column AJ = Null
              pendingData.push(indent);
            } else if (hasColumnAI && hasColumnAJ) {
              // History: Column AI = Not Null, Column AJ = Not Null
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

  // Calculate net weight and net weight quintal
  const calculateNetWeight = (loadingWeight, tareWeight) => {
    const loading = parseFloat(loadingWeight) || 0;
    const tare = parseFloat(tareWeight) || 0;
    const net = loading - tare;
    const netQuintal = net / 100;
    return { net, netQuintal };
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

  // Calculate total packets whenever packet counts change
  useEffect(() => {
    const total =
      (parseInt(gatePassForm.noOfPkts1, 10) || 0) +
      (parseInt(gatePassForm.noOfPkts2, 10) || 0) +
      (parseInt(gatePassForm.noOfPkts3, 10) || 0);
    
    setGatePassForm((prev) => ({
      ...prev,
      totalPacket: total,
    }));
  }, [gatePassForm.noOfPkts1, gatePassForm.noOfPkts2, gatePassForm.noOfPkts3]);

  useEffect(() => {
    const total =
      (parseInt(editForm.noOfPkts1, 10) || 0) +
      (parseInt(editForm.noOfPkts2, 10) || 0) +
      (parseInt(editForm.noOfPkts3, 10) || 0);
    setEditForm((prev) => ({ 
      ...prev, 
      totalPacket: total,
    }));
  }, [editForm.noOfPkts1, editForm.noOfPkts2, editForm.noOfPkts3]);

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

 const handleViewImage = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string') return;

    // This handles both `file/d/` and `uc?export=view&id=` formats
    const fileId = imageUrl.includes('file/d/') ? imageUrl.split('file/d/')[1].split('/')[0] : imageUrl.split('id=')[1];
    const formattedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCreateGatePass = (indent) => {
    setSelectedIndent(indent);
    
    const totalPkt = (parseInt(indent.noOfPkts1) || 0) + (parseInt(indent.noOfPkts2) || 0) + (parseInt(indent.noOfPkts3) || 0);
    const loading = parseFloat(gatePassForm.loadingWeight) || 0;
    const tare = parseFloat(indent.tareWeight) || 0;
    
    // Get current date-time for datetime-local input
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentDateTimeForInput = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setGatePassForm({
      indentNo: indent.indentNo,
      plantName: indent.plantName,
      officeDispatcher: indent.officeDispatcher,
      partyName: indent.partyName,
      vehicleNo: indent.vehicleNo,
      commodityType: indent.commodityType,
      tareWeight: indent.tareWeight,
      munsiName: indent.munsiName,
      loadingBhartiSize: indent.loadingBhartiSize,
      loadingQuantity: indent.loadingQuantity,
      loadingPacketType: indent.loadingPacketType,
      loadingPacketName: indent.loadingPacketName,
      loadingWeight: "",
      netWeight: (loading - tare).toString(),
      netWeightQuintal: (loading - tare) / 100,
      gatePassType: "Civil Supply",
      gatePassNumber: "",
      date: currentDateTimeForInput, // Use datetime-local format
      vehicleNumber: indent.vehicleNo,
      vehicleType: "",
      transporterName: "",
      advanceGiven: "",
      freightPerQty: "",
      pumpName: "",
      dieselGiven: "",
      subCommodity1: indent.subCommodity1,
      noOfPkts1: indent.noOfPkts1,
      subCommodity2: indent.subCommodity2,
      noOfPkts2: indent.noOfPkts2,
      subCommodity3: indent.subCommodity3,
      noOfPkts3: indent.noOfPkts3,
      totalPacket: totalPkt,
      // Civil Supply Fields
      cmrNumber: "",
      lotNumber: "",
      driverName: indent.driverName,
      driverNumber: indent.driverNumber,
      kmsYear: "",
      // Normal Gate Pass Fields
      rate: "",
      billDetails: "",
      billWeight: "",
      invoiceNumber: "",
      invoiceValue: ""
    });
    
    setShowGatePassModal(true);
  };

  const handleEditClick = (indent) => {
    setEditingIndent(indent);
    
    // Format date for datetime-local input
    const formattedDate = formatDateTimeForInput(indent.date);
    const { net } = calculateNetWeight(indent.loadingWeight, indent.tareWeight); // net is calculated, but netQuintal should come from data
    
    setEditForm({
      loadingWeight: indent.loadingWeight || "",
      netWeight: net.toString(),
      netWeightQuintal: parseFloat(indent.netWeightQuintal) || 0,
      gatePassType: indent.gatePassType || "Civil Supply",
      gatePassNumber: indent.gatePassNumber || "",      
      date: formattedDate || formatDateTimeForInput(new Date()),
      vehicleNumber: indent.vehicleNumber || indent.vehicleNo,
      vehicleType: indent.vehicleType || "",
      transporterName: indent.transporterName || "",
      advanceGiven: indent.advanceGiven || "",
      freightPerQty: indent.freightPerQty || "",
      pumpName: indent.pumpName || "",
      dieselGiven: indent.dieselGiven || "",
      subCommodity1: indent.subCommodity1_gp || indent.subCommodity1,
      noOfPkts1: indent.noOfPkts1_gp || indent.noOfPkts1,
      subCommodity2: indent.subCommodity2_gp || indent.subCommodity2,
      noOfPkts2: indent.noOfPkts2_gp || indent.noOfPkts2,
      subCommodity3: indent.subCommodity3_gp || indent.subCommodity3,
      noOfPkts3: indent.noOfPkts3_gp || indent.noOfPkts3,
      totalPacket: parseInt(indent.totalPacket_gp, 10) || 0,
      cmrNumber: indent.cmrNumber || "",
      lotNumber: indent.lotNumber || "",
      driverName: indent.driverName_gp || indent.driverName,
      driverNumber: indent.driverNumber_gp || indent.driverNumber,
      kmsYear: indent.kmsYear || "",
      // Normal Gate Pass Fields
      rate: indent.rate || "",
      billDetails: indent.billDetails || "",
      billWeight: indent.billWeight || "",
      invoiceNumber: indent.invoiceNumber || "",
      invoiceValue: indent.invoiceValue || ""
    });
    
    setShowEditModal(true);
  };

  const handleGatePassInputChange = (e) => {
    const { name, value } = e.target;
    
    setGatePassForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Recalculate net weight if loading weight changes
      if (name === 'loadingWeight') {
        const loading = parseFloat(value) || 0;
        const tare = parseFloat(prev.tareWeight) || 0;
        const net = loading - tare;
        newForm.netWeight = net.toString();
        newForm.netWeightQuintal = net / 100;
      }
      
      // Format date when date changes
      if (name === 'date') {
        // Keep the datetime-local format for the input
        // We'll format it to DD/MM/YYYY HH:MM:SS when saving
      }
      
      return newForm;
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    setEditForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Recalculate net weight if loading weight changes
      if (name === 'loadingWeight' && editingIndent) {
        const loading = parseFloat(value) || 0;
        const tare = parseFloat(editingIndent.tareWeight) || 0;
        const net = loading - tare;
        newForm.netWeight = net.toString();
        newForm.netWeightQuintal = net / 100;
      }
      
      // Format date when date changes
      if (name === 'date') {
        // Keep the datetime-local format for the input
        // We'll format it to DD/MM/YYYY HH:MM:SS when saving
      }
      
      return newForm;
    });
  };

  const handleGatePassSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const rowIndex = selectedIndent.rowIndex;
      
      // Prepare data for columns AL to BO (index 36 to 66)
      const rowData = Array(68).fill(''); // Create array for columns A to BO
      
      // Fill existing data (preserve columns A-AK)
      for (let i = 0; i < 36; i++) {
        // We'll preserve existing data by not overwriting these cells
        rowData[i] = '';
      }
      
      // Format date to DD/MM/YYYY HH:MM:SS
      let formattedDate = gatePassForm.date;
      if (gatePassForm.date) {
        const dateObj = new Date(gatePassForm.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = formatDateTime(dateObj);
        }
      }
      
      // Fill gate pass data starting from column AL (index 36)
      rowData[36] = gatePassForm.loadingWeight; // Column AL
      rowData[37] = gatePassForm.netWeight; // Column AM
      rowData[38] = gatePassForm.gatePassType; // Column AN
      rowData[39] = gatePassForm.gatePassNumber; // Column AO
      rowData[40] = formattedDate; // Column AP (formatted date)
      rowData[41] = gatePassForm.vehicleNumber; // Column AQ
      rowData[42] = gatePassForm.vehicleType; // Column AR
      rowData[43] = gatePassForm.transporterName; // Column AS
      rowData[44] = gatePassForm.advanceGiven; // Column AT
      rowData[45] = gatePassForm.freightPerQty; // Column AU
      rowData[46] = gatePassForm.pumpName; // Column AV
      rowData[47] = gatePassForm.dieselGiven; // Column AW
      rowData[48] = gatePassForm.subCommodity1; // Column AX
      rowData[49] = gatePassForm.noOfPkts1; // Column AY
      rowData[50] = gatePassForm.subCommodity2; // Column AZ
      rowData[51] = gatePassForm.noOfPkts2; // Column BA
      rowData[52] = gatePassForm.subCommodity3; // Column BB
      rowData[53] = gatePassForm.noOfPkts3; // Column BC
      rowData[54] = gatePassForm.totalPacket; // Column BD
      rowData[55] = gatePassForm.netWeightQuintal; // Column BE
      
      if (gatePassForm.gatePassType === 'Civil Supply') {
        rowData[63] = gatePassForm.cmrNumber; // Column BM
        rowData[64] = gatePassForm.lotNumber; // Column BN
        rowData[65] = gatePassForm.kmsYear; // Column BO
      } else {
        rowData[56] = gatePassForm.rate; // Column BF
        rowData[57] = gatePassForm.billDetails; // Column BG
        rowData[58] = gatePassForm.billWeight; // Column BH
        rowData[59] = gatePassForm.invoiceNumber; // Column BI
        rowData[60] = gatePassForm.invoiceValue; // Column BJ
      }
      
      rowData[61] = gatePassForm.driverName; // Column BK
      rowData[62] = gatePassForm.driverNumber; // Column BL
      
      // Also need to mark column AJ (index 35) as filled for history
      rowData[35] = formatDateTime(new Date());

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
        alert('Gate Pass created successfully!');
        setShowGatePassModal(false);
        setSelectedIndent(null);
        await fetchIndents();
      } else {
        throw new Error(result.error || 'Failed to create gate pass');
      }
    } catch (error) {
      console.error('Error creating gate pass:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const rowIndex = editingIndent.rowIndex;
      
      // Prepare data for columns AL to BO (index 36 to 66)
      const rowData = Array(68).fill(''); // Create array for columns A to BO
      
      // Fill existing data (preserve columns A-AK)
      for (let i = 0; i < 36; i++) {
        // We'll preserve existing data by not overwriting these cells
        rowData[i] = '';
      }
      
      // Format date to DD/MM/YYYY HH:MM:SS
      let formattedDate = editForm.date;
      if (editForm.date) {
        const dateObj = new Date(editForm.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = formatDateTime(dateObj);
        }
      }
      
      // Fill gate pass data starting from column AL (index 36)
      rowData[36] = editForm.loadingWeight; // Column AL
      rowData[37] = editForm.netWeight; // Column AM
      rowData[38] = editForm.gatePassType; // Column AN
      rowData[39] = editForm.gatePassNumber; // Column AO
      rowData[40] = formattedDate; // Column AP (formatted date)
      rowData[41] = editForm.vehicleNumber; // Column AQ
      rowData[42] = editForm.vehicleType; // Column AR
      rowData[43] = editForm.transporterName; // Column AS
      rowData[44] = editForm.advanceGiven; // Column AT
      rowData[45] = editForm.freightPerQty; // Column AU
      rowData[46] = editForm.pumpName; // Column AV
      rowData[47] = editForm.dieselGiven; // Column AW
      rowData[48] = editForm.subCommodity1; // Column AX
      rowData[49] = editForm.noOfPkts1; // Column AY
      rowData[50] = editForm.subCommodity2; // Column AZ
      rowData[51] = editForm.noOfPkts2; // Column BA
      rowData[52] = editForm.subCommodity3; // Column BB
      rowData[53] = editForm.noOfPkts3; // Column BC
      rowData[54] = editForm.totalPacket; // Column BD
      rowData[55] = editForm.netWeightQuintal; // Column BE
      
      if (editForm.gatePassType === 'Civil Supply') {
        rowData[63] = editForm.cmrNumber; // Column BM
        rowData[64] = editForm.lotNumber; // Column BN
        rowData[65] = editForm.kmsYear; // Column BO
      } else {
        rowData[56] = editForm.rate; // Column BF
        rowData[57] = editForm.billDetails; // Column BG
        rowData[58] = editForm.billWeight; // Column BH
        rowData[59] = editForm.invoiceNumber; // Column BI
        rowData[60] = editForm.invoiceValue; // Column BJ
      }
      
      rowData[61] = editForm.driverName; // Column BK
      rowData[62] = editForm.driverNumber; // Column BL

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
        alert('Gate Pass updated successfully!');
        setShowEditModal(false);
        setEditingIndent(null);
        await fetchIndents();
      } else {
        throw new Error(result.error || 'Failed to update gate pass');
      }
    } catch (error) {
      console.error('Error updating gate pass:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowGatePassModal(false);
    setSelectedIndent(null);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingIndent(null);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

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
        {/* Header */}
        <div className="flex-shrink-0 p-4 lg:p-6 bg-gray-50">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gate Pass Management</h1>
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
                              Total Qty
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Tare Weight
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Vehicle Reached
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Bharti Size
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Packet Name
                            </th>
                            <th className="px-3 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Munsi Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Driver Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Driver Number
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Vehicle Image
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredPending.length > 0 ? (
                            filteredPending.map((item) => (
                              <tr key={item.rowIndex} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                  <button
                                    onClick={() => handleCreateGatePass(item)}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: '#991b1b' }}
                                    disabled={loading}
                                  >
                                    Create Gate Pass
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
                                  {item.tareWeight || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.vehicleReached || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.loadingBhartiSize || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.loadingPacketName || '-'}
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
                                  {item.vehicleImage ? (
                                    <button
                                      onClick={() => handleViewImage(item.vehicleImage)}
                                      className="p-1 transition-colors hover:bg-blue-50 rounded text-blue-600"
                                      title="View Image"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  ) : '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="19" className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col gap-2 items-center">
                                  <Clock className="w-8 h-8 text-gray-400" />
                                  <span>No pending gate pass records found</span>
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
                          <div key={item.rowIndex} className="bg-white border border-gray-200 rounded-lg p=4 shadow-sm">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{item.indentNo}</h3>
                                  <p className="text-sm text-gray-600">{item.plantName}</p>
                                </div>
                                <button
                                  onClick={() => handleCreateGatePass(item)}
                                  className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                                  style={{ backgroundColor: '#991b1b' }}
                                  disabled={loading}
                                >
                                  Create Gate Pass
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
                                    {item.tareWeight || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Loading Bharti Size</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.loadingBhartiSize || '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-600 block">Loading Packet Name</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.loadingPacketName || '-'}
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
                                  <span className="text-xs font-medium text-gray-600 block">Vehicle Image</span>
                                  {item.vehicleImage ? (
                                    <button
                                      onClick={() => handleViewImage(item.vehicleImage)}
                                      className="p-1 transition-colors hover:bg-blue-50 rounded text-blue-600"
                                      title="View Image"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  ) : '-'}
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
                        Showing <span className="font-semibold">{filteredHistory.length}</span> completed gate passes
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
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Action</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Indent No</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Plant Name</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Office Dispatcher</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Party Name</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Commodity Type</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Tare Weight</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Munsi Name</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Loading Bharti Size</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Loading Quantity</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Loading Packet Type</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Loading Packet Name</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Loading Weight</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Net Weight</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Gate Pass Type</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Gate Pass No</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Vehicle Number</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Vehicle Type</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Transporter Name</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Advance Given</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Freight Per QTY</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Pump Name</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Diesel Given</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Sub Commodity 1</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">No. of Pkts 1</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Sub Commodity 2</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">No. of Pkts 2</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Sub Commodity 3</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">No. of Pkts 3</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Total Packet</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Net Weight (Quintal)</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">CMR Number</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Lot Number</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Driver Name</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Driver Number</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">KMS Year</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Rate</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Bill Details</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Bill Weight</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Invoice Number</th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">Invoice Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredHistory.length > 0 ? (
                            filteredHistory.map((item) => (
                              <tr key={item.rowIndex} className="hover:bg-gray-50 transition-colors">
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
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{item.indentNo}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs"><div className="break-words" title={item.plantName}>{item.plantName}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs"><div className="break-words" title={item.officeDispatcher}>{item.officeDispatcher}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs"><div className="break-words" title={item.partyName}>{item.partyName}</div></td>
                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{item.commodityType}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.tareWeight || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.munsiName || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.loadingBhartiSize || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.loadingQuantity || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.loadingPacketType || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.loadingPacketName || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.loadingWeight || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.netWeight || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap"><span className={`px-2 py-1 text-xs font-medium rounded-full ${item.gatePassType === 'Civil Supply' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{item.gatePassType || '-'}</span></td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.gatePassNumber || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.date || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.vehicleNumber || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.vehicleType || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.transporterName || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.advanceGiven || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.freightPerQty || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.pumpName || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.dieselGiven || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.subCommodity1_gp || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.noOfPkts1_gp || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.subCommodity2_gp || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.noOfPkts2_gp || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.subCommodity3_gp || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.noOfPkts3_gp || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.totalPacket_gp || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.netWeightQuintal || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.cmrNumber || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.lotNumber || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.driverName_gp || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.driverNumber_gp || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.kmsYear || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.rate || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.billDetails || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.billWeight || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.invoiceNumber || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">{item.invoiceValue || '-'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="42" className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col gap-2 items-center">
                                  <CheckCircle className="w-8 h-8 text-gray-400" />
                                  <span>No completed gate pass records found</span>
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
                        <span className="font-semibold">{filteredHistory.length}</span> completed gate passes
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
                          <div key={item.rowIndex} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
                                <div><span className="text-xs font-medium text-gray-600 block">Dispatcher</span><span className="text-sm font-medium text-gray-900 break-words">{item.officeDispatcher}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Party</span><span className="text-sm font-medium text-gray-900 break-words">{item.partyName}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Commodity</span><span className="text-sm font-medium text-gray-900 break-words">{item.commodityType}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Tare Weight</span><span className="text-sm font-medium text-gray-900 break-words">{item.tareWeight || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Munsi Name</span><span className="text-sm font-medium text-gray-900 break-words">{item.munsiName || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Loading Bharti Size</span><span className="text-sm font-medium text-gray-900 break-words">{item.loadingBhartiSize || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Loading Quantity</span><span className="text-sm font-medium text-gray-900 break-words">{item.loadingQuantity || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Loading Packet Type</span><span className="text-sm font-medium text-gray-900 break-words">{item.loadingPacketType || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Loading Packet Name</span><span className="text-sm font-medium text-gray-900 break-words">{item.loadingPacketName || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Loading Weight</span><span className="text-sm font-medium text-gray-900 break-words">{item.loadingWeight || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Net Weight</span><span className="text-sm font-medium text-gray-900 break-words">{item.netWeight || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Gate Pass Type</span><span className={`px-2 py-1 text-xs font-medium rounded-full ${item.gatePassType === 'Civil Supply' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{item.gatePassType || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Gate Pass No</span><span className="text-sm font-medium text-gray-900 break-words">{item.gatePassNumber || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Date</span><span className="text-sm font-medium text-gray-900 break-words">{item.date || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Vehicle Number</span><span className="text-sm font-medium text-gray-900 break-words">{item.vehicleNumber || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Vehicle Type</span><span className="text-sm font-medium text-gray-900 break-words">{item.vehicleType || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Transporter Name</span><span className="text-sm font-medium text-gray-900 break-words">{item.transporterName || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Advance Given</span><span className="text-sm font-medium text-gray-900 break-words">{item.advanceGiven || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Freight Per QTY</span><span className="text-sm font-medium text-gray-900 break-words">{item.freightPerQty || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Pump Name</span><span className="text-sm font-medium text-gray-900 break-words">{item.pumpName || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Diesel Given</span><span className="text-sm font-medium text-gray-900 break-words">{item.dieselGiven || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Sub Commodity 1</span><span className="text-sm font-medium text-gray-900 break-words">{item.subCommodity1_gp || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">No. of Pkts 1</span><span className="text-sm font-medium text-gray-900 break-words">{item.noOfPkts1_gp || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Sub Commodity 2</span><span className="text-sm font-medium text-gray-900 break-words">{item.subCommodity2_gp || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">No. of Pkts 2</span><span className="text-sm font-medium text-gray-900 break-words">{item.noOfPkts2_gp || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Sub Commodity 3</span><span className="text-sm font-medium text-gray-900 break-words">{item.subCommodity3_gp || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">No. of Pkts 3</span><span className="text-sm font-medium text-gray-900 break-words">{item.noOfPkts3_gp || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Total Packet</span><span className="text-sm font-medium text-gray-900 break-words">{item.totalPacket_gp || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Net Weight (Quintal)</span><span className="text-sm font-medium text-gray-900 break-words">{item.netWeightQuintal || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">CMR Number</span><span className="text-sm font-medium text-gray-900 break-words">{item.cmrNumber || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Lot Number</span><span className="text-sm font-medium text-gray-900 break-words">{item.lotNumber || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Driver Name</span><span className="text-sm font-medium text-gray-900 break-words">{item.driverName_gp || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Driver Number</span><span className="text-sm font-medium text-gray-900 break-words">{item.driverNumber_gp || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">KMS Year</span><span className="text-sm font-medium text-gray-900 break-words">{item.kmsYear || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Rate</span><span className="text-sm font-medium text-gray-900 break-words">{item.rate || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Bill Details</span><span className="text-sm font-medium text-gray-900 break-words">{item.billDetails || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Bill Weight</span><span className="text-sm font-medium text-gray-900 break-words">{item.billWeight || '-'}</span></div>
                                <div><span className="text-xs font-medium text-gray-600 block">Invoice Number</span><span className="text-sm font-medium text-gray-900 break-words">{item.invoiceNumber || '-'}</span></div>
 G                               <div><span className="text-xs font-medium text-gray-600 block">Invoice Value</span><span className="text-sm font-medium text-gray-900 break-words">{item.invoiceValue || '-'}</span></div>
                              </div>
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

      {/* Gate Pass Modal */}
      {showGatePassModal && selectedIndent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Gate Pass - {selectedIndent.indentNo}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGatePassSubmit} className="p-4 space-y-6">
              {/* Pre-filled Indent Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Indent Information (Preview)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-2 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Indent Number'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.indentNo}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Plant Name'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.plantName}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Party Name'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.partyName}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Munsi Name'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.munsiName || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Driver Name'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.driverName || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Driver Number'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.driverNumber || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Sub Commodity 1'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.subCommodity1 || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'No. of PKTS 1'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.noOfPkts1 || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Sub Commodity 2'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.subCommodity2 || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'No. of PKTS 2'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.noOfPkts2 || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Sub Commodity 3'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.subCommodity3 || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'No. of PKTS 3'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.noOfPkts3 || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Total Packet'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.totalPacket || '0'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Loading Bharti Size'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.loadingBhartiSize || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Loading Quantity'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.loadingQuantity || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Loading Packet Type'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.loadingPacketType || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">'Loading Packet Name'</label>
                    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.loadingPacketName || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gate Pass Form */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Gate Pass Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  {/* Basic Fields */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Loading Weight</label>
                    <input
                      type="number"
                      name="loadingWeight"
                      value={gatePassForm.loadingWeight}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading weight"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Tare Weight</label>
                    <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {selectedIndent.tareWeight || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Net Weight</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {gatePassForm.netWeight}
                    </div>
                  </div>

                  <div>
                  {gatePassForm.loadingWeight && ( <> <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Gate Pass Type</label>
                    <select
                      name="gatePassType"
                      value={gatePassForm.gatePassType}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="Civil Supply">Civil Supply</option>
                      <option value="Normal Gate Pass">Normal Gate Pass</option>
                    </select>
                  </div></>)}</div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Gate Pass Number</label>
                    <input
                      type="text"
                      name="gatePassNumber"
                      value={gatePassForm.gatePassNumber}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter gate pass number"
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Updated Date Field with Date Picker */}
                  {gatePassForm.loadingWeight && (<>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                      <input
                        type="datetime-local"
                        name="date"
                        value={gatePassForm.date}
                        onChange={handleGatePassInputChange}
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                        disabled={loading}
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Format: YYYY-MM-DD HH:MM
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Vehicle Number</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={gatePassForm.vehicleNumber}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter vehicle number"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={gatePassForm.vehicleType}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="Company Vehicle">Company Vehicle</option>
                      <option value="Party Vehicle">Party Vehicle</option>
                      <option value="Transporter Vehicle">Transporter Vehicle</option>
                    </select>
                  </div>

                  {/* Conditional Fields for Transporter Vehicle */}
                  {gatePassForm.vehicleType === 'Transporter Vehicle' && (
                    <>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Transporter Name</label>
                        <input
                          type="text"
                          name="transporterName"
                          value={gatePassForm.transporterName}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter transporter name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Advance Given</label>
                        <input
                          type="number"
                          name="advanceGiven"
                          value={gatePassForm.advanceGiven}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter advance amount"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Freight Per QTY</label>
                        <input
                          type="number"
                          name="freightPerQty"
                          value={gatePassForm.freightPerQty}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter freight per quantity"
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}

                  {/* Conditional Fields for Company or Transporter Vehicle */}
                  {(gatePassForm.vehicleType === 'Company Vehicle' || gatePassForm.vehicleType === 'Transporter Vehicle') && (
                    <>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Pump Name</label>
                        <input
                          type="text"
                          name="pumpName"
                          value={gatePassForm.pumpName}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter pump name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Diesel Given</label>
                        <input
                          type="number"
                          name="dieselGiven"
                          value={gatePassForm.dieselGiven}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter diesel quantity"
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}

                  {/* Sub Commodity Fields */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Sub Commodity 1</label>
                    <select
                      name="subCommodity1"
                      value={gatePassForm.subCommodity1}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Sub Commodity</option>
                      {dropdownOptions.subCommodity.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">No. of PKTS 1</label>
                    <input
                      type="number"
                      name="noOfPkts1"
                      value={gatePassForm.noOfPkts1}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Sub Commodity 2</label>
                    <select
                      name="subCommodity2"
                      value={gatePassForm.subCommodity2}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Sub Commodity</option>
                      {dropdownOptions.subCommodity.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">No. of PKTS 2</label>
                    <input
                      type="number"
                      name="noOfPkts2"
                      value={gatePassForm.noOfPkts2}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Sub Commodity 3</label>
                    <select
                      name="subCommodity3"
                      value={gatePassForm.subCommodity3}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Sub Commodity</option>
                      {dropdownOptions.subCommodity.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">No. of PKTS 3</label>
                    <input
                      type="number"
                      name="noOfPkts3"
                      value={gatePassForm.noOfPkts3}
                      onChange={handleGatePassInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Total Packet</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {gatePassForm.totalPacket}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Net Weight (Quintal)</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {gatePassForm.netWeightQuintal.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Conditional Fields based on Gate Pass Type */}
                  {gatePassForm.gatePassType === 'Civil Supply' ? (
                    <>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">CMR Number</label>
                        <input
                          type="text"
                          name="cmrNumber"
                          value={gatePassForm.cmrNumber}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter CMR number"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Lot Number</label>
                        <input
                          type="text"
                          name="lotNumber"
                          value={gatePassForm.lotNumber}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter lot number"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Driver Name</label>
                        <input
                          type="text"
                          name="driverName"
                          value={gatePassForm.driverName}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter driver name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Driver Number</label>
                        <input
                          type="text"
                          name="driverNumber"
                          value={gatePassForm.driverNumber}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter driver number"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">KMS Year</label>
                        <select
                          name="kmsYear"
                          value={gatePassForm.kmsYear}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          disabled={loading}
                        >
                          <option value="">Select KMS Year</option>
                          {dropdownOptions.kmsYear.map((year, index) => (
                            <option key={index} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Rate</label>
                        <input
                          type="number"
                          name="rate"
                          value={gatePassForm.rate}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter rate"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Bill Details</label>
                        <input
                          type="text"
                          name="billDetails"
                          value={gatePassForm.billDetails}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter bill details"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Bill Weight</label>
                        <input
                          type="number"
                          name="billWeight"
                          value={gatePassForm.billWeight}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter bill weight"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Invoice Number</label>
                        <input
                          type="text"
                          name="invoiceNumber"
                          value={gatePassForm.invoiceNumber}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter invoice number"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Invoice Value</label>
                        <input
                          type="number"
                          name="invoiceValue"
                          value={gatePassForm.invoiceValue}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter invoice value"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Driver Name</label>
                        <input
                          type="text"
                          name="driverName"
                          value={gatePassForm.driverName}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter driver name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Driver Number</label>
                        <input
                          type="text"
                          name="driverNumber"
                          value={gatePassForm.driverNumber}
                          onChange={handleGatePassInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter driver number"
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}
                </>)}</div>
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
                    'Create Gate Pass'
                  )}
                </button>
              </div>
            </form>
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
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 space-y-6">
              {/* Gate Pass Form */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Edit Gate Pass Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  {/* Basic Fields */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Loading Weight</label>
                    <input
                      type="number"
                      name="loadingWeight"
                      value={editForm.loadingWeight}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading weight"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Net Weight</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {editForm.netWeight}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Gate Pass Type</label>
                    <select
                      name="gatePassType"
                      value={editForm.gatePassType}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="Civil Supply">Civil Supply</option>
                      <option value="Normal Gate Pass">Normal Gate Pass</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Gate Pass Number</label>
                    <input
                      type="text"
                      name="gatePassNumber"
                      value={editForm.gatePassNumber}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter gate pass number"
                      disabled={loading}
                    />
                  </div>

                  {/* Updated Date Field with Date Picker */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                      <input
                        type="datetime-local"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditInputChange}
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                        disabled={loading}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Format: YYYY-MM-DD HH:MM
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Vehicle Number</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={editForm.vehicleNumber}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter vehicle number"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={editForm.vehicleType}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="Company Vehicle">Company Vehicle</option>
                      <option value="Party Vehicle">Party Vehicle</option>
                      <option value="Transporter Vehicle">Transporter Vehicle</option>
                    </select>
                  </div>

                  {/* Conditional Fields for Transporter Vehicle */}
                  {editForm.vehicleType === 'Transporter Vehicle' && (
                    <>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Transporter Name</label>
                        <input
                          type="text"
                          name="transporterName"
                          value={editForm.transporterName}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter transporter name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Advance Given</label>
                        <input
                          type="number"
                          name="advanceGiven"
                          value={editForm.advanceGiven}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter advance amount"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Freight Per QTY</label>
                        <input
                          type="number"
                          name="freightPerQty"
                          value={editForm.freightPerQty}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter freight per quantity"
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}

                  {/* Conditional Fields for Company or Transporter Vehicle */}
                  {(editForm.vehicleType === 'Company Vehicle' || editForm.vehicleType === 'Transporter Vehicle') && (
                    <>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Pump Name</label>
                        <input
                          type="text"
                          name="pumpName"
                          value={editForm.pumpName}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter pump name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Diesel Given</label>
                        <input
                          type="number"
                          name="dieselGiven"
                          value={editForm.dieselGiven}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter diesel quantity"
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}

                  {/* Sub Commodity Fields */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Sub Commodity 1</label>
                    <select
                      name="subCommodity1"
                      value={editForm.subCommodity1}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Sub Commodity</option>
                      {dropdownOptions.subCommodity.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">No. of PKTS 1</label>
                    <input
                      type="number"
                      name="noOfPkts1"
                      value={editForm.noOfPkts1}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Sub Commodity 2</label>
                    <select
                      name="subCommodity2"
                      value={editForm.subCommodity2}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Sub Commodity</option>
                      {dropdownOptions.subCommodity.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">No. of PKTS 2</label>
                    <input
                      type="number"
                      name="noOfPkts2"
                      value={editForm.noOfPkts2}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Sub Commodity 3</label>
                    <select
                      name="subCommodity3"
                      value={editForm.subCommodity3}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Sub Commodity</option>
                      {dropdownOptions.subCommodity.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">No. of PKTS 3</label>
                    <input
                      type="number"
                      name="noOfPkts3"
                      value={editForm.noOfPkts3}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Total Packet</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {editForm.totalPacket}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Net Weight (Quintal)</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900">
                      {editForm.netWeightQuintal.toFixed(2)}
                    </div>
                  </div>

                  {/* Conditional Fields based on Gate Pass Type */}
                  {editForm.gatePassType === 'Civil Supply' ? (
                    <>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">CMR Number</label>
                        <input
                          type="text"
                          name="cmrNumber"
                          value={editForm.cmrNumber}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter CMR number"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Lot Number</label>
                        <input
                          type="text"
                          name="lotNumber"
                          value={editForm.lotNumber}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter lot number"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Driver Name</label>
                        <input
                          type="text"
                          name="driverName"
                          value={editForm.driverName}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter driver name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Driver Number</label>
                        <input
                          type="text"
                          name="driverNumber"
                          value={editForm.driverNumber}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter driver number"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">KMS Year</label>
                        <select
                          name="kmsYear"
                          value={editForm.kmsYear}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          disabled={loading}
                        >
                          <option value="">Select KMS Year</option>
                          {dropdownOptions.kmsYear.map((year, index) => (
                            <option key={index} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Rate</label>
                        <input
                          type="number"
                          name="rate"
                          value={editForm.rate}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter rate"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Bill Details</label>
                        <input
                          type="text"
                          name="billDetails"
                          value={editForm.billDetails}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter bill details"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Bill Weight</label>
                        <input
                          type="number"
                          name="billWeight"
                          value={editForm.billWeight}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter bill weight"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Invoice Number</label>
                        <input
                          type="text"
                          name="invoiceNumber"
                          value={editForm.invoiceNumber}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter invoice number"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Invoice Value</label>
                        <input
                          type="number"
                          name="invoiceValue"
                          value={editForm.invoiceValue}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter invoice value"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Driver Name</label>
                        <input
                          type="text"
                          name="driverName"
                          value={editForm.driverName}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter driver name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Driver Number</label>
                        <input
                          type="text"
                          name="driverNumber"
                          value={editForm.driverNumber}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter driver number"
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

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
                    'Update Gate Pass'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Image</h3>
              <button
                onClick={handleCloseImageModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex justify-center">
                <img 
                  src={selectedImage} 
                  alt="Vehicle" 
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GatePass;