import React, { useState, useEffect } from "react";
import {
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Trash2,
  Edit,
  Copy,
  Share,
  ExternalLink,
  Info,
  HelpCircle,
  Bell,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

const AdvancedFilter = ({
  data = [],
  onFilteredData = () => {},
  columns = [],
  searchableColumns = [],
  filterableColumns = [],
  sortableColumns = [],
  onExport = null,
  onImport = null,
  title = "Advanced Filter",
  showStats = true,
  showExport = true,
  showImport = false,
  showSave = false,
  onSaveFilter = null,
  savedFilters = [],
  onLoadFilter = null,
  onDeleteFilter = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Apply filters and search
  const applyFilters = () => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        searchableColumns.some((col) => {
          const value = item[col.key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        filtered = filtered.filter((item) => {
          const itemValue = item[key];
          if (typeof itemValue === "string") {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        });
      }
    });

    // Apply date range
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(
          item.createdAt || item.date || item.updatedAt
        );
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;

        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (typeof aValue === "string") {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    onFilteredData(filtered);
  };

  // Update filter
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({});
    setSortBy("");
    setSortOrder("asc");
    setDateRange({ from: "", to: "" });
    onFilteredData(data);
  };

  // Save current filter
  const saveFilter = () => {
    if (!filterName.trim()) return;

    const filterConfig = {
      name: filterName,
      searchTerm,
      filters,
      sortBy,
      sortOrder,
      dateRange,
    };

    onSaveFilter?.(filterConfig);
    setFilterName("");
    setShowSavedFilters(false);
  };

  // Load saved filter
  const loadFilter = (filter) => {
    setSearchTerm(filter.searchTerm || "");
    setFilters(filter.filters || {});
    setSortBy(filter.sortBy || "");
    setSortOrder(filter.sortOrder || "asc");
    setDateRange(filter.dateRange || { from: "", to: "" });
    setSelectedFilter(filter);
  };

  // Get unique values for filter options
  const getUniqueValues = (key) => {
    const values = [...new Set(data.map((item) => item[key]).filter(Boolean))];
    return values.sort();
  };

  // Calculate stats
  const stats = {
    total: data.length,
    filtered: 0,
    searchMatches: 0,
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, sortBy, sortOrder, dateRange, data]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showStats && (
            <span className="text-sm text-gray-500">
              {data.length} total records
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showSave && (
            <button
              onClick={() => setShowSavedFilters(!showSavedFilters)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <Settings className="w-4 h-4" />
              Saved Filters
            </button>
          )}

          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search across all columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Column Filters */}
            {filterableColumns.map((column) => (
              <div key={column.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {column.label}
                </label>
                <select
                  value={filters[column.key] || "all"}
                  onChange={(e) => updateFilter(column.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="all">All {column.label}</option>
                  {getUniqueValues(column.key).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Sorting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">No Sorting</option>
                {sortableColumns.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Saved Filters */}
      {showSavedFilters && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900">Saved Filters</h4>

          {savedFilters.length > 0 ? (
            <div className="space-y-2">
              {savedFilters.map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <span className="text-sm text-gray-700">{filter.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadFilter(filter)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDeleteFilter?.(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No saved filters</p>
          )}

          {/* Save Current Filter */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <button
              onClick={saveFilter}
              disabled={!filterName.trim()}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          {showExport && onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}

          {showImport && onImport && (
            <button
              onClick={onImport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {data.length} total • {data.length} filtered
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilter;
