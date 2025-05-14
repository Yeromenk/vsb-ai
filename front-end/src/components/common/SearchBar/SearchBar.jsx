import { Search, X } from 'lucide-react';

const SearchBar = ({ searchQuery, handleSearchInputChange, clearSearch }) => {
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search chats..."
          className="search-input"
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
      </div>
      {searchQuery && (
        <button className="clear-search-button" onClick={clearSearch}>
          <X size={24} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
