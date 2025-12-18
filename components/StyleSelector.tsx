import React from 'react';
import { STYLES } from '../constants';
import { StyleOption } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: StyleOption;
  onSelect: (style: StyleOption) => void;
  disabled: boolean;
  t: (key: string) => any;
  stylesTranslation: any;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, disabled, t, stylesTranslation }) => {
  const selectedStyleName = stylesTranslation[selectedStyle.id]?.name || selectedStyle.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">{t('step1_title')}</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {t('step1_selected')}：{selectedStyleName}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {STYLES.map((style) => {
          const isSelected = selectedStyle.id === style.id;
          const styleInfo = stylesTranslation[style.id] || { name: `Style ${style.id}`, features: '' };

          return (
            <button
              key={style.id}
              onClick={() => onSelect(style)}
              disabled={disabled}
              className={`
                relative group flex flex-col items-start p-3 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`w-full h-20 mb-3 rounded-lg ${style.previewColor} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="w-8 h-8 bg-white/30 rounded-full blur-sm transform translate-x-2 translate-y-2"></div>
                <div className="absolute bottom-2 right-2 text-white/90 text-xs font-bold font-mono">
                   #{style.id.toString().padStart(2, '0')}
                </div>
              </div>

              <div className="w-full">
                <div className="flex justify-between items-start w-full">
                  <span className={`font-bold text-sm ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {styleInfo.name}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {styleInfo.features}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StyleSelector;
