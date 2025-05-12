"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DESTINATION_CATEGORIES, TRANSPORTATION_TYPES } from "@/types/map";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface MapFilterProps {
  onFilter?: (filters: {
    search?: string;
    category?: string;
    transportType?: string;
  }) => void;
}

export function MapFilter({ onFilter }: MapFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [transportType, setTransportType] = useState<string>("");

  const handleSearch = () => {
    onFilter?.({
      search,
      category: category || undefined,
      transportType: transportType || undefined,
    });
  };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setTransportType("");
    onFilter?.({});
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>

        <div className="mt-2 relative">
          <Input
            placeholder="Search destinations..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            className="pl-8 pr-3 py-1.5 text-sm"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">All Categories</SelectItem>
                  {DESTINATION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Transportation
            </label>
            <Select value={transportType} onValueChange={setTransportType}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">All Types</SelectItem>
                  {TRANSPORTATION_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-1.5">
                        <span>{type.icon}</span>
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs h-8"
            >
              Reset
            </Button>
            <Button size="sm" onClick={handleSearch} className="text-xs h-8">
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
