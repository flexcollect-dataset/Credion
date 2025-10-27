import React, { useState } from 'react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (count: number, label: string) => void;
  type: 'property' | 'director-property';
}

const PropertyModal: React.FC<PropertyModalProps> = ({ isOpen, onClose, onComplete, type }) => {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState('0');

  const isDirectorProperty = type === 'director-property';

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      const option = parseInt(selectedOption);
      let count = 0;
      let label = '';

      if (isDirectorProperty) {
        switch (option) {
          case 0:
            count = 0;
            label = 'Summary Only';
            break;
          case 1:
            count = 1;
            label = '1 available';
            break;
          case 11:
            count = 11;
            label = '11 available';
            break;
          case 12:
            count = 12;
            label = '12 available';
            break;
        }
      } else {
        switch (option) {
          case 0:
            count = 0;
            label = 'Summary Only';
            break;
          case 2:
            count = 2;
            label = '2 available';
            break;
          case 3:
            count = 3;
            label = '2 available';
            break;
          case 4:
            count = 4;
            label = '4 available';
            break;
        }
      }

      onComplete(count, label);
      onClose();
      setStep(1);
      setSelectedOption('0');
    }
  };

  const handleCancel = () => {
    onClose();
    setStep(1);
    setSelectedOption('0');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
      <div className="modal-content">
        {/* Step 1: Summary Search */}
        {step === 1 && (
          <div>
            <div className="modal-header">
              <h3 className="modal-title">
                {isDirectorProperty ? 'Director Property Title' : 'ABN/ACN Property Title'}
              </h3>
              <p className="modal-subtitle">Summary Search</p>
            </div>
            <div className="flex flex-col items-center py-5">
              <button className="modal-button modal-button-continue w-full max-w-xs mb-5" onClick={handleContinue}>
                $20 - Continue and Process
              </button>
              <div className="bg-gray-50 border-l-4 border-red-600 p-4 text-sm text-gray-600 leading-relaxed rounded-lg mb-5">
                <strong>Note:</strong> Summary report lists associated property titles. Click continue to select detailed reports or Finalise.
              </div>
              <button className="modal-button modal-button-cancel mt-5" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Detailed Options */}
        {step === 2 && (
          <div>
            <div className="modal-header">
              <h3 className="modal-title">
                {isDirectorProperty ? 'Director Property Title' : 'ABN/ACN Property Title'}
              </h3>
              <p className="modal-subtitle">Select detailed property reports</p>
            </div>
            <div className="modal-options">
              {isDirectorProperty ? (
                <>
                  <div className="modal-option">
                    <input
                      type="radio"
                      id="currentOwnership"
                      name="property-type"
                      value="1"
                      checked={selectedOption === '1'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <label htmlFor="currentOwnership">
                      <span>Current (1 available)</span>
                      <span className="modal-option-count">$10</span>
                    </label>
                  </div>
                  <div className="modal-option">
                    <input
                      type="radio"
                      id="pastOwnership"
                      name="property-type"
                      value="11"
                      checked={selectedOption === '11'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <label htmlFor="pastOwnership">
                      <span>Past (11 available)</span>
                      <span className="modal-option-count">$110</span>
                    </label>
                  </div>
                  <div className="modal-option">
                    <input
                      type="radio"
                      id="selectAllOwnership"
                      name="property-type"
                      value="12"
                      checked={selectedOption === '12'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <label htmlFor="selectAllOwnership">
                      <span>Select All (12 available)</span>
                      <span className="modal-option-count">$120</span>
                    </label>
                  </div>
                  <div className="modal-option">
                    <input
                      type="radio"
                      id="summaryOnly"
                      name="property-type"
                      value="0"
                      checked={selectedOption === '0'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <label htmlFor="summaryOnly">
                      <span>Summary Report Only</span>
                      <span className="modal-option-count">$20</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="modal-option">
                    <input
                      type="radio"
                      id="currentOwnershipProp"
                      name="property-search-type"
                      value="2"
                      checked={selectedOption === '2'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <label htmlFor="currentOwnershipProp">
                      <span>Current (2 available)</span>
                      <span className="modal-option-count">$20</span>
                    </label>
                  </div>
                  <div className="modal-option">
                    <input
                      type="radio"
                      id="pastOwnershipProp"
                      name="property-search-type"
                      value="3"
                      checked={selectedOption === '3'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <label htmlFor="pastOwnershipProp">
                      <span>Past (2 available)</span>
                      <span className="modal-option-count">$20</span>
                    </label>
                  </div>
                  <div className="modal-option">
                    <input
                      type="radio"
                      id="selectAllOwnershipProp"
                      name="property-search-type"
                      value="4"
                      checked={selectedOption === '4'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <label htmlFor="selectAllOwnershipProp">
                      <span>Select All (4 available)</span>
                      <span className="modal-option-count">$40</span>
                    </label>
                  </div>
                  <div className="modal-option">
                    <input
                      type="radio"
                      id="summaryOnlyProp"
                      name="property-search-type"
                      value="0"
                      checked={selectedOption === '0'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    <label htmlFor="summaryOnlyProp">
                      <span>Summary Report Only</span>
                      <span className="modal-option-count">$20</span>
                    </label>
                  </div>
                </>
              )}
            </div>
            <div className="modal-actions">
              <button className="modal-button modal-button-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="modal-button modal-button-continue" onClick={handleContinue}>
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyModal;

