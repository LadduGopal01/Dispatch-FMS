import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Truck, 
  PackageCheck, 
  ClipboardCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Package,
  Users,
  Activity,
  ArrowRight,
  RefreshCw
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIndents: 0,
    pendingProcessing: 0,
    processedIndents: 0,
    pendingLoading: 0,
    loadingCompleted: 0,
    pendingGatePass: 0,
    gatePassCompleted: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    
    try {
      // Load all data from localStorage
      const indents = JSON.parse(localStorage.getItem("indents") || "[]");
      const indentHistory = JSON.parse(localStorage.getItem("indentHistory") || "[]");
      const loadingCompleteHistory = JSON.parse(localStorage.getItem("loadingCompleteHistory") || "[]");
      const gatePassHistory = JSON.parse(localStorage.getItem("gatePassHistory") || "[]");

      // Calculate statistics
      const pendingProcessing = indents.length;
      const processedIndents = indentHistory.length;
      
      // Pending loading = processed indents that haven't been marked as loading completed
      const pendingLoading = indentHistory.filter(item => 
        item.status === "Complete" && !item.loadingCompleted
      ).length;
      
      const loadingCompleted = loadingCompleteHistory.length;
      
      // Pending gate pass = loading completed items that haven't been processed for gate pass
      const pendingGatePass = loadingCompleteHistory.filter(item => 
        item.status === "Complete" && !item.gatePassCompleted
      ).length;
      
      const gatePassCompleted = gatePassHistory.length;

      setStats({
        totalIndents: indents.length + indentHistory.length,
        pendingProcessing,
        processedIndents,
        pendingLoading,
        loadingCompleted,
        pendingGatePass,
        gatePassCompleted
      });

      // Compile recent activities
      const activities = [];

      // Recent gate pass completions
      gatePassHistory.slice(-5).reverse().forEach(item => {
        activities.push({
          id: `gp-${item.id}`,
          type: 'gatepass',
          title: 'Gate Pass Completed',
          description: `${item.indentNo} - ${item.partyName}`,
          timestamp: item.gatePassCompletedAt,
          icon: ClipboardCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        });
      });

      // Recent loading completions
      loadingCompleteHistory.slice(-5).reverse().forEach(item => {
        activities.push({
          id: `lc-${item.id}`,
          type: 'loading',
          title: 'Loading Completed',
          description: `${item.indentNo} - ${item.vehicleNo}`,
          timestamp: item.loadingCompletedAt,
          icon: PackageCheck,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        });
      });

      // Recent indent processing
      indentHistory.slice(-5).reverse().forEach(item => {
        activities.push({
          id: `ip-${item.id}`,
          type: 'processing',
          title: 'Indent Processed',
          description: `${item.indentNo} - ${item.plantName}`,
          timestamp: item.processedAt,
          icon: Truck,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        });
      });

      // Sort by timestamp and take top 10
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivities(activities.slice(0, 10));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate completion rate
  const completionRate = stats.totalIndents > 0 
    ? Math.round((stats.gatePassCompleted / stats.totalIndents) * 100)
    : 0;

  const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const WorkflowStageCard = ({ title, pending, completed, icon: Icon, color, bgColor, route }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            Pending
          </span>
          <span className="text-lg font-bold text-orange-600">{pending}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Completed
          </span>
          <span className="text-lg font-bold text-green-600">{completed}</span>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{completed + pending > 0 ? Math.round((completed / (completed + pending)) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${bgColor} ${color.replace('text', 'bg')}`}
              style={{ width: `${completed + pending > 0 ? (completed / (completed + pending)) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-[88vh] bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-red-800 animate-spin" />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[88vh] bg-gray-50 overflow-y-auto">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of indent management workflow
            </p>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Indents"
            value={stats.totalIndents}
            icon={FileText}
            color="text-blue-600"
            bgColor="bg-blue-50"
            subtitle="All time"
          />
          <StatCard
            title="Pending Processing"
            value={stats.pendingProcessing}
            icon={Clock}
            color="text-orange-600"
            bgColor="bg-orange-50"
            subtitle="Awaiting action"
          />
          <StatCard
            title="Gate Pass Completed"
            value={stats.gatePassCompleted}
            icon={ClipboardCheck}
            color="text-green-600"
            bgColor="bg-green-50"
            subtitle="Fully processed"
          />
          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={TrendingUp}
            color="text-purple-600"
            bgColor="bg-purple-50"
            subtitle="Overall efficiency"
          />
        </div>

        {/* Workflow Stages */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-800" />
            Workflow Pipeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <WorkflowStageCard
              title="Indent Processing"
              pending={stats.pendingProcessing}
              completed={stats.processedIndents}
              icon={Truck}
              color="text-purple-600"
              bgColor="bg-purple-50"
              route="/indent-processing"
            />
            <WorkflowStageCard
              title="Loading Complete"
              pending={stats.pendingLoading}
              completed={stats.loadingCompleted}
              icon={PackageCheck}
              color="text-blue-600"
              bgColor="bg-blue-50"
              route="/loading-complete"
            />
            <WorkflowStageCard
              title="Gate Pass"
              pending={stats.pendingGatePass}
              completed={stats.gatePassCompleted}
              icon={ClipboardCheck}
              color="text-green-600"
              bgColor="bg-green-50"
              route="/gate-pass"
            />
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-800" />
                Recent Activities
              </h3>
              <p className="text-sm text-gray-600 mt-1">Latest updates across all stages</p>
            </div>
            
            <div className="p-5">
              {recentActivities.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {recentActivities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className={`p-2 rounded-lg ${activity.bgColor} flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No recent activities</p>
                  <p className="text-xs mt-1">Activities will appear here as you process indents</p>
                </div>
              )}
            </div>
          </div>

          {/* Pipeline Overview */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-red-800" />
                Pipeline Overview
              </h3>
              <p className="text-sm text-gray-600 mt-1">Current status of workflow stages</p>
            </div>
            
            <div className="p-5 space-y-6">
              {/* Flow Diagram */}
              <div className="space-y-4">
                {/* Stage 1: Indent Management */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-900">Indent Created</span>
                      <span className="text-sm font-bold text-gray-900">{stats.totalIndents}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gray-600" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Stage 2: Processing */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-900">Processing</span>
                      <span className="text-sm font-bold text-purple-600">{stats.processedIndents}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-purple-600" 
                        style={{ width: `${stats.totalIndents > 0 ? (stats.processedIndents / stats.totalIndents) * 100 : 0}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Stage 3: Loading */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <PackageCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-900">Loading Complete</span>
                      <span className="text-sm font-bold text-blue-600">{stats.loadingCompleted}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-600" 
                        style={{ width: `${stats.totalIndents > 0 ? (stats.loadingCompleted / stats.totalIndents) * 100 : 0}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Stage 4: Gate Pass */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-900">Gate Pass Complete</span>
                      <span className="text-sm font-bold text-green-600">{stats.gatePassCompleted}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-600" 
                        style={{ width: `${stats.totalIndents > 0 ? (stats.gatePassCompleted / stats.totalIndents) * 100 : 0}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Overall Pipeline Health</span>
                  <span className={`font-bold ${completionRate > 75 ? 'text-green-600' : completionRate > 50 ? 'text-yellow-600' : 'text-orange-600'}`}>
                    {completionRate > 75 ? 'Excellent' : completionRate > 50 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Section */}
        {(stats.pendingProcessing > 5 || stats.pendingLoading > 5 || stats.pendingGatePass > 5) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-orange-900 mb-1">Action Required</h4>
                <p className="text-sm text-orange-800">
                  You have pending items that need attention:
                  {stats.pendingProcessing > 5 && ` ${stats.pendingProcessing} indents awaiting processing,`}
                  {stats.pendingLoading > 5 && ` ${stats.pendingLoading} items pending loading completion,`}
                  {stats.pendingGatePass > 5 && ` ${stats.pendingGatePass} items awaiting gate pass.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;