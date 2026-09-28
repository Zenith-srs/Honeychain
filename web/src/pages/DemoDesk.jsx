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
      title: "KVIC Administrator",
      subtitle: "Complete System Control",
      username: "kvic_admin",
      password: "KvicAdmin@2024",
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: "from-blue-500 via-blue-600 to-indigo-700",
      bgPattern: "bg-blue-50",
      accentColor: "border-blue-500",
      emoji: "🛡️",
      features: ["User Management", "System Analytics", "Full Access Control", "Configuration"],
      dashboard: "/app/dashboard"
    },
    {
      id: "kvic_officer",
      title: "Field Officer",
      subtitle: "Operations & Monitoring",
      username: "kvic_field_officer",
      password: "KvicOfficer@2024",
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      gradient: "from-emerald-500 via-green-600 to-teal-700",
      bgPattern: "bg-emerald-50",
      accentColor: "border-emerald-500",
      emoji: "📋",
      features: ["Cluster Management", "Batch Processing", "Field Monitoring", "Alert System"],
      dashboard: "/app/cluster"
    },
    {
      id: "lab_inspector",
      title: "Lab Inspector",
      subtitle: "Quality Assurance",
      username: "lab_inspector",
      password: "LabInspector@2024",
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      gradient: "from-purple-500 via-violet-600 to-purple-700",
      bgPattern: "bg-purple-50",
      accentColor: "border-purple-500",
      emoji: "🔬",
      features: ["Sample Testing", "Quality Analysis", "Lab Reports", "Batch Approval"],
      dashboard: "/app/lab"
    }
  ];

  async function handleRoleAccess(role) {
    setLoadingRole(role.id);
    setError("");
    try {
      await login(role.username, role.password);
      setTimeout(() => {
        navigate(role.dashboard, { replace: true });
      }, 300);
    } catch (err) {
      setError(`Unable to access ${role.title}: ${err.message || "Connection failed"}`);
      setLoadingRole(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <span className="text-3xl">🍯</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  HoneyChain
                </h1>
                <p className="text-sm text-gray-600 font-medium">Demonstration Portal</p>
              </div>
            </div>
            <a
              href="/"
              className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-semibold text-sm transition-all hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-2xl mb-6 transform hover:rotate-12 transition-transform">
            <span className="text-5xl">🎯</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Select Your Role
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose your role below to experience the HoneyChain platform with <span className="font-semibold text-amber-600">instant access</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 animate-slideIn">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl p-4 shadow-lg flex items-start space-x-3">
              <div className="flex-shrink-0 text-red-500 mt-0.5">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {demoRoles.map((role) => {
            const isLoading = loadingRole === role.id;
            return (
              <div
                key={role.id}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-amber-300 transform hover:-translate-y-2"
              >
                {/* Decorative Top Bar */}
                <div className={`h-2 bg-gradient-to-r ${role.gradient}`}></div>
                
                {/* Icon Header with Gradient Background */}
                <div className={`relative ${role.bgPattern} p-8 border-b-4 ${role.accentColor}`}>
                  <div className="absolute top-4 right-4 text-6xl opacity-10">
                    {role.emoji}
                  </div>
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${role.gradient} rounded-2xl shadow-lg text-white mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {role.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {role.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-600">
                    {role.subtitle}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Features */}
                  <div className="mb-5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Credentials */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-5 border border-gray-200 shadow-inner">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Demo Credentials</span>
                    </div>
                    <div className="font-mono text-xs space-y-2">
                      <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg">
                        <span className="text-gray-500 font-semibold">Username</span>
                        <span className="text-gray-800 font-bold">{role.username}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg">
                        <span className="text-gray-500 font-semibold">Password</span>
                        <span className="text-gray-500">••••••••••••</span>
                      </div>
                    </div>
                  </div>

                  {/* Access Button */}
                  <button
                    onClick={() => handleRoleAccess(role)}
                    disabled={loadingRole !== null}
                    className={`w-full bg-gradient-to-r ${role.gradient} text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl flex items-center justify-center space-x-3 group`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg">Accessing...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">Access Dashboard</span>
                        <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 border-2 border-amber-300 rounded-2xl p-8 max-w-5xl mx-auto shadow-xl">
          <div className="flex items-start space-x-5">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">ℹ️</span>
                Demo Environment Information
              </h4>
              <p className="text-base text-gray-700 leading-relaxed mb-3">
                This is a <span className="font-bold text-amber-700">demonstration environment</span> with sample data. Each role provides access to different features and perspectives within the HoneyChain platform.
              </p>
              <div className="flex items-center text-sm text-gray-600 bg-white/50 rounded-lg px-4 py-2 inline-flex">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">All accounts are ready for instant access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
