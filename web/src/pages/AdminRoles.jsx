import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminRoles() {
  const { t } = useTranslation();

  const roles = [
    {
      id: "kvic_admin",
      title: "KVIC Admin",
      username: "kvic_admin",
      password: "KvicAdmin@2024",
      emoji: "🛡️",
      description: "Full system access and management",
      color: "bg-blue-500"
    },
    {
      id: "kvic_officer",
      title: "KVIC Officer",
      username: "kvic_officer",
      password: "KvicOfficer@2024",
      emoji: "📋",
      description: "Manage batches and field operations",
      color: "bg-green-500"
    },
    {
      id: "lab_inspector",
      title: "Lab Inspector",
      username: "lab_inspector",
      password: "LabInspector@2024",
      emoji: "🔬",
      description: "Quality testing and lab analysis",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {t("brand.name")} Demo Roles
          </h1>
          <p className="text-gray-600">Select a role to login with pre-filled credentials</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            return (
              <Link
                key={role.id}
                to={`/login?role=${role.id}&username=${role.username}&password=${encodeURIComponent(role.password)}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center text-center group hover:scale-105"
              >
                <div className={`${role.color} w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-3xl`}>
                  {role.emoji}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{role.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                <div className="mt-auto w-full">
                  <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-left">
                    <div className="text-gray-500 mb-1">Username:</div>
                    <div className="text-gray-800 font-semibold mb-2">{role.username}</div>
                    <div className="text-gray-500 mb-1">Password:</div>
                    <div className="text-gray-800 font-semibold">••••••••••••</div>
                  </div>
                </div>
                <button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full">
                  Login as {role.title}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
