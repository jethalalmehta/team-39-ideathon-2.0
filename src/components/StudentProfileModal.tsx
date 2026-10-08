import React, { useState, useEffect, useRef } from 'react';
import { X, User, AlertCircle } from 'lucide-react';
import { StudentProfile } from '../types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onUpdateStudent: (updated: StudentProfile) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdateStudent,
}) => {
  const [formData, setFormData] = useState<StudentProfile>(student);
  const [skillInput, setSkillInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Sync formData when student changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(student);
      setValidationError(null);
      setSkillInput('');
    }
  }, [isOpen, student]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (!trimmed) return;

      if (formData.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        setValidationError(`Skill "${trimmed}" is already in your profile.`);
        return;
      }

      setValidationError(null);
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmed],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    if (formData.cgpa < 0 || formData.cgpa > 10 || isNaN(formData.cgpa)) {
      setValidationError('CGPA must be a valid number between 0.00 and 10.00.');
      return;
    }

    if (formData.activeBacklogs < 0 || isNaN(formData.activeBacklogs)) {
      setValidationError('Active backlogs cannot be negative.');
      return;
    }

    setValidationError(null);
    onUpdateStudent(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090D]/65 backdrop-blur-xs nexora-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#fcf8ff] rounded-2xl border border-[#c8c0f7] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col nexora-modal-dialog"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0f4] bg-[#f1ebff]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#170065]" />
            <h2 id="profile-title" className="text-base font-black text-[#09090D]">
              Student Academic Profile
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-1.5 text-[#47464b] hover:text-[#09090D] hover:bg-[#ebe5fa] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
            aria-label="Close profile dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-[#5f5888]">
            Updating your academic details recalculates your match percentages and cutoff eligibility tags across all opportunities.
          </p>

          {validationError && (
            <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#93000a] animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-name" className="block text-xs font-bold text-[#09090D] mb-1">
                Full Name
              </label>
              <input
                id="student-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setValidationError(null);
                  setFormData({ ...formData, name: e.target.value });
                }}
                className="w-full p-2.5 text-xs bg-white border border-[#c8c5cb] focus:border-[#09090D] focus:ring-1 focus:ring-[#09090D] rounded-lg outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="student-college" className="block text-xs font-bold text-[#09090D] mb-1">
                College / University
              </label>
              <input
                id="student-college"
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full p-2.5 text-xs bg-white border border-[#c8c5cb] focus:border-[#09090D] focus:ring-1 focus:ring-[#09090D] rounded-lg outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-branch" className="block text-xs font-bold text-[#09090D] mb-1">
                Branch / Discipline
              </label>
              <select
                id="student-branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full p-2.5 text-xs bg-white border border-[#c8c5cb] focus:border-[#09090D] rounded-lg outline-none font-medium cursor-pointer"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div>
              <label htmlFor="student-cgpa" className="block text-xs font-bold text-[#09090D] mb-1">
                Current CGPA (out of 10)
              </label>
              <input
                id="student-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={formData.cgpa}
                onChange={(e) => {
                  setValidationError(null);
                  setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 });
                }}
                className="w-full p-2.5 text-xs font-mono-code font-bold bg-white border border-[#c8c5cb] focus:border-[#09090D] focus:ring-1 focus:ring-[#09090D] rounded-lg outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="student-backlogs" className="block text-xs font-bold text-[#09090D] mb-1">
              Active Backlogs
            </label>
            <input
              id="student-backlogs"
              type="number"
              min="0"
              value={formData.activeBacklogs}
              onChange={(e) => {
                setValidationError(null);
                setFormData({ ...formData, activeBacklogs: Math.max(0, parseInt(e.target.value, 10) || 0) });
              }}
              className="w-full p-2.5 text-xs font-mono-code bg-white border border-[#c8c5cb] focus:border-[#09090D] rounded-lg outline-none transition-all"
            />
            <span className="text-[11px] text-[#78767b] mt-1 block">
              Most Tier-1 company cutoffs strictly require 0 active backlogs.
            </span>
          </div>

          <div>
            <label htmlFor="skills-input" className="block text-xs font-bold text-[#09090D] mb-1">
              Skills (Press Enter to add)
            </label>
            <input
              id="skills-input"
              type="text"
              value={skillInput}
              onChange={(e) => {
                setValidationError(null);
                setSkillInput(e.target.value);
              }}
              onKeyDown={handleAddSkill}
              placeholder="e.g. Python, Docker, Go, DSA..."
              className="w-full p-2.5 text-xs bg-white border border-[#c8c5cb] focus:border-[#09090D] rounded-lg outline-none mb-2 transition-all"
            />
            <div className="flex flex-wrap gap-1.5">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#e5deff] text-[#170065] rounded-md font-mono-code transition-all"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-600 text-xs font-bold px-0.5 rounded focus-visible:outline-none"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#e5e0f4] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#47464b] hover:text-[#09090D] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] rounded-lg shadow-xs nexora-btn-press transition-colors"
            >
              Save Profile & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
