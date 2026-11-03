import React, { useState } from 'react';
import { X, User, MapPin, Briefcase, Camera, Check, AlertCircle } from 'lucide-react';
import { Borrower, Address } from '../types';
import { rupeesToPaise, paiseToRupees } from '../utils/finance';

interface AddEditBorrowerModalProps {
  borrower?: Borrower | null;
  onClose: () => void;
  onSave: (borrowerData: any) => void;
  nextId?: string;
}

export const AddEditBorrowerModal: React.FC<AddEditBorrowerModalProps> = ({
  borrower,
  onClose,
  onSave,
  nextId = 'BR-1008',
}) => {
  const isEditing = !!borrower;

  const [fullName, setFullName] = useState(borrower?.fullName || '');
  const [mobile, setMobile] = useState(borrower?.mobile || '');
  const [altMobile, setAltMobile] = useState(borrower?.altMobile || '');
  const [email, setEmail] = useState(borrower?.email || '');
  const [dob, setDob] = useState(borrower?.dob || '');

  // Address
  const [doorNo, setDoorNo] = useState(borrower?.address.doorNo || '');
  const [street, setStreet] = useState(borrower?.address.street || '');
  const [area, setArea] = useState(borrower?.address.area || '');
  const [city, setCity] = useState(borrower?.address.city || 'Bengaluru');
  const [pinCode, setPinCode] = useState(borrower?.address.pinCode || '');

  // Additional
  const [occupation, setOccupation] = useState(borrower?.occupation || '');
  const [monthlyIncomeRupees, setMonthlyIncomeRupees] = useState(
    borrower?.monthlyIncomePaise ? (borrower.monthlyIncomePaise / 100).toString() : ''
  );
  const [refName, setRefName] = useState(borrower?.refName || '');
  const [refMobile, setRefMobile] = useState(borrower?.refMobile || '');
  const [notes, setNotes] = useState(borrower?.notes || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(borrower?.status || 'active');

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Full name is required.');
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!area.trim() || !city.trim()) {
      setFormError('Area and City are required for field collection routing.');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      mobile: mobile.trim().startsWith('+91') ? mobile.trim() : `+91 ${mobile.trim()}`,
      altMobile: altMobile.trim() ? (altMobile.trim().startsWith('+91') ? altMobile.trim() : `+91 ${altMobile.trim()}`) : undefined,
      email: email.trim() || undefined,
      dob: dob || undefined,
      address: {
        doorNo: doorNo.trim() || 'N/A',
        street: street.trim() || 'Main Road',
        area: area.trim(),
        city: city.trim(),
        pinCode: pinCode.trim() || '560001',
      },
      occupation: occupation.trim() || 'Self-Employed / Vendor',
      monthlyIncomePaise: monthlyIncomeRupees ? rupeesToPaise(monthlyIncomeRupees) : undefined,
      refName: refName.trim() || undefined,
      refMobile: refMobile.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? `Edit Borrower: ${borrower?.fullName}` : 'New Borrower Registration'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ID: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{isEditing ? borrower?.borrowerId : nextId}</span> (Auto-assigned)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Personal Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Personal Information</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="borrower-name">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="borrower-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Verma"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="borrower-mobile">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="borrower-mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="98234 56789"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="borrower-alt-mobile">
                    Alternate Mobile
                  </label>
                  <input
                    id="borrower-alt-mobile"
                    type="tel"
                    value={altMobile}
                    onChange={(e) => setAltMobile(e.target.value)}
                    placeholder="Optional secondary phone"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="borrower-email">
                    Email Address
                  </label>
                  <input
                    id="borrower-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@domain.com"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="borrower-dob">
                    Date of Birth
                  </label>
                  <input
                    id="borrower-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Address Information */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Address Information</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Door / House
                  </label>
                  <input
                    type="text"
                    value={doorNo}
                    onChange={(e) => setDoorNo(e.target.value)}
                    placeholder="e.g. 12-A"
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Street / Cross
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Gandhi Bazaar 2nd Cross"
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Area / Locality <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Basavanagudi"
                    required
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    required
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="560004"
                    maxLength={6}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Occupation & Reference */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Occupation & References</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Occupation / Business
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Kirana Shop Owner"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncomeRupees}
                    onChange={(e) => setMonthlyIncomeRupees(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reference Name & Relation
                  </label>
                  <input
                    type="text"
                    value={refName}
                    onChange={(e) => setRefName(e.target.value)}
                    placeholder="Suresh Verma (Brother)"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reference Contact
                  </label>
                  <input
                    type="tel"
                    value={refMobile}
                    onChange={(e) => setRefMobile(e.target.value)}
                    placeholder="98234 11223"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Collection Notes / Landmarks
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Morning stall #2 at flower market, prefers UPI after 5pm"
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {isEditing && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Borrower Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="active">Active (Eligible for loan & collection)</option>
                    <option value="inactive">Inactive / Suspended</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Actions inside sheet */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Update Borrower' : 'Save Borrower'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
