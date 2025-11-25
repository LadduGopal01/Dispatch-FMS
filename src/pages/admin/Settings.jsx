import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, User, Phone, Key, Shield, Save } from "lucide-react";

const Settings = () => {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phoneNumber: "",
    userId: "",
    password: "",
    role: "User",
  });

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("systemUsers");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Add a default admin user
      const defaultUsers = [
        {
          id: "1",
          name: "Admin User",
          phoneNumber: "9876543210",
          userId: "admin",
          password: "admin123",
          role: "Admin",
        },
      ];
      setUsers(defaultUsers);
      localStorage.setItem("systemUsers", JSON.stringify(defaultUsers));
    }
  }, []);

  const handleAddNewUser = () => {
    setFormData({
      id: "",
      name: "",
      phoneNumber: "",
      userId: "",
      password: "",
      role: "User",
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      userId: user.userId,
      password: user.password,
      role: user.role,
    });
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem("systemUsers", JSON.stringify(updatedUsers));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      alert("Please enter user name");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      alert("Please enter phone number");
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

    if (editingId) {
      // Update existing user
      const updatedUsers = users.map((user) =>
        user.id === editingId ? { ...formData, id: editingId } : user
      );
      setUsers(updatedUsers);
      localStorage.setItem("systemUsers", JSON.stringify(updatedUsers));
    } else {
      // Add new user
      const newUser = {
        ...formData,
        id: Date.now().toString(),
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem("systemUsers", JSON.stringify(updatedUsers));
    }

    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      name: "",
      phoneNumber: "",
      userId: "",
      password: "",
      role: "User",
    });
    setEditingId(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
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
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 shadow-md"
            style={{ backgroundColor: '#991b1b' }}
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
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                    Phone Number
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
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.phoneNumber}
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
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
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
                    <h3 className="text-base font-bold text-gray-900">{user.name}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full mt-1 ${
                        user.role === "Admin"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{user.phoneNumber}</span>
                  </div>
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
                {editingId ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter phone number"
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
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter user ID"
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
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    placeholder="Enter password"
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
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-800 focus:border-transparent appearance-none bg-white"
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
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-md transition-all hover:opacity-90"
                  style={{ backgroundColor: '#991b1b' }}
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "Update" : "Save"}
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