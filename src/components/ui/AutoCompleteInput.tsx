'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface AutoCompleteOption {
  value: string | number;
  label: string;
}

interface AutoCompleteInputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onNewItem?: (value: string) => void;
  options: AutoCompleteOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  allowNew?: boolean;
  loading?: boolean;
}

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  label,
  value,
  onChange,
  onNewItem,
  options,
  placeholder,
  error,
  helperText,
  allowNew = true,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<AutoCompleteOption[]>([]);
  const [showNewOption, setShowNewOption] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Encontrar la opción seleccionada
  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else {
      setInputValue('');
    }
  }, [selectedOption]);

  useEffect(() => {
    if (inputValue) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowNewOption(
        allowNew && 
        inputValue.length > 0 && 
        !filtered.some(option => option.label.toLowerCase() === inputValue.toLowerCase())
      );
    } else {
      setFilteredOptions(options);
      setShowNewOption(false);
    }
  }, [inputValue, options, allowNew]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: AutoCompleteOption) => {
    setInputValue(option.label);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleNewItemCreate = () => {
    if (onNewItem && inputValue.trim()) {
      onNewItem(inputValue.trim());
      setInputValue('');
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showNewOption) {
        handleNewItemCreate();
      } else if (filteredOptions.length > 0) {
        handleOptionSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Solo cerrar si el foco no va a la lista
    if (!listRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500'
          )}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {isOpen && (filteredOptions.length > 0 || showNewOption) && (
          <div
            ref={listRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleOptionSelect(option)}
              >
                {option.label}
              </button>
            ))}
            
            {showNewOption && (
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t border-gray-200"
                onClick={handleNewItemCreate}
              >
                + Crear &quot;{inputValue}&quot;
              </button>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
