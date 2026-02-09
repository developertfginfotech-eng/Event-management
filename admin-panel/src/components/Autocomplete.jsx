import { useState, useEffect, useRef } from 'react'
import './Autocomplete.css'

function Autocomplete({
  value,
  onChange,
  options,
  placeholder,
  name
}) {
  const [filteredOptions, setFilteredOptions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Filter options based on input value
    if (value && value.length > 0) {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredOptions(filtered.slice(0, 10)) // Limit to 10 suggestions
      setShowDropdown(filtered.length > 0)
    } else {
      setFilteredOptions([])
      setShowDropdown(false)
    }
    setHighlightedIndex(-1)
  }, [value, options])

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    onChange(e.target.value)
  }

  const handleOptionClick = (option) => {
    onChange(option)
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
      default:
        break
    }
  }

  const handleFocus = () => {
    if (value && filteredOptions.length > 0) {
      setShowDropdown(true)
    }
  }

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showDropdown && filteredOptions.length > 0 && (
        <div className="autocomplete-dropdown">
          {filteredOptions.map((option, index) => (
            <div
              key={option}
              className={`autocomplete-option ${index === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Autocomplete
