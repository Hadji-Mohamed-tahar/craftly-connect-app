import React from 'react';
import { User, Wrench } from 'lucide-react';

interface UserTypeSelectorProps {
  onSelect: (type: 'client' | 'crafter') => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ onSelect }) => {
  const handleSelection = (type: 'client' | 'crafter') => {
    onSelect(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">كرافتلي كونيكت</h1>
          <p className="text-gray-600">منصة ربط الحرفيين مع العملاء</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSelection('client')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-3"
          >
            <User className="w-6 h-6" />
            <div>
              <div className="text-lg">أنا عميل</div>
              <div className="text-sm opacity-90">أبحث عن خدمات حرفية</div>
            </div>
          </button>

          <button
            onClick={() => handleSelection('crafter')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-3"
          >
            <Wrench className="w-6 h-6" />
            <div>
              <div className="text-lg">أنا حرفي</div>
              <div className="text-sm opacity-90">أقدم خدمات حرفية</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;