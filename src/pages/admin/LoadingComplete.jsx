import React, { useState, useEffect, useRef } from "react";
import { Filter, X, Search, Edit, CheckCircle, Clock, ChevronDown, Upload, Camera, Loader2, Eye } from "lucide-react";

const API_URL = import.meta.env.VITE_SHEET_API_URL;
const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const DROP_DOWN_SHEET = import.meta.env.VITE_SHEET_DROP_NAME;
const DISPATCH_SHEET = import.meta.env.VITE_SHEET_DISPATCH;
const FOLDER_ID = import.meta.env.VITE_FOLDER_ID;

const formatGoogleDriveImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  if (url.startsWith('data:image')) {
    return url;
  }
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match && match[1]) {
    const fileId = match[1];    
    return `https://drive.google.com/uc?export=view&id=${fileId}`; // Corrected to match the Apps Script output
  }
  return url;
};

const LoadingComplete = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showFilters, setShowFilters] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [editingIndent, setEditingIndent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState({
    plantName: [],
    officeDispatcher: [],
    commodityType: [],
    munsiName: [],
    subCommodity: []
  });
  
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
        // Extract data from columns A, B, C, D, E (skip header row)
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
        
        // Get Munsi Names from column D (D2:D)
        const munsiNames = [];
        for (let i = 1; i < sheetData.length; i++) {
          if (sheetData[i][3]) {
            munsiNames.push(sheetData[i][3].trim());
          }
        }
        
        // Get Sub Commodities from column E (E2:E)
        const subCommodities = [];
        for (let i = 1; i < sheetData.length; i++) {
          if (sheetData[i][4]) {
            subCommodities.push(sheetData[i][4].trim());
          }
        }
        
        setDropdownOptions({
          plantName: [...new Set(plantNames)], // Remove duplicates
          officeDispatcher: [...new Set(dispatcherNames)], // Remove duplicates
          commodityType: [...new Set(commodityTypes)], // Remove duplicates
          munsiName: [...new Set(munsiNames)], // Remove duplicates
          subCommodity: [...new Set(subCommodities)] // Remove duplicates
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
              // Column M (12) - Not used
              // Column N (13) - Not used
              // Column O (14) - Not used
              vehicleReached: row[15] || '', // Column P
              // Column Q (16) - Not Null condition for pending
              // Column R (17) - Not Null condition for history (timestamp)
              timestamp: row[17] || '', // Column R
              // Column S (18) - Not used
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
              vehicleImage: row[32] || '', // Column AG (URL)
              loadingPacketName: row[67] || '', // Column BP
              loadingStatus: row[33] || '', // Column AH
              rowIndex: i + 1 // Store actual row index for updates
            };
            
            // Check conditions for pending vs history
            const hasColumnQ = row[16] && row[16].trim() !== ''; // Column Q not null
            const hasColumnR = row[17] && row[17].trim() !== ''; // Column R not null
            
            if (hasColumnQ && !hasColumnR) {
              // Pending: Column Q = Not Null, Column R = Null
              pendingData.push(indent);
            } else if (hasColumnQ && hasColumnR) {
              // History: Column Q = Not Null, Column R = Not Null
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

  // Upload image to Google Drive
  const uploadImageToDrive = async (file) => {
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result;
            const response = await fetch(API_URL, {
              method: 'POST',
              body: new URLSearchParams({
                action: 'uploadFile',
                base64Data: base64Data,
                fileName: `vehicle_${Date.now()}.jpg`,
                mimeType: 'image/jpeg',
                folderId: FOLDER_ID
              })
            });
            
            const result = await response.json();
            if (result.success) {
              resolve(result.fileUrl);
            } else {
              reject(new Error(result.error || 'Failed to upload image'));
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      throw error;
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
      loadingStatus: "Complete"
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
      totalPacket: parseInt(indent.totalPacket) || 0,
      loadingBhartiSize: indent.loadingBhartiSize || "",
      loadingQuantity: indent.loadingQuantity || "",
      loadingPacketType: indent.loadingPacketType || "",      
      loadingPacketName: indent.loadingPacketName || "",
      vehicleImage: null,
      imagePreview: formatGoogleDriveImageUrl(indent.vehicleImage) || null,
      loadingStatus: indent.loadingStatus || "Complete"
    });
    setShowEditModal(true);
  };

 const handleViewImage = (imageUrl) => {
    const formattedUrl = formatGoogleDriveImageUrl(imageUrl);
    if (formattedUrl) {
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    }
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

  // Process form submission
  const handleProcessSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      // Generate timestamp in DD/MM/YYYY hh:mm:ss format
      const now = new Date();
      const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      // Upload image if exists
      let imageUrl = '';
      if (processForm.vehicleImage) {
        imageUrl = await uploadImageToDrive(processForm.vehicleImage);
      }
      
      const rowIndex = selectedIndent.rowIndex;
      
      // Prepare update data for columns R through AH
      const rowData = [
        '', // Column A - keep original
        selectedIndent.indentNo, // Column B - keep original
        selectedIndent.plantName, // Column C - keep original
        selectedIndent.officeDispatcher, // Column D - keep original
        selectedIndent.partyName, // Column E - keep original
        selectedIndent.vehicleNo, // Column F - keep original
        selectedIndent.commodityType, // Column G - keep original
        selectedIndent.noOfPkts, // Column H - keep original
        selectedIndent.bhartiSize, // Column I - keep original
        selectedIndent.totalQty, // Column J - keep original
        selectedIndent.tyreWeight, // Column K - keep original
        selectedIndent.remarks, // Column L - keep original
        '', // Column M - keep original
        '', // Column N - keep original
        '', // Column O - keep original
        selectedIndent.vehicleReached, // Column P - keep original
        '', // Column Q - keep original
        timestamp, // Column R - NEW: Timestamp when loading completed
        '', // Column S - keep original
        processForm.munsiName, // Column T - NEW: Munsi Name
        processForm.driverName, // Column U - NEW: Driver Name
        processForm.driverNumber, // Column V - NEW: Driver Number
        processForm.subCommodity1, // Column W - NEW: Sub Commodity 1
        processForm.noOfPkts1, // Column X - NEW: No. of PKTS 1
        processForm.subCommodity2, // Column Y - NEW: Sub Commodity 2
        processForm.noOfPkts2, // Column Z - NEW: No. of PKTS 2
        processForm.subCommodity3, // Column AA - NEW: Sub Commodity 3
        processForm.noOfPkts3, // Column AB - NEW: No. of PKTS 3
        processForm.totalPacket, // Column AC - NEW: Total Packet
        processForm.loadingBhartiSize, // Column AD - NEW: Loading Bharti Size
        processForm.loadingQuantity, // Column AE - NEW: Loading Quantity
        processForm.loadingPacketType, // Column AF - NEW: Loading Packet Type
        imageUrl, // Column AG - NEW: Vehicle Image URL
        processForm.loadingStatus, // Column AH - NEW: Loading Status
        ...Array(33).fill(''), // Columns AI to BO
        processForm.loadingPacketName // Column BP - NEW: Loading Packet Name
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
        alert('Loading completed successfully!');
        
        // Reset form
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
          loadingStatus: "Complete"
        });
        
        setSelectedIndent(null);
        setShowProcessModal(false);
        
        // Refresh data from sheet
        await fetchIndents();
      } else {
        throw new Error(result.error || 'Failed to complete loading');
      }
    } catch (error) {
      console.error('Error completing loading:', error);
      alert(`Error completing loading: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      // Upload new image if exists
      let imageUrl = editingIndent.vehicleImage;
      if (editForm.vehicleImage) {
        imageUrl = await uploadImageToDrive(editForm.vehicleImage);
      }
      
      const rowIndex = editingIndent.rowIndex;
      
      // Prepare update data - only update columns T through AH
      const rowData = [
        '', // Column A - keep original
        editingIndent.indentNo, // Column B - keep original
        editingIndent.plantName, // Column C - keep original
        editingIndent.officeDispatcher, // Column D - keep original
        editingIndent.partyName, // Column E - keep original
        editingIndent.vehicleNo, // Column F - keep original
        editingIndent.commodityType, // Column G - keep original
        editingIndent.noOfPkts, // Column H - keep original
        editingIndent.bhartiSize, // Column I - keep original
        editingIndent.totalQty, // Column J - keep original
        editingIndent.tyreWeight, // Column K - keep original
        editingIndent.remarks, // Column L - keep original
        '', // Column M - keep original
        '', // Column N - keep original
        '', // Column O - keep original
        editingIndent.vehicleReached, // Column P - keep original
        '', // Column Q - keep original
        editingIndent.timestamp, // Column R - keep original
        '', // Column S - keep original
        editForm.munsiName, // Column T - updated
        editForm.driverName, // Column U - updated
        editForm.driverNumber, // Column V - updated
        editForm.subCommodity1, // Column W - updated
        editForm.noOfPkts1, // Column X - updated
        editForm.subCommodity2, // Column Y - updated
        editForm.noOfPkts2, // Column Z - updated
        editForm.subCommodity3, // Column AA - updated
        editForm.noOfPkts3, // Column AB - updated
        editForm.totalPacket, // Column AC - updated
        editForm.loadingBhartiSize, // Column AD - updated
        editForm.loadingQuantity, // Column AE - updated
        editForm.loadingPacketType, // Column AF - updated
        imageUrl, // Column AG - updated
        editForm.loadingStatus, // Column AH - updated
        ...Array(33).fill(''), // Columns AI to BO
        editForm.loadingPacketName // Column BP - updated
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
        alert('Loading details updated successfully!');
        
        // Reset form
        setEditForm({
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
        
        setEditingIndent(null);
        setShowEditModal(false);
        
        // Refresh data from sheet
        await fetchIndents();
      } else {
        throw new Error(result.error || 'Failed to update loading details');
      }
    } catch (error) {
      console.error('Error updating loading details:', error);
      alert(`Error updating loading details: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Filter options based on search
  const filteredSubCommodity1 = dropdownOptions.subCommodity.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.subCommodity1.toLowerCase())
  );

  const filteredSubCommodity2 = dropdownOptions.subCommodity.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.subCommodity2.toLowerCase())
  );

  const filteredSubCommodity3 = dropdownOptions.subCommodity.filter(commodity =>
    commodity.toLowerCase().includes(searchTerms.subCommodity3.toLowerCase())
  );

  const filteredEditSubCommodity1 = dropdownOptions.subCommodity.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.subCommodity1.toLowerCase())
  );

  const filteredEditSubCommodity2 = dropdownOptions.subCommodity.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.subCommodity2.toLowerCase())
  );

  const filteredEditSubCommodity3 = dropdownOptions.subCommodity.filter(commodity =>
    commodity.toLowerCase().includes(editSearchTerms.subCommodity3.toLowerCase())
  );

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
      
      {showEditDropdowns[field] && !loading && (
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
          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50">
            {formType === 'process' ? processForm.imagePreview : editForm.imagePreview ? (
              <img 
                src={formType === 'process' ? processForm.imagePreview : editForm.imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Upload</p>
              </div>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleImageUpload(e, formType)}
              disabled={loading}
            />
          </label>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Vehicle image (optional)</p>
            <p className="text-xs text-gray-500">Supported formats: JPG, PNG, JPEG</p>
          </div>
        </div>
        
        {/* Camera Option */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Or</span>
          <button
            type="button"
            onClick={openCamera}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-900 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </button>
        </div>
      </div>
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
                                  className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                                  style={{ backgroundColor: '#991b1b' }}
                                  disabled={loading}
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
                              Vehicle Reached
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
                              Sub Comm 1
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              PKTS 1
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Sub Comm 2
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              PKTS 2
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Sub Comm 3
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              PKTS 3
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Total Packet
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Bharti
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Qty
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Packet Type
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Loading Packet Name
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase whitespace-nowrap">
                              Vehicle Image
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
                                  {item.tyreWeight || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.vehicleReached || '-'}
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
                                <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap">
                                  {item.loadingStatus || '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="25" className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col gap-2 items-center">
                                  <CheckCircle className="w-8 h-8 text-gray-400" />
                                  <span>No completed loading records found</span>
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
                                  className="p-1 transition-colors hover:bg-blue-50 rounded text-blue-600 disabled:opacity-50"
                                  title="Edit"
                                  disabled={loading}
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
                                  <span className="text-xs font-medium text-gray-600 block">Vehicle Reached</span>
                                  <span className="text-sm font-medium text-gray-900 break-words">
                                    {item.vehicleReached || '-'}
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
                                  <span className="text-xs font-medium text-gray-600 block">Loading Packet Name</span>
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

                              {item.vehicleImage && (
                                <div>
                                  <button
                                    onClick={() => handleViewImage(item.vehicleImage)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    <Eye className="w-3 h-3" />
                                    View Vehicle Image
                                  </button>
                                </div>
                              )}
                              
                              {item.timestamp && (
                                <div className="text-xs text-gray-500">
                                  Loading Completed: {item.timestamp}
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
                Complete Loading - {selectedIndent.indentNo}
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
                      Munsi Name
                    </label>
                    <select
                      name="munsiName"
                      value={processForm.munsiName}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Munsi</option>
                      {dropdownOptions.munsiName.map((munsi, index) => (
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
                      value={processForm.driverName}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter driver name"
                      autoComplete="off"
                      disabled={loading}
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
                      value={processForm.driverNumber}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter driver number"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading bharti size"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading quantity"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading packet type"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading packet name"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  {/* Vehicle Image */}
                  {renderImageUploadSection('process')}

                  {/* Loading Status */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Loading Status
                    </label>
                    <select
                      name="loadingStatus"
                      value={processForm.loadingStatus}
                      onChange={handleProcessInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="Complete">Complete</option>
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
                Edit Loading Complete - {editingIndent.indentNo}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
                    >
                      <option value="">Select Munsi</option>
                      {dropdownOptions.munsiName.map((munsi, index) => (
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter driver name"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter driver number"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter number of packets"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading bharti size"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading quantity"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading packet type"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter loading packet name"
                      autoComplete="off"
                      disabled={loading}
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                      disabled={loading}
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

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
              <button
                onClick={closeCamera}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={loading}
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
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={captureImage}
                  disabled={!isCameraActive || loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Capture Photo
                </button>
              </div>
            </div>
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
              
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleCloseImageModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
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