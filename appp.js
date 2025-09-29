import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TransportDashboard from "./pages/TransportDashboard";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TransportDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, Search, Bell, Settings, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface NavigationProps {
  currentView: "map" | "search" | "alerts" | "admin";
  onViewChange: (view: "map" | "search" | "alerts" | "admin") => void;
  alertCount: number;
  isAdmin?: boolean;
}

export default function Navigation({ currentView, onViewChange, alertCount, isAdmin = false }: NavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { id: "map" as const, label: "Live Map", icon: Map },
    { id: "search" as const, label: "Search Buses", icon: Search },
    { id: "alerts" as const, label: "Alerts", icon: Bell, badge: alertCount > 0 ? alertCount : undefined },
  ];

  if (isAdmin) {
    navItems.push({ id: "admin" as const, label: "Admin Panel", icon: Shield });
  }

  return (
    <nav className="bg-card border-b border-border" data-testid="component-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground rounded-lg p-2">
              <Map className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-app-title">
                TransitTracker
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Real-time public transport tracking
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onViewChange(item.id)}
                  className="relative"
                  data-testid={`button-nav-${item.id}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Theme toggle and admin badge */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAdmin && (
              <Badge variant="outline" data-testid="badge-admin-indicator">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ZoomIn, ZoomOut, Navigation, Layers } from "lucide-react";

interface BusLocation {
  id: string;
  routeNumber: string;
  lat: number;
  lng: number;
  status: "on-time" | "delayed" | "cancelled";
  occupancy: "low" | "medium" | "high";
}

export default function MapInterface({ buses, onBusSelect, selectedBusId }) {
  const [zoomLevel, setZoomLevel] = useState(13);
  const [showLayers, setShowLayers] = useState({
    buses: true,
    stops: true,
    routes: true
  });

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
    console.log('Zoom in triggered, new level:', zoomLevel + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time": return "bg-transport-on-time";
      case "delayed": return "bg-transport-delayed";
      case "cancelled": return "bg-transport-cancelled";
      default: return "bg-gray-400";
    }
  };

  const getOccupancySize = (occupancy: string) => {
    switch (occupancy) {
      case "low": return "w-3 h-3";
      case "medium": return "w-4 h-4";
      case "high": return "w-5 h-5";
      default: return "w-4 w-4";
    }
  };

  return (
    <Card className="h-full" data-testid="component-map-interface">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Bus Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" data-testid="text-zoom-level">
              Zoom: {zoomLevel}
            </Badge>
            <Badge variant="outline" data-testid="text-bus-count">
              {buses.length} buses
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Map Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRecenter}>
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Simulated Map Area with Bus Markers */}
        <div className="relative bg-muted rounded-md h-96 overflow-hidden">
          {/* Mock map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-950 dark:to-green-950 opacity-30" />
          
          {/* Bus markers */}
          {showLayers.buses && buses.map(bus => {
            const x = Math.random() * 85 + 5; // Random position
            const y = Math.random() * 80 + 10;
            
            return (
              <div
                key={bus.id}
                className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 ${
                  selectedBusId === bus.id ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => onBusSelect(bus.id)}
                data-testid={`marker-bus-${bus.id}`}
              >
                <div className={`rounded-full ${getStatusColor(bus.status)} ${getOccupancySize(bus.occupancy)} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                  {bus.routeNumber}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { Search, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function BusSearch({ onLocationSelect, onRouteFilter, onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  const locations = [
    "Downtown Transit Center",
    "University Campus", 
    "Airport Terminal",
    "Shopping Mall",
    "Central Station"
  ];

  const routes = ["Route 1", "Route 5", "Route 12", "Route 23", "Route 45"];

  const handleRouteToggle = (route: string) => {
    const newRoutes = selectedRoutes.includes(route)
      ? selectedRoutes.filter(r => r !== route)
      : [...selectedRoutes, route];
    
    setSelectedRoutes(newRoutes);
    onRouteFilter(newRoutes);
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <div className="space-y-4" data-testid="component-bus-search">
      {/* Location Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Location</label>
        <Select onValueChange={onLocationSelect} data-testid="select-location">
          <SelectTrigger>
            <SelectValue placeholder="Choose your location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map(location => (
              <SelectItem key={location} value={location}>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {location}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search Buses</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by route, destination, or stop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-buses"
            />
          </div>
          <Button onClick={handleSearch} data-testid="button-search">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Route Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter by Routes
        </label>
        <div className="flex flex-wrap gap-2">
          {routes.map(route => {
            const isSelected = selectedRoutes.includes(route);
            return (
              <Badge
                key={route}
                variant={isSelected ? "default" : "secondary"}
                className="cursor-pointer hover-elevate"
                onClick={() => handleRouteToggle(route)}
              >
                {route}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface BusCardProps {
  routeNumber: string;
  destination: string;
  currentStop: string;
  nextStop: string;
  arrivalTime: string;
  status: "on-time" | "delayed" | "cancelled";
  delayMinutes?: number;
  occupancy: "low" | "medium" | "high";
  onTrack: () => void;
}

export default function BusCard({
  routeNumber,
  destination,
  currentStop,
  nextStop,
  arrivalTime,
  status,
  delayMinutes,
  occupancy,
  onTrack
}: BusCardProps) {
  const getOccupancyColor = () => {
    switch (occupancy) {
      case "low": return "text-transport-on-time";
      case "medium": return "text-transport-delayed";
      case "high": return "text-transport-cancelled";
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-bus-${routeNumber}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Route {routeNumber}</h3>
            <p className="text-muted-foreground">to {destination}</p>
          </div>
          <StatusBadge status={status} minutes={delayMinutes} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Currently at: {currentStop}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-transport-route" />
            <span className="text-sm">Next: {nextStop}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Arrives: {arrivalTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className={`h-4 w-4 ${getOccupancyColor()}`} />
            <span className={`text-sm capitalize ${getOccupancyColor()}`}>
              {occupancy}
            </span>
          </div>
        </div>

        <Button onClick={onTrack} className="w-full" data-testid="button-track-bus">
          Track This Bus
        </Button>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface TransportAlert {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  route?: string;
  timestamp: string;
}

export default function AlertPanel({ alerts, onDismiss }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "info": return <Info className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "error": return <AlertTriangle className="h-4 w-4" />;
      case "success": return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case "info": return "border-transport-route bg-blue-50 dark:bg-blue-950/20";
      case "warning": return "border-transport-delayed bg-orange-50 dark:bg-orange-950/20";
      case "error": return "border-transport-cancelled bg-red-50 dark:bg-red-950/20";
      case "success": return "border-transport-on-time bg-green-50 dark:bg-green-950/20";
    }
  };

  return (
    <div className="space-y-4" data-testid="component-alert-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Live Alerts ({alerts.length})</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {alerts.map(alert => (
            <Alert key={alert.id} className={getAlertClass(alert.type)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="space-y-1 flex-1">
                    <AlertTitle className="text-sm font-medium">
                      {alert.title}
                      {alert.route && (
                        <Badge variant="outline" className="ml-2">
                          {alert.route}
                        </Badge>
                      )}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => onDismiss(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});