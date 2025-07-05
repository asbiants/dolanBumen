"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, Eye, ImagePlus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import 'mapbox-gl/dist/mapbox-gl.css';
import { DestinationPhotosDialog } from "@/components/destination-photos-dialog";
import { DestinationPhotos } from "@/components/destination-photos";
import { TicketStatus } from "@prisma/client";
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Dialog as SuccessDialog, DialogContent as SuccessDialogContent, DialogHeader as SuccessDialogHeader, DialogTitle as SuccessDialogTitle } from "@/components/ui/dialog";

interface Ticket {
  id: string;
  destinationId: string;
  name: string;
  description: string | null;
  ticketType: string;
  price: number;
  quotaPerDay: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TouristDestination {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  categoryId: string | null;
  status: string;
  openingTime: string | null;
  closingTime: string | null;
  thumbnailUrl: string | null;
  category: {
    id: string;
    name: string;
    icon?: string | null;
  } | null;
  createdAt: string;
}

interface DestinationCategory {
  id: string;
  name: string;
  icon?: string | null;
}

interface FormData {
  name: string;
  description: string;
  address: string;
  categoryName: string;
  latitude: string;
  longitude: string;
  openingTime: string;
  closingTime: string;
  thumbnail: File | null;
}

const MapboxMap = dynamic(() => import('react-map-gl'), { ssr: false });
const MapboxMarker = dynamic(() => import('react-map-gl').then(mod => mod.Marker), { ssr: false });

export default function TouristDestinationsPage() {
  const [destinations, setDestinations] = useState<TouristDestination[]>([]);
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<TouristDestination | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    address: "",
    categoryName: "",
    latitude: "",
    longitude: "",
    openingTime: "",
    closingTime: "",
    thumbnail: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: 110.3695,
    latitude: -7.7956,
    zoom: 9
  });
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewDestination, setViewDestination] = useState<TouristDestination | null>(null);
  const [selectedDestinationForTickets, setSelectedDestinationForTickets] = useState<TouristDestination | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [newTicketFormData, setNewTicketFormData] = useState({
    name: "",
    description: "",
    ticketType: "WEEKDAY",
    price: "",
    quotaPerDay: "",
  });
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState<Ticket | null>(null);
  const [isEditTicketDialogOpen, setIsEditTicketDialogOpen] = useState(false);
  const [editTicketFormData, setEditTicketFormData] = useState({
    name: "",
    description: "",
    ticketType: "",
    price: "",
    quotaPerDay: "",
    status: "",
  });
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [destinationsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/tourist-destinations"),
        fetch("/api/admin/destination-categories")
      ]);

      if (!destinationsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [destinationsData, categoriesData] = await Promise.all([
        destinationsRes.json(),
        categoriesRes.json()
      ]);

      const arr = Array.isArray(destinationsData.data) ? destinationsData.data : destinationsData;
      const categoryMap = categoriesData.reduce((map: any, cat: any) => {
        map[cat.id] = cat;
        return map;
      }, {});

      const parsedDestinations = arr.map((d: any) => {
        const category = categoryMap[d.categoryId] || d.category;
        let lat = d.latitude;
        let lng = d.longitude;
        if (lat && typeof lat === 'object' && typeof lat.toNumber === 'function') lat = lat.toNumber();
        else if (typeof lat === 'string') lat = parseFloat(lat);
        if (lng && typeof lng === 'object' && typeof lng.toNumber === 'function') lng = lng.toNumber();
        else if (typeof lng === 'string') lng = parseFloat(lng);
      
        return {
          ...d,
          latitude: lat,
          longitude: lng,
          category: category
        };
      });

      setDestinations(parsedDestinations);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDestinations = categoryFilter && categoryFilter !== "all"
    ? destinations.filter(d => d.categoryId === categoryFilter)
    : destinations;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const valid = destinations.filter(d => d.latitude != null && d.longitude != null && !isNaN(d.latitude) && !isNaN(d.longitude));
    if (valid.length === 0) return;
    if (valid.length === 1) {
      mapRef.current.flyTo({ center: [valid[0].longitude, valid[0].latitude], zoom: 13 });
      return;
    }
    const lats = valid.map(d => d.latitude as number);
    const lngs = valid.map(d => d.longitude as number);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    ];
    mapRef.current.fitBounds(bounds, { padding: 40 });
  }, [mapLoaded, destinations]);

  useEffect(() => {
    if (selectedDestinationForTickets) {
      const fetchTickets = async () => {
        setIsLoadingTickets(true);
        try {
          const response = await fetch(
            `/api/admin/tourist-destinations/tickets?destinationId=${selectedDestinationForTickets.id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch tickets");
          }
          const data = await response.json();
          setTickets(data);
        } catch (error) {
          toast.error("Failed to fetch tickets");
          console.error("[FETCH_TICKETS_ERROR]", error);
        } finally {
          setIsLoadingTickets(false);
        }
      };
      fetchTickets();
    } else {
        setTickets([]);
    }
  }, [selectedDestinationForTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("categoryName", formData.categoryName);
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);
      formDataToSend.append("openingTime", formData.openingTime);
      formDataToSend.append("closingTime", formData.closingTime);
      
      if (formData.thumbnail) {
        formDataToSend.append("thumbnail", formData.thumbnail);
      }

      const url = selectedDestination
        ? `/api/admin/tourist-destinations/${selectedDestination.id}`
        : "/api/admin/tourist-destinations";
      
      const response = await fetch(url, {
        method: selectedDestination ? "PUT" : "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to save destination");
      }

      toast.success(
        selectedDestination
          ? "Destination updated successfully"
          : "Destination created successfully"
      );
      setIsDialogOpen(false);
      fetchData();
      setIsSuccessDialogOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save destination");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestinationForTickets) return;

    setIsAddingTicket(true);
    try {
      const formData = new FormData();
      formData.append("destinationId", selectedDestinationForTickets.id);
      formData.append("name", newTicketFormData.name);
      formData.append("description", newTicketFormData.description);
      formData.append("ticketType", newTicketFormData.ticketType);
      formData.append("price", newTicketFormData.price);
      formData.append("quotaPerDay", newTicketFormData.quotaPerDay);

      const response = await fetch("/api/admin/tourist-destinations/tickets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add ticket");
      }

      toast.success("Ticket added successfully");
      const updatedTicketsResponse = await fetch(
        `/api/admin/tourist-destinations/tickets?destinationId=${selectedDestinationForTickets?.id}`
      );
      if (updatedTicketsResponse.ok) {
        const updatedTickets = await updatedTicketsResponse.json();
        setTickets(updatedTickets);
      }

      setNewTicketFormData({
        name: "",
        description: "",
        ticketType: "WEEKDAY",
        price: "",
        quotaPerDay: "",
      });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add ticket");
      console.error("[ADD_TICKET_ERROR]", error);
    } finally {
      setIsAddingTicket(false);
    }
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicketForEdit(ticket);
    setEditTicketFormData({
      name: ticket.name,
      description: ticket.description || "",
      ticketType: ticket.ticketType,
      price: ticket.price.toString(),
      quotaPerDay: ticket.quotaPerDay.toString(),
      status: ticket.status,
    });
    setIsEditTicketDialogOpen(true);
  };

  const handleUpdateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForEdit) return;

    setIsUpdatingTicket(true);
    try {
      const formData = new FormData();
      formData.append("name", editTicketFormData.name);
      formData.append("description", editTicketFormData.description);
      formData.append("ticketType", editTicketFormData.ticketType);
      formData.append("price", editTicketFormData.price);
      formData.append("quotaPerDay", editTicketFormData.quotaPerDay);
      formData.append("status", editTicketFormData.status);

      const response = await fetch(
        `/api/admin/tourist-destinations/tickets/${selectedTicketForEdit.id}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update ticket");
      }

      toast.success("Ticket updated successfully");
      const updatedTicketsResponse = await fetch(
        `/api/admin/tourist-destinations/tickets?destinationId=${selectedDestinationForTickets?.id}`
      );
      if (updatedTicketsResponse.ok) {
        const updatedTickets = await updatedTicketsResponse.json();
        setTickets(updatedTickets);
      }

      setIsEditTicketDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update ticket");
      console.error("[UPDATE_TICKET_ERROR]", error);
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const response = await fetch(
        `/api/admin/tourist-destinations/tickets/${ticketId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete ticket");
      }

      toast.success("Ticket deleted successfully");
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete ticket");
      console.error("[DELETE_TICKET_ERROR]", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;

    try {
      const response = await fetch(`/api/admin/tourist-destinations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete destination");
      }

      toast.success("Destination deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete destination");
    }
  };

  const handleEdit = (destination: TouristDestination) => {
    setSelectedDestination(destination);
    setFormData({
      name: destination.name,
      description: destination.description || "",
      address: destination.address || "",
      categoryName: destination.category?.name || "",
      latitude: destination.latitude?.toString() || "",
      longitude: destination.longitude?.toString() || "",
      openingTime: destination.openingTime || "",
      closingTime: destination.closingTime || "",
      thumbnail: null,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedDestination(null);
    setFormData({
      name: "",
      description: "",
      address: "",
      categoryName: "",
      latitude: "",
      longitude: "",
      openingTime: "",
      closingTime: "",
      thumbnail: null,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, thumbnail: file }));
  };

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
    setFormData(prev => ({
      ...prev,
      longitude: lng.toString(),
      latitude: lat.toString()
    }));
  };

  const handleView = (destination: TouristDestination) => {
    setViewDestination(destination);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Tourist Destinations</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedDestination ? "Edit Destination" : "Add New Destination"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="categoryName">Category</Label>
                  <Select
                    value={formData.categoryName}
                    onValueChange={(value) => setFormData({ ...formData, categoryName: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="openingTime">Opening Time</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="closingTime">Closing Time</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label>Location</Label>
                  <p className="text-sm text-gray-500 mb-2">Click on the map below to pick a location.</p>
                  <div className="h-[300px] rounded-lg overflow-hidden w-full">
                    <MapboxMap
                      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                      initialViewState={{
                        longitude: parseFloat(formData.longitude) || 110.3695,
                        latitude: parseFloat(formData.latitude) || -7.7956,
                        zoom: 9
                      }}
                      style={{ width: "100%", height: "100%" }}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                      onClick={handleMapClick}
                    >
                      {formData.latitude && formData.longitude && !isNaN(parseFloat(formData.latitude)) && !isNaN(parseFloat(formData.longitude)) && (
                        <MapboxMarker
                          longitude={parseFloat(formData.longitude)}
                          latitude={parseFloat(formData.latitude)}
                        >
                          <FaMapMarkerAlt className="text-red-500 text-3xl" />
                        </MapboxMarker>
                      )}
                    </MapboxMap>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="Enter latitude or click map to pick"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="Enter longitude or click map to pick"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="w-full"
                    />
                    {formData.thumbnail && (
                      <img
                        src={URL.createObjectURL(formData.thumbnail)}
                        alt="Preview"
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Button type="submit" className="w-full" disabled={isUploading}>
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      selectedDestination ? "Update" : "Create"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Destination Map</h2>
        {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
          <div className="text-red-600 font-bold mb-4">Mapbox token not found! Check NEXT_PUBLIC_MAPBOX_TOKEN in .env</div>
        )}
        <div className="h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
          <MapboxMap
            ref={mapRef}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            onLoad={() => setMapLoaded(true)}
          >
            {filteredDestinations.map(d => (
              d.latitude != null && d.longitude != null && !isNaN(d.latitude) && !isNaN(d.longitude) && (
                <MapboxMarker key={d.id} longitude={d.longitude} latitude={d.latitude} anchor="bottom">
                  {d.category?.icon ? (
                    <img
                      src={d.category.icon}
                      alt={d.category.name}
                      title={d.name}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg bg-white object-cover"
                      style={{ transform: "translateY(-4px)" }}
                    />
                  ) : (
                    <div className="bg-blue-500 rounded-full p-1 shadow-lg border-2 border-white" title={d.name}>
                      <FaMapMarkerAlt className="text-white text-2xl" />
                    </div>
                  )}
                </MapboxMarker>
              )
            ))}
          </MapboxMap>
        </div>
        <div className="mt-4 text-sm text-gray-600">Click on the map in the 'Add/Edit Destination' dialog to select coordinates.</div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDestinations
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((destination) => (
                <TableRow key={destination.id}>
                  <TableCell>{destination.name}</TableCell>
                  <TableCell>{destination.category?.name}</TableCell>
                  <TableCell>{destination.address}</TableCell>
                  <TableCell>{destination.status}</TableCell>
                  <TableCell>
                    {destination.thumbnailUrl ? (
                      <img
                        src={destination.thumbnailUrl}
                        alt={destination.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(destination)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(destination)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(destination.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <DestinationPhotosDialog
                        destinationId={destination.id}
                        destinationName={destination.name}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedDestinationForTickets(destination);
                          setIsTicketDialogOpen(true);
                        }}
                      >
                        <Ticket className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredDestinations.length)} of {filteredDestinations.length}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
            {Array.from({ length: Math.ceil(filteredDestinations.length / itemsPerPage) }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredDestinations.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(filteredDestinations.length / itemsPerPage)}>Next</Button>
          </div>
        </div>
        </>
      )}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Destination Details</DialogTitle>
          </DialogHeader>
          {viewDestination && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                {viewDestination.thumbnailUrl && (
                  <img
                    src={viewDestination.thumbnailUrl}
                    alt={viewDestination.name}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div>
                  <div className="text-xl font-bold">{viewDestination.name}</div>
                  <div className="text-sm text-gray-500">{viewDestination.category?.name}</div>
                  <div className="text-sm text-gray-500">Status: {viewDestination.status}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold">Description</div>
                <div>{viewDestination.description || <span className="text-gray-400">-</span>}</div>
              </div>
              <div>
                <div className="font-semibold">Address</div>
                <div>{viewDestination.address || <span className="text-gray-400">-</span>}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold">Opening Time</div>
                  <div>{viewDestination.openingTime ? viewDestination.openingTime : <span className="text-gray-400">-</span>}</div>
                </div>
                <div>
                  <div className="font-semibold">Closing Time</div>
                  <div>{viewDestination.closingTime ? viewDestination.closingTime : <span className="text-gray-400">-</span>}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Location</div>
                {viewDestination.latitude && viewDestination.longitude ? (
                  <div className="h-[200px] rounded-lg overflow-hidden">
                    <MapboxMap
                      initialViewState={{
                        longitude: Number(viewDestination.longitude),
                        latitude: Number(viewDestination.latitude),
                        zoom: 12
                      }}
                      style={{ width: "100%", height: "100%" }}
                      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                      interactive={false}
                    >
                      <MapboxMarker
                        longitude={Number(viewDestination.longitude)}
                        latitude={Number(viewDestination.latitude)}
                      />
                    </MapboxMap>
                  </div>
                ) : (
                  <span className="text-gray-400">No location data</span>
                )}
              </div>
              <div>
                <div className="font-semibold mb-2">Photos</div>
                <DestinationPhotos destinationId={viewDestination.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Tickets for {selectedDestinationForTickets?.name}</DialogTitle>
          </DialogHeader>
          {selectedDestinationForTickets && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tickets</h3>
              {isLoadingTickets ? (
                <div>Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div>No tickets found for this destination.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quota</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.name}</TableCell>
                        <TableCell>{ticket.ticketType}</TableCell>
                        <TableCell>{ticket.price}</TableCell>
                        <TableCell>{ticket.quotaPerDay}</TableCell>
                        <TableCell>{ticket.status}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditTicket(ticket)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTicket(ticket.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <h3 className="text-lg font-semibold">Add New Ticket</h3>
              <form onSubmit={handleAddTicketSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="new-ticket-name">Name</Label>
                  <Input
                    id="new-ticket-name"
                    value={newTicketFormData.name}
                    onChange={(e) => setNewTicketFormData({ ...newTicketFormData, name: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="new-ticket-type">Ticket Type</Label>
                  <Select
                    value={newTicketFormData.ticketType}
                    onValueChange={(value) => setNewTicketFormData({ ...newTicketFormData, ticketType: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKDAY">Weekday</SelectItem>
                      <SelectItem value="WEEKEND">Weekend</SelectItem>
                      <SelectItem value="HOLIDAY">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="new-ticket-description">Description</Label>
                  <Textarea
                    id="new-ticket-description"
                    value={newTicketFormData.description}
                    onChange={(e) => setNewTicketFormData({ ...newTicketFormData, description: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="new-ticket-price">Price</Label>
                  <Input
                    id="new-ticket-price"
                    type="number"
                    value={newTicketFormData.price}
                    onChange={(e) => setNewTicketFormData({ ...newTicketFormData, price: e.target.value })}
                    required
                    step="0.01"
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="new-ticket-quota">Quota Per Day</Label>
                  <Input
                    id="new-ticket-quota"
                    type="number"
                    value={newTicketFormData.quotaPerDay}
                    onChange={(e) => setNewTicketFormData({ ...newTicketFormData, quotaPerDay: e.target.value })}
                    required
                    step="1"
                    className="w-full"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Button type="submit" disabled={isAddingTicket} className="w-full">
                    {isAddingTicket ? "Adding..." : "Add Ticket"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isEditTicketDialogOpen} onOpenChange={setIsEditTicketDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
          </DialogHeader>
          {selectedTicketForEdit && (
            <form onSubmit={handleUpdateTicketSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-ticket-name">Name</Label>
                <Input
                  id="edit-ticket-name"
                  value={editTicketFormData.name}
                  onChange={(e) =>
                    setEditTicketFormData({ ...editTicketFormData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-ticket-description">Description</Label>
                <Textarea
                  id="edit-ticket-description"
                  value={editTicketFormData.description}
                  onChange={(e) =>
                    setEditTicketFormData({ ...editTicketFormData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-ticket-type">Ticket Type</Label>
                <Select
                  value={editTicketFormData.ticketType}
                  onValueChange={(value) =>
                    setEditTicketFormData({ ...editTicketFormData, ticketType: value })
                  }
                >
                  <SelectTrigger id="edit-ticket-type">
                    <SelectValue placeholder="Select ticket type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKDAY">Weekday</SelectItem>
                    <SelectItem value="WEEKEND">Weekend</SelectItem>
                    <SelectItem value="HOLIDAY">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-ticket-price">Price</Label>
                  <Input
                    id="edit-ticket-price"
                    type="number"
                    value={editTicketFormData.price}
                    onChange={(e) =>
                      setEditTicketFormData({ ...editTicketFormData, price: e.target.value })
                    }
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ticket-quota">Quota Per Day</Label>
                  <Input
                    id="edit-ticket-quota"
                    type="number"
                    value={editTicketFormData.quotaPerDay}
                    onChange={(e) =>
                      setEditTicketFormData({ ...editTicketFormData, quotaPerDay: e.target.value })
                    }
                    required
                    step="1"
                  />
                </div>
              </div>
               <div>
                  <Label htmlFor="edit-ticket-status">Status</Label>
                  <Select
                    value={editTicketFormData.status}
                    onValueChange={(value) =>
                      setEditTicketFormData({ ...editTicketFormData, status: value })
                    }
                  >
                    <SelectTrigger id="edit-ticket-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <Button type="submit" disabled={isUpdatingTicket}>
                {isUpdatingTicket ? "Updating..." : "Update Ticket"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <SuccessDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <SuccessDialogContent>
          <SuccessDialogHeader>
            <SuccessDialogTitle>Success!</SuccessDialogTitle>
          </SuccessDialogHeader>
          <div className="text-center py-4">
            <p>Data destinasi berhasil di-upload!</p>
            <Button onClick={() => setIsSuccessDialogOpen(false)} className="mt-4 w-full">OK</Button>
          </div>
        </SuccessDialogContent>
      </SuccessDialog>
    </div>
  );
}