import React, { useState } from "react";
import { Users, Shield, Key, Plus, CheckCircle, Clock, MoreVertical, Search, Filter } from "lucide-react";

const INITIAL_USERS = [
  {
    id: "USR-001",
    name: "Inspector Vijay",
    email: "vijay.kumar@cybercrime.gov.in",
    role: "Lead Investigator",
    badge: "IV-8821",
    department: "Cyber Crime Cell - Financial Fraud Unit",
    status: "Active",
    lastActive: "Just now",
    permissions: ["Full Case Management", "Evidence Sealing", "Neo4j Graph Write", "FIR Generation"],
  },
  {
    id: "USR-002",
    name: "Ananya Sharma",
    email: "a.sharma@cybercrime.gov.in",
    role: "Cyber Threat Analyst",
    badge: "AS-4109",
    department: "OSINT & Digital Forensics",
    status: "Active",
    lastActive: "15 mins ago",
    permissions: ["Graph Explorer", "Anomaly Detection", "Entity Resolution", "Export Reports"],
  },
  {
    id: "USR-003",
    name: "Rohan Varma",
    email: "rohan.v@fin-intel.gov.in",
    role: "Financial Intelligence Officer",
    badge: "RV-1022",
    department: "FIU-IND Liaison Unit",
    status: "Active",
    lastActive: "1 hour ago",
    permissions: ["Bank Feed Ingestion", "CTR/STR Analysis", "Transaction Tracking"],
  },
  {
    id: "USR-004",
    name: "Pooja Hegde",
    email: "pooja.h@cybercrime.gov.in",
    role: "Field Investigation Officer",
    badge: "PH-7734",
    department: "Field Ops & Asset Seizure",
    status: "Active",
    lastActive: "3 hours ago",
    permissions: ["Field Geolocation", "Device Extraction Intake", "Chain of Custody Read"],
  },
  {
    id: "USR-005",
    name: "DevOps Security Admin",
    email: "secadmin@cybercrime.gov.in",
    role: "System Administrator",
    badge: "SA-0001",
    department: "Systems & Security Operations",
    status: "Active",
    lastActive: "2 days ago",
    permissions: ["Role Management", "Audit Log Export", "API Keys", "Pipeline Configuration"],
  },
];

const ROLES = [
  {
    role: "Lead Investigator",
    count: 2,
    color: "purple",
    description: "Full case jurisdiction, evidence validation, and official FIR filing rights.",
  },
  {
    role: "Cyber Threat Analyst",
    count: 5,
    color: "blue",
    description: "Deep link analysis, entity matching, anomaly detection, and pattern intelligence.",
  },
  {
    role: "Financial Intelligence Officer",
    count: 3,
    color: "emerald",
    description: "FIU-IND coordination, bank statement ingestion, and mule ring tracking.",
  },
  {
    role: "Field Investigation Officer",
    count: 8,
    color: "amber",
    description: "On-ground surveillance, raid management, and device custody tracking.",
  },
];

export default function UsersRoles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const filteredUsers = INITIAL_USERS.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Users & Roles
          </h1>
          <p className="text-sm text-slate-500">
            Manage investigator access controls, clearance roles, and system permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 transition">
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map((r) => (
          <div key={r.role} className="card p-4 space-y-2 border border-slate-200/80 hover:shadow-sm transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {r.count} users
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900">{r.role}</div>
            <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, badge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700"
          >
            <option value="All">All Roles</option>
            {ROLES.map((r) => (
              <option key={r.role} value={r.role}>
                {r.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Investigator</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {u.email} · Badge #{u.badge}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{u.department}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {u.permissions.slice(0, 2).map((p) => (
                        <span key={p} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                          {p}
                        </span>
                      ))}
                      {u.permissions.length > 2 && (
                        <span className="text-[10px] text-slate-400">+{u.permissions.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
