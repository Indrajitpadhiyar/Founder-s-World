import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { formatMoney } from "../utils/format";
import GlassCard from "../components/GlassCard";
import { Users, Award, UserMinus, Zap, Coins } from "lucide-react";

const DEPARTMENTS = [
  "Management",
  "Production",
  "Sales",
  "Marketing",
  "R&D",
  "Finance",
  "HR",
];
const CANDIDATE_NAMES = [
  "Alex Rivera",
  "Jordan Vance",
  "Taylor Swift",
  "Morgan Drake",
  "Casey Logan",
  "Jamie Parker",
  "Riley Hayes",
  "Robin Croft",
];
const CANDIDATE_ROLES = [
  "Junior Associate",
  "Senior Manager",
  "Developer",
  "Lead Engineer",
  "Sales Agent",
  "HR Recruiter",
];

export const Employees = () => {
  const {
    player,
    employees,
    businesses,
    hireEmployee,
    fireEmployee,
    assignEmployee,
    trainEmployee,
    promoteEmployee,
    payBonus,
  } = useGameStore();

  // Component state for candidate pool
  const [candidates, setCandidates] = useState(() => {
    return Array.from({ length: 3 }).map(() => ({
      id: Math.random().toString(),
      name:
        CANDIDATE_NAMES[Math.floor(Math.random() * CANDIDATE_NAMES.length)] ||
        "Staff Applicant",
      role:
        CANDIDATE_ROLES[Math.floor(Math.random() * CANDIDATE_ROLES.length)] ||
        "Associate",
      department:
        DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)] ||
        "Production",
      salary: Math.floor(Math.random() * 2500 + 2000), // monthly salary
      morale: 90,
      skill: Math.floor(Math.random() * 40 + 35),
      experience: Math.floor(Math.random() * 30 + 10),
      happiness: 90,
    }));
  });

  const handleHire = (candidate) => {
    hireEmployee(
      candidate.name,
      candidate.role,
      candidate.department,
      candidate.salary,
    );
    // Replace with new applicant
    setCandidates((curr) =>
      curr.map((c) =>
        c.id === candidate.id
          ? {
              id: Math.random().toString(),
              name:
                CANDIDATE_NAMES[
                  Math.floor(Math.random() * CANDIDATE_NAMES.length)
                ] || "Staff Applicant",
              role:
                CANDIDATE_ROLES[
                  Math.floor(Math.random() * CANDIDATE_ROLES.length)
                ] || "Associate",
              department:
                DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)] ||
                "Production",
              salary: Math.floor(Math.random() * 3000 + 2000),
              morale: 90,
              skill: Math.floor(Math.random() * 45 + 30),
              experience: Math.floor(Math.random() * 30 + 15),
              happiness: 90,
            }
          : c,
      ),
    );
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Human Resources
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Harness corporate talent, train associates, and balance operational
          morale.
        </p>
      </div>

      {/* Recruitment Candidate Board */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Active Applicants
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {candidates.map((cand) => (
            <GlassCard
              key={cand.id}
              className="border-indigo-500/10"
              glowColor="none"
              hoverable
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-extrabold text-white text-base leading-tight">
                    {cand.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {cand.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
                  <div>
                    <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">
                      Dept
                    </span>
                    <span className="text-indigo-400 font-bold">
                      {cand.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">
                      Skill Rating
                    </span>
                    <span className="text-white font-bold">
                      {cand.skill}/100
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                      Salary
                    </span>
                    <span className="text-white font-extrabold text-sm">
                      {formatMoney(cand.salary)}/mo
                    </span>
                  </div>
                  <button
                    onClick={() => handleHire(cand)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition shadow-md shadow-indigo-600/10"
                  >
                    Hire Candidate
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Workforce Roster */}
      <div className="space-y-4 pt-6">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Active Workforce Roster
        </h3>
        {employees.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-slate-800/40 border-dashed">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-slate-300 font-bold text-base">
              No Hired Staff
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Contract talent from the applicants pool above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <GlassCard
                key={employee.id}
                hoverable={false}
                className="space-y-6 relative overflow-hidden"
              >
                {/* Fire Button */}
                <button
                  onClick={() => {
                    if (confirm(`Fire employee ${employee.name}?`)) {
                      fireEmployee(employee.id);
                    }
                  }}
                  className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/40 transition cursor-pointer"
                  title="Fire Staff"
                >
                  <UserMinus className="w-4 h-4" />
                </button>

                {/* Profile header */}
                <div>
                  <h4 className="font-extrabold text-white text-base leading-tight pr-6">
                    {employee.name}
                  </h4>
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-0.5 block">
                    {employee.department}
                  </span>
                </div>

                {/* Parameters Metrics */}
                <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-slate-400">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                      Skill
                    </span>
                    <span className="text-white font-extrabold">
                      {employee.skill}/100
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                      Salary
                    </span>
                    <span className="text-white font-bold">
                      {formatMoney(employee.salary)}/mo
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                      Morale
                    </span>
                    <span
                      className={`font-extrabold ${employee.morale > 70 ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {employee.morale}%
                    </span>
                  </div>
                </div>

                {/* Assignment Branch Link */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                    Branch Assignment
                  </label>
                  <select
                    value={employee.businessId || ""}
                    onChange={(e) =>
                      assignEmployee(employee.id, e.target.value || null)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned (Staff Pool)</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/40">
                  <button
                    onClick={() => trainEmployee(employee.id)}
                    className="flex flex-col items-center justify-center py-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] font-bold text-slate-300 hover:text-indigo-400 border border-slate-850 transition cursor-pointer"
                    title="Spend $2K to boost skill level"
                  >
                    <Zap className="w-4 h-4 mb-1 text-indigo-400" />
                    Train
                  </button>
                  <button
                    onClick={() => promoteEmployee(employee.id)}
                    className="flex flex-col items-center justify-center py-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] font-bold text-slate-300 hover:text-emerald-400 border border-slate-850 transition cursor-pointer"
                    title="Promote (salary increase +25%)"
                  >
                    <Award className="w-4 h-4 mb-1 text-emerald-400" />
                    Promote
                  </button>
                  <button
                    onClick={() => payBonus(employee.id, 500)}
                    className="flex flex-col items-center justify-center py-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-[10px] font-bold text-slate-300 hover:text-amber-400 border border-slate-850 transition cursor-pointer"
                    title="Award $500 cash bonus"
                  >
                    <Coins className="w-4 h-4 mb-1 text-amber-400" />
                    Bonus
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Employees;
