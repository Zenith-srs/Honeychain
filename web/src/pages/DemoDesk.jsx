import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth";
import { useState } from "react";

export default function DemoDesk() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState("");

  const demoRoles = [
    {
      id: "kvic_admin",
      title: "KVIC Admin",
      subtitle: "Administrator Dashboard",
      username: "kvic_admin",
      password: "KvicAdmin@2024",
      emoji: "🛡️",
      description: "Complete system administration and management",
      features: ["User Management", "System Analytics", "All Features Access", "Configuration"],
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      dashboard: "/app/dashboard"
    },
    {
      id: "kvic_officer",
      title: "KVIC Officer",
      subtitle: "Field Operations",
      username: "kvic_field_officer",
      password: "KvicOfficer@2024",
      emoji: "📋",
      description: "Field operations and batch management",
      features: ["Cluster Management", "Batch Processing", "Field Monitoring", "Alerts"],
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      dashboard: "/app/cluster"
    },
    {
      id: "lab_inspector",
      title: "Lab Inspector",
      subtitle: "Quality Control",
      username: "lab_inspector",
      password: "LabInspector@2024",
      emoji: "🔬",
      description: "Quality testing and laboratory analysis",
      features: ["Sample Testing", "Quality Analysis", "Test Results", "Batch Approval"],
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      dashboard: "/app/lab"
    }
  ];

  async function handleRoleAccess(role) {
    setLoadingRole(role.id);
    setError("");
    try {
      await login(role.username, role.password);
      // Small delay for better UX
      setTimeout(() => {
        navigate(role.dashboard, { replace: true });
      }, 500);
    } catch (err) {
      const errorMsg = err.message || "Connection failed. Please check if the backend is running.";
      setError(`Unable to access ${role.title}: ${errorMsg}`);
      setLoadingRole(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="text-6xl">🍯</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            {t("brand.name")} Demo Center
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            Select Your Role to Begin
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Experience the full HoneyChain platform from different perspectives. Click any card below for instant access.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-md animate-fadeIn">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <p className="text-xs text-red-600 mt-1">Please ensure the backend server is running and try again.</p>
              </div>
              <button 
                onClick={() => setError("")}
                className="ml-3 text-red-500 hover:text-red-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Demo Desks Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {demoRoles.map((role) => {
            const isLoading = loadingRole === role.id;
            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${role.color} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 opacity-10 text-9xl -mr-4 -mt-4">
                    {role.emoji}
                  </div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">{role.emoji}</div>
                    <h2 className="text-2xl font-bold mb-1">{role.title}</h2>
                    <p className="text-sm opacity-90">{role.subtitle}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Features List */}
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Key Features</h3>
                    <ul className="space-y-1.5">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Credentials Display */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Demo Credentials</div>
                    <div className="font-mono text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Username:</span>
                        <span className="text-gray-700 font-medium">{role.username}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Password:</span>
                        <span className="text-gray-700">••••••••••</span>
                      </div>
                    </div>
                  </div>

                  {/* Access Button */}
                  <button
                    onClick={() => handleRoleAccess(role)}
                    disabled={loadingRole !== null}
                    className={`w-full bg-gradient-to-r ${role.color} ${role.hoverColor} text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Accessing...</span>
                      </>
                    ) : (
                      <>
                        <span>Access {role.title}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                About This Demo
              </h3>
              <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
                <p>
                  <strong className="text-gray-800">Purpose:</strong> Experience the HoneyChain platform from different user perspectives without manual login.
                </p>
                <p>
                  <strong className="text-gray-800">Security Note:</strong> These are demonstration accounts with pre-configured credentials. In production environments, all users authenticate with secure, individual credentials.
                </p>
                <p>
                  <strong className="text-gray-800">Duration:</strong> Demo accounts remain active throughout your evaluation period.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium text-base hover:underline transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
