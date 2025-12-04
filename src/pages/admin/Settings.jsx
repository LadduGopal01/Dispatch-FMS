import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, User, Phone, Key, Shield, Save, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_SHEET_API_URL;
const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const LOGIN_SHEET = import.meta.env.VITE_SHEET_LOGIN_NAME;

const Settings = () => {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    serialNo: "",
    userName: "",
    userId: "",
    password: "",
    role: "User",
  });

  // Fetch users from Google Sheets
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}?sheet=${LOGIN_SHEET}&action=getData`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch users data');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        const sheetData = data.data;
        const usersData = [];
        
        // Start from row 2 (index 1) as per specification
        for (let i = 1; i < sheetData.length; i++) {
          const row = sheetData[i];
          
          // Check if row has at least basic data (Serial No in column A)
          if (row[0]) { // Column A has data (Serial No)
            const user = {
              id: i + 1, // Use row number as ID for editing
              serialNo: row[0] || '', // Column A - Serial No
              userName: row[1] || '', // Column B - User Name
              userId: row[2] || '', // Column C - ID
              password: row[3] || '', // Column D - Pass
              role: row[4] || 'User', // Column E - Role
              rowIndex: i + 1 // Store actual row index for updates
            };
            usersData.push(user);
          }
        }
        
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate new Serial Number (SN-001, SN-002, etc.)
  const generateSerialNo = () => {
    if (users.length === 0) return 'SN-001';
    
    // Find the highest serial number
    const lastUser = users[users.length - 1];
    const match = lastUser.serialNo.match(/SN-(\d+)/);
    
    if (match) {
      const nextNum = parseInt(match[1]) + 1;
      return `SN-${String(nextNum).padStart(3, '0')}`;
    }
    
    // If no match found, generate based on count
    return `SN-${String(users.length + 1).padStart(3, '0')}`;
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddNewUser = () => {
    setFormData({
      serialNo: generateSerialNo(),
      userName: "",
      userId: "",
      password: "",
      role: "User",
    });
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setFormData({
      serialNo: user.serialNo,
      userName: user.userName,
      userId: user.userId,
      password: user.password,
      role: user.role,
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.userName}"?`)) {
      try {
        setLoading(true);
        
        const response = await fetch(API_URL, {
          method: 'POST',
          body: new URLSearchParams({
            action: 'delete',
            sheetName: LOGIN_SHEET,
            rowIndex: user.rowIndex
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('User deleted successfully!');
          await fetchUsers(); // Refresh data
        } else {
          throw new Error(result.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Error deleting user: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.userName.trim()) {
      alert("Please enter user name");
      return;
    }
    if (!formData.userId.trim()) {
      alert("Please enter user ID");
      return;
    }
    if (!formData.password.trim()) {
      alert("Please enter password");
      return;
    }
    if (!formData.role.trim()) {
      alert("Please select role");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare row data according to sheet columns
      const rowData = [
        formData.serialNo, // Column A - Serial No
        formData.userName, // Column B - User Name
        formData.userId,   // Column C - ID
        formData.password, // Column D - Pass
        formData.role      // Column E - Role
      ];

      let response;
      if (editingUser) {
        // Update existing row
        response = await fetch(API_URL, {
          method: 'POST',
          body: new URLSearchParams({
            action: 'update',
            sheetName: LOGIN_SHEET,
            rowIndex: editingUser.rowIndex,
            rowData: JSON.stringify(rowData)
          })
        });
      } else {
        // Insert new row
        response = await fetch(API_URL, {
          method: 'POST',
          body: new URLSearchParams({
            action: 'insert',
            sheetName: LOGIN_SHEET,
            rowData: JSON.stringify(rowData)
          })
        });
      }

      const result = await response.json();
      
      if (result.success) {
        alert(editingUser ? 'User updated successfully!' : 'User created successfully!');
        
        // Reset form
        setFormData({
          serialNo: "",
          userName: "",
          userId: "",
          password: "",
          role: "User",
        });
        
        setEditingUser(null);
        setShowModal(false);
        
        // Refresh data from sheet
        await fetchUsers();
      } else {
        throw new Error(result.error || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Error saving user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      serialNo: "",
      userName: "",
      userId: "",
      password: "",
      role: "User",
    });
    setEditingUser(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-red-800 animate-spin" />
            <p className="text-gray-700">Loading...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>

        {/* Add New User Button */}
        <div className="mb-6">
          <button
            onClick={handleAddNewUser}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 shadow-md disabled:opacity-50"
            style={{ backgroundColor: '#991b1b' }}
            disabled={loading}
          >
            <Plus className="w-5 h-5" />
            Add New User
          </button>
        </div>

        {/* Users Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                    Serial No
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                    Password
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.serialNo}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.userName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.userId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {"•".repeat(user.password.length)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            user.role === "Admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
                            disabled={loading}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
                            disabled={loading}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col gap-2 items-center">
                        <User className="w-12 h-12 text-gray-400" />
                        <span>No users found. Add your first user to get started.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Cards - Mobile */}
        <div className="lg:hidden space-y-4">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">{user.userName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-gray-600">{user.serialNo}</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          user.role === "Admin"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{user.userId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{"•".repeat(user.password.length)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No users found. Add your first user to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Serial Number (read-only for editing, auto-generated for new) */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Serial No
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.serialNo}
                    readOnly
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-900"
                  />
                </div>
              </div>

              {/* User Name */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  User Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                    placeholder="Enter user name"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* User ID */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  User ID <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                    placeholder="Enter user ID"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-50"
                    placeholder="Enter password"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Role <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent appearance-none bg-white disabled:opacity-50"
                    disabled={loading}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#991b1b' }}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingUser ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;