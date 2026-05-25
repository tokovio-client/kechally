import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Trash2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Package, 
  Truck, 
  User, 
  MapPin, 
  Info, 
  Lock, 
  ChevronDown, 
  CreditCard,
  ArrowLeft,
  Download,
  Image,
  Check 
} from "lucide-react";
import { CartItem } from "../data";
import { 
  createOrder, 
  ApiShippingMethod, 
  ApiProvince, 
  ApiCity, 
  ApiDistrict, 
  ApiSubdistrict, 
  getProvinces, 
  getCities, 
  getDistricts, 
  getSubdistricts, 
  getShippingMethods,
  requestOtp,
  verifyBuyerOtp,
  uploadPaymentEvidence
} from "../api/tokovio";
import { useStore } from "../hooks/useStore";

interface CartViewProps {
  cartItems: CartItem[];
  currency: "IDR" | "USD";
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  setActiveTab: (tab: "story" | "products" | "values" | "bag") => void;
  onViewOrder?: (orderId: string) => void;
}

export default function CartView({
  cartItems,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  setActiveTab,
  onViewOrder,
}: CartViewProps) {
  const [checkoutStep, setCheckoutStep] = useState<"bag" | "form" | "confirm">("bag");

  const calculateSubtotal = () =>
    cartItems.reduce((acc, item) => {
      const price = currency === "IDR" ? item.product.priceIDR : item.product.priceUSD;
      return acc + price * item.quantity;
    }, 0);

  const { store } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<"tokovio_pay" | "manual_transfer">("tokovio_pay");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  // Parse configs
  const shippingConfig = store?.shipping_config ? JSON.parse(store.shipping_config) : null;
  const paymentConfig = store?.payment_config ? JSON.parse(store.payment_config) : null;

  const subtotal = calculateSubtotal();
  const isFreeShipping = !!(shippingConfig?.free_shipping?.enabled && subtotal >= shippingConfig.free_shipping.min_amount);
  
  const bankAccounts = paymentConfig?.bankAccounts || [];
  const manualEnabled = !!paymentConfig?.manualEnabled;
  const hasAutoPay = !!paymentConfig?.apiKey;
  const storeOrderType: "standard" | "preorder" = paymentConfig?.orderType || "standard";
  const isStorePreorder = storeOrderType === "preorder";

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done'>('idle');

  // Form fields
  const [shippingName, setShippingName] = useState("");
  const [shippingEmail, setShippingEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostal, setShippingPostal] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [formError, setFormError] = useState("");

  // WhatsApp Country Code and raw phone states
  const [countryCode, setCountryCode] = useState("+62");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Hierarchical Location Dropdown States
  const [provinces, setProvinces] = useState<ApiProvince[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [districts, setDistricts] = useState<ApiDistrict[]>([]);
  const [subdistricts, setSubdistricts] = useState<ApiSubdistrict[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<ApiProvince | null>(null);
  const [selectedCity, setSelectedCity] = useState<ApiCity | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<ApiDistrict | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<ApiSubdistrict | null>(null);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);

  // Pin Point Location simulation states
  const [isPinPointing, setIsPinPointing] = useState(false);
  const [isPinPointed, setIsPinPointed] = useState(false);

  // Map Modal States
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [pinLocation, setPinLocation] = useState({ x: 50, y: 55 });
  const [pinAddress, setPinAddress] = useState("Jalan Kuningan 11, Antapani Tengah, Antapani");
  const [resolvedOsmData, setResolvedOsmData] = useState<any>({
    address: {
      state: "Jawa Barat",
      city: "Bandung",
      city_district: "Antapani",
      suburb: "Antapani Tengah",
      postcode: "40291"
    }
  });

  // Shipping selection
  const [shippingMethods, setShippingMethods] = useState<ApiShippingMethod[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ApiShippingMethod | null>(null);

  // Order result
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Verification & Payment Flow States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Auto-focus the first OTP input when modal opens
  useEffect(() => {
    if (showVerificationModal) {
      setTimeout(() => {
        const firstInput = document.getElementById("verify-code-input-0");
        if (firstInput) {
          (firstInput as HTMLInputElement).focus();
        }
      }, 100);
    }
  }, [showVerificationModal]);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSubStep, setPaymentSubStep] = useState<"options" | "manual">("options");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<"ordered" | "paid" | "shipped" | "delivered">("ordered");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  useEffect(() => {
    if (paymentConfig) {
      if (paymentConfig.apiKey) {
        setPaymentMethod("tokovio_pay");
      } else if (paymentConfig.manualEnabled) {
        setPaymentMethod("manual_transfer");
      }
    }
  }, [store]);

  // ── Cascading Data Loading ──────────────────────────────────────────────────

  // Fetch provinces on component mount
  useEffect(() => {
    setLoadingProvinces(true);
    getProvinces()
      .then((data) => setProvinces(data))
      .catch((err: unknown) => {
        console.error("Failed to load provinces", err);
        setFormError("Failed to initialize locations. Please check your network.");
      })
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Fetch shipping methods dynamically once a city is selected
  useEffect(() => {
    if (!selectedCity) {
      setShippingMethods([]);
      setSelectedShipping(null);
      return;
    }

    setShippingLoading(true);
    setShippingError(null);
    setSelectedShipping(null);

    getShippingMethods(selectedCity.id)
      .then((data) => {
        // Fallback to defaults if no custom rates exist for this store/city
        if (!data || data.length === 0) {
          setShippingMethods([
            { courier: "JNE", service: "Reguler", price: 15000 },
            { courier: "J&T", service: "Express", price: 15000 },
            { courier: "SiCepat", service: "BEST", price: 15000 }
          ]);
        } else {
          setShippingMethods(data);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch shipping rates. Using premium courier fallbacks.", err);
        setShippingMethods([
          { courier: "JNE", service: "Reguler", price: 15000 },
          { courier: "J&T", service: "Express", price: 15000 },
          { courier: "SiCepat", service: "BEST", price: 15000 }
        ]);
      })
      .finally(() => {
        setShippingLoading(false);
      });
  }, [selectedCity]);

  // Synchronize whatsapp number + country code into standard shippingPhone field
  useEffect(() => {
    const digitsOnly = whatsappNumber.replace(/\D/g, "");
    if (digitsOnly) {
      setShippingPhone(`${countryCode} ${digitsOnly}`);
    } else {
      setShippingPhone("");
    }
  }, [countryCode, whatsappNumber]);

  // ── Cascading Event Handlers ────────────────────────────────────────────────

  const handleProvinceChange = async (provId: string) => {
    const prov = provinces.find((p) => p.id === provId) || null;
    setSelectedProvince(prov);
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setCities([]);
    setDistricts([]);
    setSubdistricts([]);
    setShippingPostal("");

    if (!provId) return;

    setLoadingCities(true);
    try {
      const data = await getCities(provId);
      setCities(data);
    } catch (err: unknown) {
      console.error("Failed to fetch cities", err);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCityChange = async (cityId: string) => {
    const city = cities.find((c) => c.id === cityId) || null;
    setSelectedCity(city);
    setShippingCity(city ? city.name : "");
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setDistricts([]);
    setSubdistricts([]);
    setShippingPostal("");

    if (!cityId) return;

    setLoadingDistricts(true);
    try {
      const data = await getDistricts(cityId);
      setDistricts(data);
    } catch (err: unknown) {
      console.error("Failed to fetch districts", err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (distId: string) => {
    const dist = districts.find((d) => d.id === distId) || null;
    setSelectedDistrict(dist);
    setSelectedSubdistrict(null);
    setSubdistricts([]);
    setShippingPostal("");

    if (!distId) return;

    setLoadingSubdistricts(true);
    try {
      const data = await getSubdistricts(distId);
      setSubdistricts(data);
    } catch (err: unknown) {
      console.error("Failed to fetch subdistricts", err);
    } finally {
      setLoadingSubdistricts(false);
    }
  };

  const handleSubdistrictChange = (subId: string) => {
    const sub = subdistricts.find((s) => s.id === subId) || null;
    setSelectedSubdistrict(sub);
    if (sub) {
      const codes = sub.postal_code.split(",");
      setShippingPostal(codes[0].trim());
    } else {
      setShippingPostal("");
    }
  };

  const getLatLonFromXY = (x: number, y: number) => {
    const minLon = 107.6450;
    const maxLon = 107.6750;
    const minLat = -6.9050;
    const maxLat = -6.9250;
    
    const lon = minLon + (x / 100) * (maxLon - minLon);
    const lat = minLat + (y / 100) * (maxLat - minLat);
    return { lat, lon };
  };

  const getXYFromLatLon = (lat: number, lon: number) => {
    const minLon = 107.6450;
    const maxLon = 107.6750;
    const minLat = -6.9050;
    const maxLat = -6.9250;
    
    let x = ((lon - minLon) / (maxLon - minLon)) * 100;
    let y = ((lat - minLat) / (maxLat - minLat)) * 100;
    
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    return { x, y };
  };

  const formatFullAddress = (addr: any, displayName: string = ""): string => {
    if (!addr) return displayName;
    const parts = [];
    
    // 1. House/building number and road/street info
    const building = addr.building || addr.house_number || addr.amenity || addr.shop || addr.office || "";
    const road = addr.road || addr.highway || addr.path || "";
    if (building && road) {
      parts.push(`${building} ${road}`);
    } else if (building) {
      parts.push(building);
    } else if (road) {
      parts.push(road);
    }
    
    // 2. Sub-district / suburb / village level
    const local = addr.suburb || addr.village || addr.neighbourhood || addr.hamlet || "";
    if (local) parts.push(local);
    
    // 3. District
    const district = addr.city_district || addr.district || "";
    if (district) parts.push(district);
    
    // 4. City / Regency
    const city = addr.city || addr.regency || addr.municipality || "";
    if (city) parts.push(city);
    
    // 5. Province / State
    const state = addr.state || "";
    if (state) parts.push(state);
    
    // 6. Postcode
    const postcode = addr.postcode || "";
    if (postcode) parts.push(postcode);
    
    // 7. Country
    const country = addr.country || "";
    if (country) parts.push(country);
    
    const formatted = parts.filter(Boolean).join(", ");
    if (formatted) return formatted;
    
    return displayName ? displayName.split(",").slice(0, 4).join(", ").trim() : "";
  };

  // Initially geocode the default address from OpenStreetMap Nominatim on mount
  useEffect(() => {
    const initGeocode = async () => {
      try {
        const query = "Jalan Kuningan 11, Antapani Tengah, Antapani";
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
          {
            headers: {
              "Accept-Language": "id,en",
              "User-Agent": "KechallyStoreCheckout/1.0"
            }
          }
        );
        if (res.ok) {
          const data = await res.json() as any[];
          if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            const { x, y } = getXYFromLatLon(lat, lon);
            setPinLocation({ x, y });
            
            // Now reverse geocode to get structural address components (postcode, suburb, etc.)
            const revRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
              {
                headers: {
                  "Accept-Language": "id,en",
                  "User-Agent": "KechallyStoreCheckout/1.0"
                }
              }
            );
            if (revRes.ok) {
              const revData = await revRes.json();
              setResolvedOsmData(revData);
              
              const cleanAddr = formatFullAddress(revData.address, revData.display_name);
              setPinAddress(cleanAddr);
            }
          }
        }
      } catch (err) {
        console.error("Failed to geocode initial address", err);
      }
    };
    initGeocode();
  }, []);

  const handlePinPoint = () => {
    setIsMapModalOpen(true);
  };

  const fetchAddressFromOSM = async (x: number, y: number) => {
    const { lat, lon } = getLatLonFromXY(x, y);
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        {
          headers: {
            "Accept-Language": "id,en",
            "User-Agent": "KechallyStoreCheckout/1.0"
          }
        }
      );
      if (!res.ok) throw new Error("OSM reverse geocoding failed");
      const data = await res.json() as any;
      
      if (data && data.display_name) {
        const cleanAddr = formatFullAddress(data.address, data.display_name);
        setPinAddress(cleanAddr);
        setResolvedOsmData(data);
      }
    } catch (err) {
      console.error("OSM error", err);
      setPinAddress("Jalan Kuningan 11, Antapani Tengah, Antapani");
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapSearch = async (query: string) => {
    if (!query) return;
    setIsSearching(true);
    try {
      const searchQuery = query.toLowerCase().includes("bandung") ? query : `${query}, Bandung`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        {
          headers: {
            "Accept-Language": "id,en",
            "User-Agent": "KechallyStoreCheckout/1.0"
          }
        }
      );
      if (!res.ok) throw new Error("OSM search failed");
      const data = await res.json() as any[];
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const { x, y } = getXYFromLatLon(lat, lon);
        setPinLocation({ x, y });
        
        const shortAddr = result.display_name.split(",").slice(0, 3).join(", ").trim();
        setPinAddress(shortAddr);
        
        const revRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          {
            headers: {
              "Accept-Language": "id,en",
              "User-Agent": "KechallyStoreCheckout/1.0"
            }
          }
        );
        if (revRes.ok) {
          const revData = await revRes.json();
          setResolvedOsmData(revData);
        }
      }
    } catch (err) {
      console.error("OSM search error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const autoFillFromOsmData = async (osmData: any = resolvedOsmData, customPinAddress: string = pinAddress) => {
    try {
      const addressObj = osmData?.address;
      if (!addressObj) return;

      // 1. Resolve province ID
      const provName = addressObj.state || "Jawa Barat";
      let matchedProv = provinces.find(
        (p) => p.name.toLowerCase() === provName.toLowerCase() ||
               p.name.toLowerCase().includes(provName.toLowerCase()) ||
               provName.toLowerCase().includes(p.name.toLowerCase())
      );
      if (!matchedProv) matchedProv = provinces.find((p) => p.id === "32") || provinces[0];
      if (!matchedProv) return;
      const provId = matchedProv.id;
      
      // Load cities
      setLoadingCities(true);
      const citiesList = await getCities(provId);
      setCities(citiesList);
      
      // 2. Resolve city ID (distinguishing between KOTA e.g. Kota Bandung and KABUPATEN e.g. Kabupaten Bandung)
      const cityName = addressObj.city || addressObj.regency || addressObj.county || addressObj.municipality || "Bandung";
      const cityMatches = citiesList.filter(
        (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
               c.name.toLowerCase().includes(cityName.toLowerCase()) ||
               cityName.toLowerCase().includes(c.name.toLowerCase())
      );
      
      let matchedCity = null;
      if (cityMatches.length > 1) {
        if (addressObj.city && !addressObj.county && !addressObj.regency) {
          matchedCity = cityMatches.find((c) => c.type === "KOTA");
        } else if (addressObj.county || addressObj.regency) {
          matchedCity = cityMatches.find((c) => c.type === "KABUPATEN");
        }
      }
      
      if (!matchedCity) {
        matchedCity = cityMatches[0];
      }
      if (!matchedCity) {
        matchedCity = citiesList.find((c) => c.id === "3273") || citiesList[0];
      }
      if (!matchedCity) return;
      const cityId = matchedCity.id;
      
      // Load districts
      setLoadingDistricts(true);
      const districtsList = await getDistricts(cityId);
      setDistricts(districtsList);
      
      // 3. Resolve district ID
      const districtName = addressObj.city_district || addressObj.district || addressObj.subdistrict || "Antapani";
      let matchedDistrict = districtsList.find(
        (d) => d.name.toLowerCase() === districtName.toLowerCase() ||
               d.name.toLowerCase().includes(districtName.toLowerCase()) ||
               districtName.toLowerCase().includes(d.name.toLowerCase())
      );
      if (!matchedDistrict) matchedDistrict = districtsList.find((d) => d.id === "3273141") || districtsList[0];
      if (!matchedDistrict) return;
      const distId = matchedDistrict.id;
      
      // Load subdistricts
      setLoadingSubdistricts(true);
      const subdistrictsList = await getSubdistricts(distId);
      setSubdistricts(subdistrictsList);
      
      // 4. Resolve subdistrict ID
      const subdistrictName = addressObj.suburb || addressObj.village || addressObj.neighbourhood || "Antapani Tengah";
      let matchedSubdistrict = subdistrictsList.find(
        (s) => s.name.toLowerCase() === subdistrictName.toLowerCase() ||
               s.name.toLowerCase().includes(subdistrictName.toLowerCase()) ||
               subdistrictName.toLowerCase().includes(s.name.toLowerCase())
      );
      if (!matchedSubdistrict) matchedSubdistrict = subdistrictsList.find((s) => s.id === "3273141002") || subdistrictsList[0];
      if (!matchedSubdistrict) return;
      
      // 5. Update states
      setSelectedProvince(matchedProv);
      setSelectedCity(matchedCity);
      setShippingCity(matchedCity.name);
      setSelectedDistrict(matchedDistrict);
      setSelectedSubdistrict(matchedSubdistrict);
      
      const code = matchedSubdistrict.postal_code.split(",")[0].trim() || addressObj.postcode || "40291";
      setShippingPostal(code);
      
      setShippingAddress(customPinAddress);
      setIsPinPointed(true);
    } catch (e) {
      console.error("Auto fill error", e);
    } finally {
      setLoadingCities(false);
      setLoadingDistricts(false);
      setLoadingSubdistricts(false);
    }
  };

  const requestBrowserGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Convert to map X/Y using Bandung coordinates (for the simulated visual indicator bounds)
        const { x, y } = getXYFromLatLon(latitude, longitude);
        setPinLocation({ x, y });
        
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "id,en",
                "User-Agent": "KechallyStoreCheckout/1.0"
              }
            }
          );
          if (!res.ok) throw new Error("OSM reverse geocoding failed");
          const data = await res.json() as any;
          
          if (data && data.display_name) {
            const cleanAddr = formatFullAddress(data.address, data.display_name);
            setPinAddress(cleanAddr);
            setResolvedOsmData(data);
            
            // Automatically trigger the cascading dynamic region resolution!
            await autoFillFromOsmData(data, cleanAddr);
          }
        } catch (err) {
          console.error("OSM geocoding error during browser location access", err);
          alert("Failed to resolve address details from OpenStreetMap. Please type your address manually.");
        } finally {
          setIsSearching(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        setIsSearching(false);
        let errorMsg = "Could not retrieve your location. ";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg += "Please allow location access in your browser settings to automatically pinpoint your address.";
        } else {
          errorMsg += error.message;
        }
        alert(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // ── Pricing & Display Helpers ────────────────────────────────────────────────

  const shippingCostDisplay = () => {
    if (!selectedShipping) return "TBD";
    if (currency === "IDR") return `IDR ${selectedShipping.price.toLocaleString("id-ID")}`;
    const usd = Math.round(selectedShipping.price / 15700);
    return `$${usd.toFixed(2)}`;
  };

  const shippingCostValue = () => {
    if (!selectedShipping) return 0;
    if (currency === "IDR") return selectedShipping.price;
    return Math.round(selectedShipping.price / 15700);
  };

  const formatPrice = (val: number) => {
    if (currency === "IDR") return `IDR ${val.toLocaleString("id-ID")}`;
    return `$${val.toFixed(2)}`;
  };

  // ── Step handlers ──────────────────────────────────────────────────────────

  const handleProceedToForm = () => {
    if (cartItems.length === 0) return;
    setCheckoutStep("form");
  };

  const isFormValid = () => {
    return (
      shippingName &&
      shippingEmail &&
      shippingPhone &&
      shippingAddress &&
      selectedProvince &&
      selectedCity &&
      selectedDistrict &&
      selectedSubdistrict &&
      shippingPostal &&
      (isStorePreorder || selectedShipping)
    );
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid() || !selectedShipping) {
      setSubmitError("Please fill out all address details and choose a shipping method.");
      return;
    }
    setSubmitError("");
    setVerificationCode(Array(6).fill(""));
    setVerificationError("");
    setSubmitting(true);

    try {
      await requestOtp(shippingEmail, "email");
      setShowVerificationModal(true);
    } catch (err: unknown) {
      setSubmitError((err as Error).message ?? "Failed to send verification code. Please check your email.");
    } finally {
      setSubmitting(false);
    }
  };

  const executePlaceOrder = async () => {
    const code = verificationCode.join("");
    if (code.length < 6) {
      setVerificationError("Please enter all 6 digits.");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");
    setSubmitError("");

    try {
      // 1. Verify OTP first
      await verifyBuyerOtp(shippingEmail, code);

      // 2. Submit the order
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customerInfo: {
          name: shippingName,
          phone: shippingPhone,
          email: shippingEmail,
        },
        shippingAddress: {
          address: shippingAddress,
          city: shippingCity,
          postal_code: shippingPostal,
          province: selectedProvince?.name || "",
          district: selectedDistrict?.name || "",
          subdistrict: selectedSubdistrict?.name || "",
        },
        payment_method: paymentMethod,
        is_preorder: isStorePreorder,
        shipping_method: selectedShipping?.courier.toLowerCase() || "",
        shipping_price: isStorePreorder ? 0 : shippingCostValue(),
        shipping_cost: isStorePreorder ? 0 : shippingCostValue(),
      };

      const order = await createOrder(payload);
      setShowVerificationModal(false);

      // Redirect immediately to the order detail page
      window.location.href = `/orders/${order.id}`;
    } catch (err: unknown) {
      const errorMsg = (err as Error).message ?? "Verification failed. Please try again.";
      setVerificationError(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerificationCodeChange = (value: string, index: number) => {
    const cleanValue = value.replace(/\D/g, "");
    const newCode = [...verificationCode];
    newCode[index] = cleanValue;
    setVerificationCode(newCode);
    setVerificationError("");

    // Auto-focus next input if a digit is entered
    if (cleanValue && index < 5) {
      const nextInput = document.getElementById(`verify-code-input-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleVerificationCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newCode = [...verificationCode];
      if (!newCode[index] && index > 0) {
        newCode[index - 1] = "";
        setVerificationCode(newCode);
        const prevInput = document.getElementById(`verify-code-input-${index - 1}`);
        if (prevInput) {
          (prevInput as HTMLInputElement).focus();
        }
      } else {
        newCode[index] = "";
        setVerificationCode(newCode);
      }
    }
  };

  const handleResendOtp = async () => {
    if (isResending) return;
    setIsResending(true);
    setVerificationError("");
    try {
      await requestOtp(shippingEmail, "email");
      alert("Verification code has been resent to " + shippingEmail);
    } catch (err: unknown) {
      setVerificationError((err as Error).message ?? "Failed to resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrderReset = () => {
    onClearCart();
    setCheckoutStep("bag");
    setOrderId(null);
    setOrderTotal(null);
    setProofImage(null);
    setEvidenceFile(null);
    setUploadState("idle");
    setPaymentUrl(null);
    setSelectedProvince(null);
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setShippingName("");
    setShippingEmail("");
    setShippingAddress("");
    setShippingPostal("");
    setWhatsappNumber("");
    setSelectedShipping(null);
    setActiveTab("story");
  };

  const renderOverlays = () => {
    return (
      <>
        {/* Security Verification Dialog Overlay */}
        {showVerificationModal && createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
            <div className="bg-white w-full max-w-md rounded-[6px] border border-brand-accent/25 overflow-hidden shadow-2xl animate-fade-in animate-duration-300 text-left p-6 relative">
              <button 
                onClick={() => setShowVerificationModal(false)}
                className="absolute top-4 right-4 text-brand-muted hover:text-brand-primary cursor-pointer transition p-1 hover:bg-brand-bg rounded-full"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="flex items-center space-x-3 border-b border-brand-accent/10 pb-3 mb-6">
                <div className="p-2 bg-brand-bg rounded-full text-brand-accent">
                  <Lock size={16} />
                </div>
                <h3 className="font-sans text-xs font-bold text-brand-primary uppercase tracking-wider">
                  Security Verification
                </h3>
              </div>

              <div className="text-center space-y-4">
                <div className="flex justify-center my-3">
                  <div className="p-3.5 bg-brand-bg text-brand-primary rounded-full">
                    <ShieldCheck size={32} strokeWidth={1.5} />
                  </div>
                </div>

                <h2 className="font-sans text-base font-bold text-brand-primary">
                  Verify your contact
                </h2>
                
                <p className="text-brand-muted text-xs leading-relaxed font-sans max-w-xs mx-auto">
                  We've sent a 6-digit verification code to <strong className="text-brand-primary">{shippingEmail || "your email"}</strong>. Please enter it below to proceed.
                </p>

                {/* Six circles code input */}
                <div className="flex justify-center space-x-2 my-6">
                  {verificationCode.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      id={`verify-code-input-${idx}`}
                      onChange={(e) => handleVerificationCodeChange(e.target.value, idx)}
                      onKeyDown={(e) => handleVerificationCodeKeyDown(e, idx)}
                      className="w-11 h-11 border border-brand-accent/35 rounded-full text-center font-sans font-bold text-base focus:outline-hidden focus:ring-1 focus:ring-brand-accent bg-brand-bg text-brand-primary transition"
                    />
                  ))}
                </div>

                {verificationError && (
                  <div className="text-[11px] text-red-700 font-serif italic flex items-center justify-center space-x-1.5 -mt-3 mb-4 animate-fade-in">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{verificationError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={executePlaceOrder}
                  disabled={verificationCode.some(d => !d) || isVerifying}
                  className={`w-full py-3.5 rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
                    verificationCode.some(d => !d)
                      ? "bg-brand-accent/25 text-brand-accent/60 cursor-not-allowed border border-brand-accent/15"
                      : "bg-brand-primary text-white hover:bg-brand-accent"
                  }`}
                >
                  {isVerifying ? (
                    <Loader2 size={12} className="animate-spin text-white" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  <span>Verify & Proceed</span>
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className={`text-xs font-sans font-bold text-brand-primary hover:text-brand-accent tracking-wide underline cursor-pointer ${
                      isResending ? "opacity-50 cursor-not-allowed animate-pulse" : ""
                    }`}
                  >
                    {isResending ? "Resending..." : "Resend verification code"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Complete Payment Modal Overlay */}
        {showPaymentModal && createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
            <div className="bg-white w-full max-w-md rounded-[6px] border border-brand-accent/25 overflow-hidden shadow-2xl animate-fade-in animate-duration-300 text-left">
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-brand-accent/15 bg-brand-surface">
                <div className="flex items-center space-x-3">
                  {paymentSubStep === "manual" && (
                    <button 
                      onClick={() => setPaymentSubStep("options")}
                      className="p-1 hover:bg-brand-bg rounded-full text-brand-primary transition cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  <h3 className="font-sans text-xs font-bold text-brand-primary uppercase tracking-wider">
                    {paymentSubStep === "options" ? "Complete Payment" : "Manual Transfer Details"}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1.5 hover:bg-brand-bg rounded-full text-brand-muted hover:text-brand-primary transition cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Sub-step 1: Options */}
              {paymentSubStep === "options" && (
                <div className="p-6 space-y-6">
                  <p className="font-sans text-xs text-brand-muted">
                    How would you like to pay for order <strong className="text-brand-primary">#{orderId || "A2883FC7"}</strong>?
                  </p>

                  <div className="space-y-4">
                    {/* Option 1: Automated Payment */}
                    <button
                      onClick={() => {
                        if (paymentUrl) {
                          window.open(paymentUrl, "_blank");
                        } else {
                          alert("Redirecting to automated gateway...");
                        }
                        setOrderStatus("paid");
                        setShowPaymentModal(false);
                      }}
                      className="w-full text-left p-4 rounded-[4px] border border-brand-accent/15 bg-brand-surface hover:bg-brand-bg transition cursor-pointer flex items-center justify-between group flex-row flex-nowrap"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-brand-bg rounded-full text-brand-accent group-hover:bg-white transition">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="font-sans text-xs font-bold text-brand-primary tracking-wide">
                            Automated Payment
                          </p>
                          <p className="font-serif text-[10px] italic text-brand-muted mt-0.5">
                            QRIS, OVO, ShopeePay, Virtual Account
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-brand-muted group-hover:text-brand-primary transition" />
                    </button>

                    {/* Option 2: Manual Bank Transfer */}
                    <button
                      onClick={() => setPaymentSubStep("manual")}
                      className="w-full text-left p-4 rounded-[4px] border border-brand-accent/15 bg-brand-surface hover:bg-brand-bg transition cursor-pointer flex items-center justify-between group flex-row flex-nowrap"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-brand-bg rounded-full text-brand-accent group-hover:bg-white transition">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <p className="font-sans text-xs font-bold text-brand-primary tracking-wide">
                            Manual Bank Transfer
                          </p>
                          <p className="font-serif text-[10px] italic text-brand-muted mt-0.5">
                            Transfer manually and upload receipt
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-brand-muted group-hover:text-brand-primary transition" />
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-step 2: Manual Transfer Details */}
              {paymentSubStep === "manual" && (
                <div className="p-6 space-y-6">
                  
                  {/* Bank Target Accounts */}
                  <div className="space-y-3">
                    <h4 className="font-sans text-[9px] uppercase tracking-widest font-bold text-brand-muted">
                      Target Accounts
                    </h4>
                    {bankAccounts.length > 0 ? (
                      bankAccounts.map((acc: any, idx: number) => (
                        <div key={acc.id || acc.accountNumber || idx} className="p-4 bg-brand-bg/60 rounded-[4px] border border-brand-accent/10 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-sans font-bold text-brand-primary">{acc.bankName}</span>
                            <span className="font-mono text-brand-muted">{acc.accountHolder}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-sm font-bold text-brand-primary">{acc.accountNumber}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(acc.accountNumber);
                                alert("Account number copied!");
                              }}
                              className="text-[9px] font-sans font-bold text-brand-primary uppercase tracking-widest hover:text-brand-accent cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-brand-bg/60 rounded-[4px] border border-brand-accent/10 text-xs text-brand-muted italic">
                        No bank accounts configured by merchant. Please contact seller.
                      </div>
                    )}
                    
                    {/* Total to pay panel */}
                    <div className="p-3 bg-brand-surface rounded-[4px] border border-brand-accent/15 flex justify-between items-center text-xs">
                      <span className="font-sans text-brand-muted font-semibold">Total to pay:</span>
                      <span className="font-sans font-bold text-brand-primary">
                        {formatPrice(orderTotal ?? calculateSubtotal() + shippingCostValue())}
                      </span>
                    </div>
                  </div>

                  {/* Upload Proof of Transfer */}
                  <div className="space-y-3">
                    <h4 className="font-sans text-[9px] uppercase tracking-widest font-bold text-brand-muted">
                      Upload Proof of Transfer
                    </h4>
                    
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        id="payment-proof-upload"
                        onChange={handleProofUpload}
                        className="hidden"
                      />
                      
                      {proofImage ? (
                        <div className="w-full border border-brand-accent/25 rounded-[4px] overflow-hidden bg-brand-bg relative group">
                          <img 
                            src={proofImage} 
                            alt="Proof preview" 
                            className="w-full h-40 object-cover opacity-90"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setProofImage(null)}
                              className="bg-red-600 text-white font-sans text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-[4px] cursor-pointer"
                            >
                              Remove / Re-upload
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label 
                          htmlFor="payment-proof-upload"
                          className="w-full h-32 rounded-[4px] border border-dashed border-brand-accent/25 hover:border-brand-primary bg-brand-bg hover:bg-brand-primary/5 transition flex flex-col items-center justify-center cursor-pointer p-4 text-center group"
                        >
                          <Image size={24} className="text-brand-muted group-hover:text-brand-primary transition mb-2" />
                          <span className="font-sans text-xs font-bold text-brand-primary">
                            Tap to select photo
                          </span>
                          <span className="font-serif text-[9px] text-brand-muted italic mt-0.5">
                            JPEG or PNG up to 5MB
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Submit Proof Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!evidenceFile || !orderId) return;
                      setIsSubmittingProof(true);
                      setUploadState("uploading");
                      try {
                        await uploadPaymentEvidence(orderId, evidenceFile);
                        setUploadState("done");
                        setOrderStatus("paid");
                        setShowPaymentModal(false);
                        alert("Proof of payment uploaded successfully! The seller will verify and confirm your payment.");
                      } catch (err: unknown) {
                        setUploadState("idle");
                        alert((err as Error).message || "Failed to upload payment proof. Please try again.");
                      } finally {
                        setIsSubmittingProof(false);
                      }
                    }}
                    disabled={!proofImage || isSubmittingProof}
                    className={`w-full py-3.5 rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
                      !proofImage || isSubmittingProof
                        ? "bg-brand-accent/25 text-brand-accent/60 cursor-not-allowed border border-brand-accent/15"
                        : "bg-brand-primary text-white hover:bg-brand-accent"
                    }`}
                  >
                    {isSubmittingProof ? (
                      <Loader2 size={12} className="animate-spin text-white" />
                    ) : (
                      <ShieldCheck size={14} />
                    )}
                    <span>Submit Proof of Payment</span>
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </>
    );
  };

  // ── Confirmation screen ────────────────────────────────────────────────────

  if (checkoutStep === "confirm") {
    const subtotal = calculateSubtotal();
    const shipping = shippingCostValue();
    const total = orderTotal ?? subtotal + shipping;
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const triggerPaymentModal = () => {
      setPaymentSubStep("options");
      setShowPaymentModal(true);
    };

    return (
      <div className="w-full bg-brand-bg py-12 px-4 transition-all duration-500 animate-fade-in animate-duration-300">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-accent/15 pb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleOrderReset}
                className="p-2 hover:bg-brand-surface rounded-full border border-brand-accent/15 text-brand-primary transition cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-brand-primary">
                  Order Tracking
                </h1>
                <p className="font-sans text-xs text-brand-muted mt-1 uppercase tracking-wider font-bold">
                  Order #{orderId || "A2883FC7"} • {today}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {onViewOrder && orderId && (
                <button
                  onClick={() => onViewOrder(orderId)}
                  className="flex items-center justify-center space-x-2 bg-brand-primary text-white hover:bg-brand-primary-dark px-4 py-2.5 rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer w-full sm:w-auto"
                >
                  <span>View Order Details</span>
                </button>
              )}
              <button
                onClick={() => alert("Invoice downloaded successfully!")}
                className="flex items-center justify-center space-x-2 border border-brand-accent/25 hover:bg-brand-surface px-4 py-2.5 rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider text-brand-primary transition cursor-pointer w-full sm:w-auto"
              >
                <Download size={14} />
                <span>Download Invoice</span>
              </button>
            </div>
          </div>

          {/* Current Status Panel */}
          <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-accent/10 pb-5">
              <div>
                <h3 className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-brand-primary">
                  Current Status
                </h3>
                <p className="font-serif text-sm italic text-brand-muted mt-1">
                  {isStorePreorder 
                    ? "Awaiting Quote: The seller is calculating your shipping cost and total." 
                    : orderStatus === "ordered" 
                    ? "Please complete your payment to proceed." 
                    : orderStatus === "paid" 
                    ? "Payment received, verifying proof."
                    : "Order is being processed."
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {isStorePreorder ? (
                  <span className="bg-brand-bg border border-brand-accent/15 text-brand-primary px-3.5 py-2 rounded-[4px] text-[10px] font-sans font-bold uppercase tracking-widest animate-pulse">
                    Awaiting Quote
                  </span>
                ) : (
                  <>
                    {orderStatus === "ordered" && (
                      <button
                        onClick={triggerPaymentModal}
                        className="bg-brand-primary text-white hover:bg-brand-accent px-5 py-2.5 rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-2"
                      >
                        {paymentMethod === "tokovio_pay" && paymentUrl ? (
                          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-white">
                            <CreditCard size={14} />
                            <span>Pay Now</span>
                          </a>
                        ) : (
                          <>
                            <CreditCard size={14} />
                            <span>Pay Now</span>
                          </>
                        )}
                      </button>
                    )}
                    <span className="bg-brand-bg border border-brand-accent/15 text-brand-primary px-3.5 py-2 rounded-[4px] text-[10px] font-sans font-bold uppercase tracking-widest">
                      {orderStatus === "ordered" ? "Waiting For Payment" : orderStatus === "paid" ? "Payment Verifying" : "Processing"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
              {isStorePreorder ? (
                [
                  { label: "Submitted", status: true, desc: "Order details received", icon: Package },
                  { label: "Quoting", status: true, desc: "Seller reviews & calculates rate", icon: Loader2 },
                  { label: "Payment Due", status: false, desc: "Review quote & pay", icon: CreditCard },
                  { label: "Processing", status: false, desc: "Shipped & fulfilled", icon: Truck },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center space-y-3 p-4 bg-brand-bg/50 rounded-[4px] border border-brand-accent/5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        step.status 
                          ? "bg-brand-primary text-white border-brand-primary shadow-sm" 
                          : "bg-brand-bg text-brand-muted border-brand-accent/15"
                      }`}>
                        <Icon size={20} className={idx === 1 ? "animate-spin" : ""} />
                      </div>
                      <div>
                        <h4 className={`font-sans text-xs font-bold uppercase tracking-wider ${
                          step.status ? "text-brand-primary" : "text-brand-muted"
                        }`}>
                          {step.label}
                        </h4>
                        <p className="font-serif text-[10px] text-brand-muted italic mt-0.5">
                          {step.status ? step.desc : "Pending"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                [
                  { label: "Ordered", status: true, desc: "Order details received", icon: Package },
                  { label: "Paid", status: orderStatus !== "ordered", desc: "Payment verification", icon: CreditCard },
                  { label: "Shipped", status: false, desc: "In transit to destination", icon: Truck },
                  { label: "Delivered", status: false, desc: "Package handed over", icon: User },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center space-y-3 p-4 bg-brand-bg/50 rounded-[4px] border border-brand-accent/5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        step.status 
                          ? "bg-brand-primary text-white border-brand-primary shadow-sm" 
                          : "bg-brand-bg text-brand-muted border-brand-accent/15"
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className={`font-sans text-xs font-bold uppercase tracking-wider ${
                          step.status ? "text-brand-primary" : "text-brand-muted"
                        }`}>
                          {step.label}
                        </h4>
                        <p className="font-serif text-[10px] text-brand-muted italic mt-0.5">
                          {step.status ? step.desc : "Pending"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Order Items */}
            <div className="lg:col-span-8 bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 space-y-6">
              <h3 className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-brand-primary border-b border-brand-accent/10 pb-3">
                Order Items
              </h3>
              
              <div className="divide-y divide-brand-accent/10">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      {item.product.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-12 h-12 rounded-[4px] object-cover border border-brand-accent/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-[4px] bg-brand-bg border border-brand-accent/10 flex items-center justify-center text-brand-muted">
                          <Package size={16} />
                        </div>
                      )}
                      <div>
                        <h4 className="font-sans text-xs font-bold text-brand-primary">
                          {item.product.name}
                        </h4>
                        <p className="font-serif text-[10px] text-brand-muted italic mt-0.5">
                          Color: {item.selectedColor.name} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-sans text-xs font-bold text-brand-primary">
                      {formatPrice((currency === "IDR" ? item.product.priceIDR : item.product.priceUSD) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div className="border-t border-brand-accent/15 pt-5 space-y-2 text-xs font-sans text-brand-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-brand-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-brand-primary">
                    {isStorePreorder ? "TBD" : selectedShipping ? (isFreeShipping ? "Free" : shippingCostDisplay()) : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between font-serif font-bold text-sm italic text-brand-primary border-t border-dashed border-brand-accent/20 pt-3">
                  <span>{isStorePreorder ? "Total Pending" : "Total Paid"}</span>
                  <span className="not-italic font-sans font-bold text-base">
                    {isStorePreorder ? "Calculating..." : formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Address and Shipping info */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Shipping Details */}
              <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 space-y-4">
                <h3 className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-brand-primary border-b border-brand-accent/10 pb-3">
                  Shipping Details
                </h3>
                {selectedShipping ? (
                  <div className="space-y-2">
                    <p className="font-sans text-xs font-bold uppercase text-brand-primary">
                      {selectedShipping.courier} - {selectedShipping.service}
                    </p>
                    <p className="font-serif text-[10px] text-brand-muted italic">
                      Tracking code will update once dispatched by merchant.
                    </p>
                  </div>
                ) : (
                  <p className="font-serif text-xs text-brand-muted italic">
                    Will be updated once shipped
                  </p>
                )}
              </div>

              {/* Delivery Address */}
              <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 space-y-4">
                <h3 className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-brand-primary border-b border-brand-accent/10 pb-3">
                  Delivery Address
                </h3>
                <div className="space-y-2 text-xs">
                  <p className="font-sans font-bold text-brand-primary">
                    {shippingName}
                  </p>
                  <p className="font-sans text-brand-muted font-bold text-[11px]">
                    {shippingPhone}
                  </p>
                  <p className="font-serif text-brand-muted italic leading-relaxed mt-2 uppercase">
                    {shippingAddress}
                  </p>
                  <p className="font-sans text-brand-muted font-bold text-[10px]">
                    {selectedSubdistrict?.name}, {selectedDistrict?.name}, {selectedCity?.name}, {selectedProvince?.name} - {shippingPostal}
                  </p>
                </div>
              </div>
              
            </div>
          </div>

        </div>
        {renderOverlays()}
      </div>
    );
  }

  // ── Consolidated Checkout Flow ─────────────────────────────────────────────

  return (
    <div className="w-full bg-brand-bg py-12 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {checkoutStep === "form" ? (
          /* CONSOLIDATED TWO-COLUMN CHECKOUT DASHBOARD */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: CONTACT & SHIPPING ADDRESS CARDS */}
            <div className="lg:col-span-8 space-y-6">
              
              <button
                onClick={() => setCheckoutStep("bag")}
                className="text-brand-muted hover:text-brand-primary text-[10px] uppercase tracking-widest font-sans font-bold cursor-pointer transition flex items-center space-x-1"
              >
                <span>← Back to Shopping Bag</span>
              </button>

              {/* 1. CONTACT INFORMATION CARD */}
              <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-accent/10 pb-3">
                  <User className="text-brand-accent shrink-0" size={18} />
                  <h3 className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-brand-primary">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="JANE DOE"
                      className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      placeholder="JANE@EXAMPLE.COM"
                      className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                    WhatsApp Number *
                  </label>
                  <div className="flex rounded-[4px] overflow-hidden border border-brand-accent/15 focus-within:ring-1 focus-within:ring-brand-accent">
                    <div className="relative flex items-center bg-brand-bg px-3 border-r border-brand-accent/15">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-transparent text-[11px] font-sans text-brand-primary pr-4 focus:outline-hidden appearance-none cursor-pointer font-bold"
                      >
                        <option value="+62">🇮🇩 +62</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-1 text-brand-muted pointer-events-none" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="812 3456 7890"
                      className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 focus:outline-hidden font-mono text-brand-primary transition"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SHIPPING ADDRESS CARD */}
              <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-accent/10 pb-3">
                  <Truck className="text-brand-accent shrink-0" size={18} />
                  <h3 className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-brand-primary">
                    Shipping Address
                  </h3>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80">
                      Full Address *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={requestBrowserGeolocation}
                        className="text-[9px] font-sans uppercase tracking-widest font-bold flex items-center space-x-1.5 px-2.5 py-1 rounded-[3px] transition border cursor-pointer bg-brand-primary text-[#FDF8F5] border-brand-accent/20 hover:bg-brand-accent"
                      >
                        <Loader2 size={10} className={`animate-spin ${isSearching ? "block" : "hidden"}`} />
                        <span className="shrink-0">Auto-Detect GPS</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePinPoint}
                        className={`text-[9px] font-sans uppercase tracking-widest font-bold flex items-center space-x-1.5 px-2.5 py-1 rounded-[3px] transition border cursor-pointer ${
                          isPinPointed
                            ? "bg-brand-bg text-brand-primary border-brand-accent/25"
                            : "bg-brand-bg hover:bg-brand-primary/5 text-brand-muted hover:text-brand-primary border-brand-accent/25"
                        }`}
                      >
                        <MapPin size={10} className={isPinPointed ? "text-brand-primary" : "text-brand-accent"} />
                        <span>{isPinPointed ? "Location Pinned" : "Pin Point Location"}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter street, building/house number, RT/RW..."
                    className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-sans font-bold text-brand-primary transition resize-none normal-case"
                  />
                </div>

                {/* Country Hierarchy Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Province Selector */}
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                      Province *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={selectedProvince?.id || ""}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-primary transition appearance-none cursor-pointer font-bold animate-fade-in"
                      >
                        <option value="">SELECT PROVINCE</option>
                        {provinces.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-brand-muted pointer-events-none" />
                      {loadingProvinces && (
                        <Loader2 size={12} className="absolute right-8 top-4 animate-spin text-brand-accent" />
                      )}
                    </div>
                  </div>

                  {/* City Selector */}
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                      City / Regency *
                    </label>
                    <div className="relative">
                      <select
                        required
                        disabled={!selectedProvince}
                        value={selectedCity?.id || ""}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-primary transition appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      >
                        <option value="">SELECT CITY</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.type} {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-brand-muted pointer-events-none" />
                      {loadingCities && (
                        <Loader2 size={12} className="absolute right-8 top-4 animate-spin text-brand-accent" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* District Selector */}
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                      District *
                    </label>
                    <div className="relative">
                      <select
                        required
                        disabled={!selectedCity}
                        value={selectedDistrict?.id || ""}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-primary transition appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      >
                        <option value="">SELECT DISTRICT</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-brand-muted pointer-events-none" />
                      {loadingDistricts && (
                        <Loader2 size={12} className="absolute right-8 top-4 animate-spin text-brand-accent" />
                      )}
                    </div>
                  </div>

                  {/* Subdistrict Selector */}
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                      Subdistrict *
                    </label>
                    <div className="relative">
                      <select
                        required
                        disabled={!selectedDistrict}
                        value={selectedSubdistrict?.id || ""}
                        onChange={(e) => handleSubdistrictChange(e.target.value)}
                        className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-primary transition appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      >
                        <option value="">SELECT SUBDISTRICT</option>
                        {subdistricts.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-brand-muted pointer-events-none" />
                      {loadingSubdistricts && (
                        <Loader2 size={12} className="absolute right-8 top-4 animate-spin text-brand-accent" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Postal Code Selector */}
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={shippingPostal}
                    onChange={(e) => setShippingPostal(e.target.value)}
                    placeholder="AUTO"
                    className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-mono text-brand-primary transition"
                  />
                </div>

                {/* Delivery Notice banner matching layout */}
                <div className="flex items-start space-x-2.5 bg-brand-bg border border-brand-accent/10 rounded-[4px] p-4 text-xs font-serif italic text-brand-muted">
                  <Info size={14} className="text-brand-accent shrink-0 mt-0.5" />
                  <p>
                    {isStorePreorder
                      ? "Pre-order Fulfillments: The seller will contact you with a customized shipping rate once the invoice has been generated."
                      : "Shipping calculated dynamically based on regional distances. Free priorities applied on standard options."}
                  </p>
                </div>
              </div>

              {/* 3. DYNAMIC INLINE SHIPPING SELECTION */}
              {selectedCity && !isStorePreorder && (
                <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 space-y-4 animate-fade-in">
                  <div className="flex items-center space-x-3 border-b border-brand-accent/10 pb-3">
                    <Truck className="text-brand-accent shrink-0" size={18} />
                    <h3 className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-brand-primary">
                      Shipping Address Options
                    </h3>
                  </div>

                  {shippingLoading ? (
                    <div className="flex items-center justify-center py-6 space-x-2 text-brand-muted">
                      <Loader2 size={14} className="animate-spin text-brand-accent" />
                      <span className="text-xs font-serif italic">Loading premium shipping rates...</span>
                    </div>
                  ) : (
                    <div className="border border-brand-accent/15 divide-y divide-brand-accent/10 rounded-[4px] overflow-hidden">
                      {shippingMethods.map((method, idx) => {
                        const displayPrice = currency === "IDR"
                          ? `Rp ${method.price.toLocaleString("id-ID")}`
                          : `$${Math.round(method.price / 15700).toFixed(2)}`;
                        const isSelected =
                          selectedShipping?.courier === method.courier &&
                          selectedShipping?.service === method.service;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedShipping(method)}
                            className={`w-full flex items-center justify-between p-4 text-left transition cursor-pointer ${
                              isSelected
                                ? "bg-brand-primary/5"
                                : "bg-white hover:bg-brand-bg/40"
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              {/* Custom Radio Button */}
                              <div className="w-5 h-5 rounded-full border border-brand-accent flex items-center justify-center shrink-0">
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                                )}
                              </div>
                              
                              <div>
                                <p className="font-sans text-xs font-bold text-brand-primary lowercase">
                                  {method.courier}
                                </p>
                                <p className="font-sans text-[9px] text-brand-muted tracking-wide mt-0.5">
                                  Merchant Rate
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {isFreeShipping ? (
                                <>
                                  <span className="line-through text-brand-muted text-xs font-serif italic">
                                    {displayPrice}
                                  </span>
                                  <span className="text-xs font-sans font-bold text-green-600">
                                    Free
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-sans font-bold text-brand-primary">
                                  {displayPrice}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 4. PAYMENT METHOD PANEL */}
              {selectedCity && (hasAutoPay || manualEnabled) && (
                <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 space-y-4 animate-fade-in">
                  <div className="flex items-center space-x-3 border-b border-brand-accent/10 pb-3">
                    <ShieldCheck className="text-brand-accent shrink-0" size={18} />
                    <h3 className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-brand-primary">
                      Payment Method
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Tokovio Pay Option */}
                    {hasAutoPay && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("tokovio_pay")}
                        className={`w-full flex items-center justify-between p-4 rounded-[4px] border transition cursor-pointer text-left ${
                          paymentMethod === "tokovio_pay"
                            ? "bg-brand-primary/5 border-brand-primary"
                            : "bg-white border-brand-accent/15 hover:bg-brand-bg/40"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            paymentMethod === "tokovio_pay" ? "border-brand-primary" : "border-brand-accent"
                          }`}>
                            {paymentMethod === "tokovio_pay" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-sans text-xs font-bold text-brand-primary tracking-wide">
                              Tokovio Pay
                            </p>
                            <p className="font-serif text-[10px] italic text-brand-muted mt-0.5">
                              Pay instantly via transfer, QRIS, or e-wallet
                            </p>
                          </div>
                        </div>
                        <ShieldCheck size={16} className={paymentMethod === "tokovio_pay" ? "text-brand-primary" : "text-brand-muted"} />
                      </button>
                    )}

                    {/* Manual Bank Transfer Option */}
                    {manualEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("manual_transfer")}
                        className={`w-full flex items-center justify-between p-4 rounded-[4px] border transition cursor-pointer text-left ${
                          paymentMethod === "manual_transfer"
                            ? "bg-brand-primary/5 border-brand-primary"
                            : "bg-white border-brand-accent/15 hover:bg-brand-bg/40"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            paymentMethod === "manual_transfer" ? "border-brand-primary" : "border-brand-accent"
                          }`}>
                            {paymentMethod === "manual_transfer" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-sans text-xs font-bold text-brand-primary tracking-wide">
                              Manual Bank Transfer
                            </p>
                            <p className="font-serif text-[10px] italic text-brand-muted mt-0.5">
                              Transfer manually and upload payment receipt
                            </p>
                          </div>
                        </div>
                        <CreditCard size={16} className={paymentMethod === "manual_transfer" ? "text-brand-primary" : "text-muted"} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Leaflet-Style Map Modal */}
              {isMapModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs transition-opacity duration-300">
                  <div className="bg-white w-full max-w-2xl rounded-[6px] border border-brand-accent/25 overflow-hidden shadow-2xl animate-fade-in animate-duration-300 text-left">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-brand-accent/15 bg-brand-surface">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-brand-bg rounded-full text-brand-accent">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <h3 className="font-sans text-sm font-bold text-brand-primary">
                            Pin Point Location
                          </h3>
                          <p className="font-serif text-[10px] text-brand-muted italic leading-none mt-0.5">
                            Drag the map or use search to find your location
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsMapModalOpen(false)}
                        className="p-1.5 hover:bg-brand-bg rounded-full text-brand-muted hover:text-brand-primary transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-4">
                      
                      {/* Search Input Bar */}
                      <div className="flex rounded-[4px] overflow-hidden border border-brand-accent/20">
                        <input
                          type="text"
                          placeholder="Search address, street, or area...."
                          defaultValue={isPinPointed ? "Jalan Kuningan 11, Antapani Tengah" : ""}
                          id="map-search-input"
                          className="w-full bg-brand-bg hover:bg-brand-bg/80 focus:bg-white text-xs px-4 py-3 focus:outline-hidden font-serif italic text-brand-primary transition"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const inputEl = document.getElementById("map-search-input") as HTMLInputElement;
                            const val = inputEl ? inputEl.value : "";
                            handleMapSearch(val);
                          }}
                          className="bg-brand-primary hover:bg-brand-accent text-white text-[11px] px-6 font-sans font-bold uppercase transition cursor-pointer"
                        >
                          {isSearching ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            "Search"
                          )}
                        </button>
                      </div>

                      {/* Info Instruction bar */}
                      <div className="flex items-center space-x-2 text-[10px] font-sans uppercase tracking-wider text-brand-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                        <span className="font-bold text-brand-primary">• Click or drag to pick location</span>
                      </div>

                      {/* The Simulated Leaflet Map Grid */}
                      <div 
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setPinLocation({ x, y });
                          fetchAddressFromOSM(x, y);
                        }}
                        className="w-full h-[320px] rounded-[4px] border border-brand-accent/15 overflow-hidden bg-[#EBF0F5] relative select-none cursor-crosshair"
                      >
                        {/* SVG Map Graphics - extremely precise and premium */}
                        <svg className="w-full h-full absolute inset-0 opacity-80" xmlns="http://www.w3.org/2000/svg">
                          {/* Green areas */}
                          <rect x="10%" y="10%" width="30%" height="25%" rx="8" fill="#D5E8D4" stroke="#B9E3B4" strokeWidth="1" />
                          <text x="15%" y="20%" className="fill-[#5C8E58] font-sans text-[9px] uppercase tracking-widest font-bold font-serif italic">Taman Prabuwangi</text>

                          <rect x="70%" y="45%" width="25%" height="30%" rx="8" fill="#D5E8D4" stroke="#B9E3B4" strokeWidth="1" />
                          <text x="75%" y="55%" className="fill-[#5C8E58] font-sans text-[9px] uppercase tracking-widest font-bold font-serif italic">Antapani Wetan</text>

                          {/* River */}
                          <path d="M 0,220 Q 200,240 400,180 T 800,200" fill="none" stroke="#B2CFFF" strokeWidth="14" strokeLinecap="round" />
                          <text x="350" y="170" className="fill-[#4A7BB0] font-sans text-[7px] uppercase tracking-widest font-bold font-mono">Kali Cidurian</text>

                          {/* Main roads */}
                          <line x1="0" y1="120" x2="800" y2="120" stroke="#FFF" strokeWidth="18" />
                          <line x1="0" y1="120" x2="800" y2="120" stroke="#E1E5EB" strokeWidth="14" />
                          <text x="50" y="123" className="fill-[#7B8B9B] font-sans text-[8px] uppercase tracking-widest font-bold">Jalan Terusan Jakarta</text>

                          <line x1="300" y1="0" x2="300" y2="400" stroke="#FFF" strokeWidth="14" />
                          <line x1="300" y1="0" x2="300" y2="400" stroke="#E1E5EB" strokeWidth="10" />

                          <line x1="500" y1="0" x2="500" y2="400" stroke="#FFF" strokeWidth="14" />
                          <line x1="500" y1="0" x2="500" y2="400" stroke="#E1E5EB" strokeWidth="10" />
                          <text x="505" y="300" className="fill-[#7B8B9B] font-sans text-[8px] uppercase tracking-widest font-bold rotate-90 origin-left">Jalan Kuningan</text>

                          {/* Local streets */}
                          <path d="M 300,180 L 500,280 L 800,280" fill="none" stroke="#FFF" strokeWidth="10" />
                          <path d="M 300,180 L 500,280 L 800,280" fill="none" stroke="#E6EAF0" strokeWidth="7" />
                          <text x="580" y="277" className="fill-[#8A9AA8] font-sans text-[7px] uppercase tracking-widest font-bold">Antapani Kidul</text>

                          {/* Water label */}
                          <path d="M 120,290 C 220,330 320,280 400,320" fill="none" stroke="#B2CFFF" strokeWidth="6" />
                        </svg>

                        {/* Leaflet Controls simulation */}
                        <div className="absolute top-3 left-3 bg-white border border-brand-accent/25 rounded-[3px] shadow-xs flex flex-col overflow-hidden text-brand-primary font-bold text-sm">
                          <button type="button" onClick={(e) => { e.stopPropagation(); }} className="w-7 h-7 flex items-center justify-center hover:bg-brand-bg transition cursor-pointer">+</button>
                          <div className="h-[1px] bg-brand-accent/15" />
                          <button type="button" onClick={(e) => { e.stopPropagation(); }} className="w-7 h-7 flex items-center justify-center hover:bg-brand-bg transition cursor-pointer">—</button>
                        </div>

                        {/* Leaflet Attribution simulation */}
                        <div className="absolute bottom-1 right-2 bg-white/70 px-1 py-0.5 rounded-[2px] text-[7px] font-mono text-brand-muted pointer-events-none">
                           Leaflet | © OpenStreetMap contributors
                        </div>

                        {/* Simulated Draggable Map Pin */}
                        <div 
                          style={{ 
                            left: `${pinLocation.x}%`, 
                            top: `${pinLocation.y}%`, 
                            transform: 'translate(-50%, -100%)' 
                          }}
                          className="absolute transition-all duration-300 pointer-events-none"
                        >
                          {/* Pulsing marker */}
                          <div className="flex flex-col items-center">
                            {/* Address Tooltip bubble */}
                            <div className="bg-brand-primary text-white text-[8px] font-sans px-2.5 py-1.5 rounded-[4px] shadow-lg mb-1 animate-bounce font-bold tracking-wide whitespace-nowrap border border-brand-accent/20 flex items-center space-x-1.5">
                              <MapPin size={8} className="text-brand-pink shrink-0" />
                              <span>{pinAddress.split(",")[1]?.trim() || "Antapani Tengah"}</span>
                            </div>
                            
                            {/* Pin Icon */}
                            <div className="relative">
                              <div className="absolute -inset-2 bg-brand-primary/20 rounded-full animate-ping pointer-events-none" />
                              <MapPin size={28} className="text-brand-primary fill-brand-pink filter drop-shadow-md" />
                              <div className="w-2.5 h-2.5 bg-brand-primary rounded-full absolute top-[7px] left-[9px] border border-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer buttons of modal */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={requestBrowserGeolocation}
                          className="w-full border border-brand-primary text-brand-primary hover:bg-brand-primary/5 py-3.5 rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-2 bg-white"
                        >
                          <Loader2 size={12} className={`animate-spin ${isSearching ? "block" : "hidden"}`} />
                          <span className="shrink-0">Use Current Location</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            autoFillFromOsmData();
                            setIsMapModalOpen(false);
                          }}
                          className="w-full bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent py-3.5 rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          Confirm This Location
                        </button>
                      </div>

                    </div>

                  </div>
                </div>,
                document.body
              )}

            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
              
              <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 space-y-6">
                <h3 className="font-serif text-lg text-brand-primary font-bold italic tracking-tighter border-b border-brand-accent/15 pb-3">
                  Order Summary
                </h3>

                {/* Items */}
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => {
                    const price = currency === "IDR" ? item.product.priceIDR : item.product.priceUSD;
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs text-brand-muted font-serif italic">
                        <span className="line-clamp-1 pr-2">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="not-italic text-brand-primary font-sans font-bold">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="h-[1px] bg-brand-accent/15 my-4" />

                {/* Totals */}
                <div className="space-y-3.5 text-xs text-brand-muted">
                  <div className="flex justify-between font-serif italic">
                    <span>Subtotal</span>
                    <span className="not-italic font-bold text-brand-primary">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between font-serif italic">
                    <span>Shipping</span>
                    <span className="not-italic font-bold text-brand-primary">
                      {isStorePreorder ? "TBD" : selectedShipping ? shippingCostDisplay() : "TBD"}
                    </span>
                  </div>

                  <div className="h-[1px] bg-brand-accent/15 my-4" />

                  <div className="flex justify-between text-base font-serif italic font-bold text-brand-primary">
                    <span>Total</span>
                    <span className="font-serif font-bold not-italic text-lg text-brand-primary">
                      {isStorePreorder 
                        ? "Calculating..."
                        : selectedShipping 
                        ? formatPrice(calculateSubtotal() + shippingCostValue())
                        : "Calculating..."
                      }
                    </span>
                  </div>
                </div>

                {/* Locked Submit Button */}
                <div className="pt-2">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting || !isFormValid()}
                    id="checkout-btn"
                    className={`w-full flex items-center justify-center space-x-2 text-xs tracking-widest font-sans font-bold uppercase py-4 rounded-[4px] transition-all duration-300 ${
                      submitting || !isFormValid()
                        ? "bg-brand-accent/20 text-brand-accent/40 cursor-not-allowed border border-brand-accent/10"
                        : "bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent hover:shadow-xs cursor-pointer"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={12} className="shrink-0" />
                        <span>{isStorePreorder ? "Place Pre-order" : paymentMethod === "tokovio_pay" ? "Pay Now" : "Place Order"}</span>
                      </>
                    )}
                  </button>
                </div>

                {submitError && (
                  <p className="text-[10px] text-red-700 font-serif italic flex items-center space-x-1 pt-1 justify-center">
                    <AlertCircle size={11} className="shrink-0" />
                    <span>{submitError}</span>
                  </p>
                )}
              </div>

              {/* Secure seal beneath summary */}
              <div className="flex items-center justify-center space-x-2 text-[10px] font-sans uppercase tracking-[0.15em] text-brand-muted">
                <ShieldCheck size={14} className="text-brand-accent" />
                <span>Secure checkout by Tokovio</span>
              </div>
            </div>

          </div>
        ) : (
          /* SHOPPING BAG VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start animate-fade-in animate-duration-300">

            {/* Left: Item list */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border-b border-brand-accent/15 pb-4">
                <h1 className="font-serif text-5xl text-brand-primary font-bold italic tracking-tighter leading-none pb-2">
                  Shopping bag.
                </h1>
                <p className="text-brand-muted text-xs font-serif italic">
                  {cartItems.length} sacred companion{cartItems.length !== 1 ? "s" : ""} selected for daily prayers.
                </p>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-24 bg-brand-surface rounded-[4px] border border-brand-accent/15 p-8 space-y-5">
                  <AlertCircle size={32} className="mx-auto text-brand-accent/60" />
                  <p className="text-brand-muted text-xs sm:text-sm font-serif italic leading-relaxed">
                    Your shopping bag is currently empty. Our artisan weavers are always creating; find your perfect companion today.
                  </p>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent px-8 py-3.5 text-xs tracking-widest uppercase rounded-[4px] transition cursor-pointer font-sans font-bold"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-brand-accent/10 bg-brand-surface px-4 sm:px-6 rounded-[4px] border border-brand-accent/15">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-24 rounded-[4px] overflow-hidden bg-brand-bg shrink-0 border border-brand-accent/10 relative">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h3
                            onClick={() => setActiveTab("products")}
                            className="font-serif text-base text-brand-primary font-bold italic hover:text-brand-accent transition cursor-pointer"
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-[10px] font-sans font-bold text-brand-muted uppercase mt-0.5">
                            Color: <span className="text-brand-primary font-serif lowercase italic font-normal">{item.selectedColor.name}</span>
                          </p>
                          <p className="font-serif text-xs font-bold text-brand-primary mt-1.5">
                            {currency === "IDR"
                              ? `IDR ${item.product.priceIDR.toLocaleString("id-ID")}`
                              : `$${item.product.priceUSD.toFixed(2)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-6">
                        <div className="flex items-center border border-brand-accent/15 rounded-[4px] bg-brand-bg/50">
                          <button
                            onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                            className="px-2.5 py-1 text-xs text-brand-muted hover:text-brand-primary font-semibold cursor-pointer"
                          >
                            —
                          </button>
                          <span className="px-3 py-1 font-mono text-xs text-brand-primary font-bold min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="px-2.5 py-1 text-xs text-brand-muted hover:text-brand-primary font-semibold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-brand-muted hover:text-brand-primary text-xs font-sans uppercase tracking-wider flex items-center space-x-1 underline decoration-brand-accent/20 hover:decoration-brand-primary transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-brand-surface p-6 sm:p-8 rounded-[4px] border border-brand-accent/15 shadow-none space-y-6">
                <h3 className="font-serif text-lg text-brand-primary font-bold italic tracking-tighter border-b border-brand-accent/15 pb-3">
                  Order summary.
                </h3>

                <div className="space-y-4 text-xs font-serif text-brand-muted italic">
                  <div className="flex justify-between">
                    <span className="not-italic">Subtotal</span>
                    <span className="font-serif not-italic font-bold text-brand-primary">
                      {formatPrice(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="not-italic">Shipping</span>
                    <span className="font-serif not-italic text-brand-muted">Calculated at next step</span>
                  </div>

                  <div className="h-[1px] bg-brand-accent/15 my-4" />

                  <div className="flex justify-between text-base font-serif italic font-bold text-brand-primary">
                    <span>Total</span>
                    <span className="font-serif font-bold not-italic text-lg text-brand-primary">
                      {formatPrice(calculateSubtotal())}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleProceedToForm}
                    disabled={cartItems.length === 0}
                    id="checkout-btn"
                    className={`w-full text-center text-xs tracking-widest font-sans font-bold uppercase py-4 rounded-[4px] transition-all duration-300 flex items-center justify-center space-x-2 ${
                      cartItems.length === 0
                        ? "bg-brand-accent/25 text-brand-accent/50 cursor-not-allowed"
                        : "bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent cursor-pointer"
                    }`}
                  >
                    <span>Proceed to Checkout</span>
                    {cartItems.length > 0 && <ArrowRight size={14} />}
                  </button>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="p-5 bg-brand-surface rounded-[4px] border border-brand-accent/15 space-y-4">
                <div className="flex items-start space-x-3 text-xs">
                  <ShieldCheck className="text-brand-primary shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="font-serif text-xs font-bold italic text-brand-primary">Handmade with Care</h5>
                    <p className="text-[11px] text-brand-muted font-serif italic mt-0.5 leading-relaxed text-justify">
                      Every order is meticulously quality-checked and packaged directly from our Malang workshop.
                    </p>
                  </div>
                </div>
                <div className="h-[1px] bg-brand-accent/10" />
                <div className="flex items-start space-x-3 text-xs">
                  <ShieldCheck className="text-brand-primary shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="font-serif text-xs font-bold italic text-brand-primary">Secure Fulfillments</h5>
                    <p className="text-[11px] text-brand-muted font-serif italic mt-0.5 leading-relaxed text-justify">
                      We offer Indonesian bank transfers, Mastercard processing, and DHL tracking guarantees.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
      {renderOverlays()}
    </div>
  );
}
