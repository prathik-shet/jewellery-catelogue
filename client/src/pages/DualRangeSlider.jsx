import React, { useState, useEffect, useRef, useCallback } from 'react';

const DualRangeSlider = ({ min, max, value, onChange }) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const range = useRef(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Sync internal state with props (Fixes "Clear Filter" bug)
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxVal) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [minVal, maxVal, getPercent]);

  return (
    <div className="container relative w-full h-12 flex items-center justify-center">
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - 1);
          setMinVal(value);
          onChange([value, maxVal]);
        }}
        className="thumb thumb--zindex-3"
        style={{ zIndex: minVal > max - 100 && '5' }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          setMaxVal(value);
          onChange([minVal, value]);
        }}
        className="thumb thumb--zindex-4"
      />

      <div className="slider relative w-full">
        <div className="slider__track absolute rounded h-1 bg-gray-300 w-full z-[1]" />
        <div 
            ref={range} 
            className="slider__range absolute rounded h-1 z-[2]" 
            style={{ backgroundColor: '#7f1a2b' }} // Burgundy
        />
        <div className="slider__left-value absolute text-xs font-bold mt-4 left-0 text-[#2e2e2e]">
            {minVal}g
        </div>
        <div className="slider__right-value absolute text-xs font-bold mt-4 right-0 text-[#2e2e2e]">
            {maxVal}g
        </div>
      </div>

      <style>{`
        .container {
            height: 30px;
        }
        
        .thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%; /* Important for overlay */
          outline: none;
        }

        .thumb--zindex-3 {
          z-index: 3;
        }

        .thumb--zindex-4 {
          z-index: 4;
        }

        /* Webkit (Chrome, Safari, Edge) */
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          background-color: #7f1a2b;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 1px 1px #ced4da;
          cursor: pointer;
          height: 18px;
          width: 18px;
          margin-top: 4px;
          pointer-events: all;
          position: relative;
        }

        /* Firefox */
        .thumb::-moz-range-thumb {
          background-color: #7f1a2b;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 1px 1px #ced4da;
          cursor: pointer;
          height: 18px;
          width: 18px;
          margin-top: 4px;
          pointer-events: all;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default DualRangeSlider;