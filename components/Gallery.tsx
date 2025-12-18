import React from 'react';
import { GALLERY_ITEMS } from '../constants';
import { GalleryItem } from '../types';
import { Palette, PlayCircle } from 'lucide-react';

interface GalleryProps {
  onSelectStyle: (styleId: number) => void;
  t: (key: string) => any;
  stylesTranslation: any;
}

const Gallery: React.FC<GalleryProps> = ({ onSelectStyle, t, stylesTranslation }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-bold text-gray-900">{t('gallery_title')}</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">{t('gallery_subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {GALLERY_ITEMS.map((item: GalleryItem) => {
          const styleName = stylesTranslation[item.styleId]?.name || `Style #${item.styleId}`;
          
          return (
            <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              {/* Image Container */}
              <div className="aspect-square w-full overflow-hidden bg-gray-100 transparent-grid relative">
                <img 
                  src={item.imageUrl} 
                  alt={`Sticker by ${item.author}`}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button 
                    onClick={() => onSelectStyle(item.styleId)}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:bg-indigo-50"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {t('gallery_btn_try')}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 mb-1">
                  <Palette className="w-3.5 h-3.5" />
                  <span>{styleName}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>@{item.author}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;
