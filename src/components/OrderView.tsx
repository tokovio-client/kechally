import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Package,
  CreditCard,
  Truck,
  Home,
  MapPin,
  ExternalLink,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Upload,
  X,
  Camera,
  AlertCircle,
  Loader2,
  ImageIcon,
  Copy,
  ChevronRight,
  Info,
} from "lucide-react";
import { getOrder, getProduct, confirmDelivery, getStore, uploadPaymentEvidence, ApiOrder, ApiProduct, ApiStore } from "../api/tokovio";

interface OrderItemWithProduct {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: ApiProduct;
}

interface OrderViewProps {
  orderId: string;
  onBack: () => void;
  currency: "IDR" | "USD";
}

// ── Delivery Confirm sub-component ─────────────────────────────────────────────

type DeliveryStage = "idle" | "confirm" | "uploading" | "done" | "error";

function DeliverConfirm({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const [stage, setStage] = useState<DeliveryStage>("idle");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image must be smaller than 10 MB.");
      return;
    }
    setErrorMsg("");
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setStage("uploading");
    setErrorMsg("");
    try {
      if (!photo) {
        setErrorMsg("Please upload a photo as evidence.");
        setStage("confirm");
        return;
      }
      await confirmDelivery(orderId, photo);
      setStage("done");
      setTimeout(() => onDone(), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStage("error");
    }
  };

  const reset = () => {
    setStage("idle");
    setPhoto(null);
    setPreview(null);
    setErrorMsg("");
  };

  // Done state
  if (stage === "done") {
    return (
      <div className="rounded-2xl border border-green-500/40 bg-green-50 p-6 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="font-serif font-bold text-brand-text text-base">Evidence Uploaded!</h3>
        <p className="text-sm text-brand-text/70">
          Thank you. The store will verify and confirm your delivery shortly.
        </p>
      </div>
    );
  }

  // Idle CTA
  if (stage === "idle") {
    return (
      <div>
        <button
          onClick={() => setStage("confirm")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-400 text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4" />
          I Received My Order
        </button>
        <p className="text-xs text-brand-text/50 text-center mt-2">
          Tap above once your package has been delivered.
        </p>
      </div>
    );
  }

  // Upload / confirm panel
  return (
    <div className="rounded-2xl border border-brand-primary/15 bg-white p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
          <Camera className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-brand-text text-sm">Confirm Delivery</h3>
          <p className="text-xs text-brand-text/60">Upload a photo as proof of receipt (required)</p>
        </div>
        <button
          onClick={reset}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-bg text-brand-text/50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Photo uploader */}
      <div
        onClick={() => fileRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[140px] overflow-hidden
          ${preview ? "border-teal-400/60 bg-teal-50/30" : "border-brand-primary/20 hover:border-brand-primary/50 hover:bg-brand-bg"}`}
      >
        {preview ? (
          <img src={preview} alt="Delivery evidence" className="w-full h-40 object-cover rounded-xl" />
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-brand-text/40" />
            </div>
            <span className="text-sm text-brand-text/60 font-medium">Tap to upload photo</span>
            <span className="text-xs text-brand-text/40">JPG, PNG, HEIC · Max 10 MB</span>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {preview && (
        <button
          onClick={(e) => { e.stopPropagation(); setPhoto(null); setPreview(null); }}
          className="text-xs text-red-500 hover:underline self-start flex items-center gap-1"
        >
          <X className="h-3 w-3" /> Remove photo
        </button>
      )}

      {(stage === "error" || errorMsg) && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={reset}
          disabled={stage === "uploading"}
          className="flex-1 h-10 rounded-xl border border-brand-primary/15 text-brand-text text-sm font-semibold hover:bg-brand-bg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={stage === "uploading" || !photo}
          className="flex-1 h-10 rounded-xl bg-teal-400 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
        >
          {stage === "uploading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</>
          ) : (
            <><Upload className="h-4 w-4" /> Confirm Delivery</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency: "IDR" | "USD") {
  return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

// ── Main OrderView ─────────────────────────────────────────────────────────────

export default function OrderView({ orderId, onBack, currency }: OrderViewProps) {
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [itemsWithProducts, setItemsWithProducts] = useState<OrderItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // After delivery confirmation, refresh the order to show delivery_photo_url
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);

  const [store, setStore] = useState<ApiStore | null>(null);
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);
  const [paymentStage, setPaymentStage] = useState<"choose" | "manual" | "uploading" | "done" | "error">("choose");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done">("idle");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchOrderData = async () => {
    setLoading(true);
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);

      const items = orderData.items || [];
      const resolved = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await getProduct(item.product_id);
            return { ...item, product };
          } catch {
            return item;
          }
        })
      );
      setItemsWithProducts(resolved);
    } catch (err) {
      console.error("Failed to fetch order", err);
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
    getStore()
      .then((data) => setStore(data))
      .catch((err) => console.error("Failed to load store metadata", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleDeliveryDone = async () => {
    setDeliveryConfirmed(true);
    // Refresh order to pick up delivery_photo_url and status change
    await fetchOrderData();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-brand-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <p className="text-brand-text mb-4">{error || "Order not found"}</p>
        <button onClick={onBack} className="text-brand-primary font-medium hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const shortId = order.id.slice(0, 8).toUpperCase();

  const isAwaitingQuote = order.status === "awaiting_quote";
  const isPreorder = order.is_preorder;

  const itemsSubtotal = itemsWithProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let currentIdx = 0;
  if (isPreorder) {
    const preorderStatuses = ["awaiting_quote", "pending", "paid", "shipped", "completed"];
    currentIdx = preorderStatuses.indexOf(order.status);
    if (currentIdx === -1) currentIdx = 0;
  } else {
    const statuses = ["pending", "paid", "shipped", "completed"];
    currentIdx = statuses.indexOf(order.status);
    if (currentIdx === -1) currentIdx = 0;
  }

  const getStatusString = () => {
    switch (order.status) {
      case "awaiting_quote": return "Awaiting Quote";
      case "pending": return "Waiting for Payment";
      case "paid": return "Order Processed";
      case "shipped": return "In Transit";
      case "completed": return "Delivered";
      default: return order.status;
    }
  };

  const showDeliverConfirm =
    order.status === "shipped" && !order.delivery_photo_url && !deliveryConfirmed;

  let paymentConfig = null;
  try {
    paymentConfig = store?.payment_config ? JSON.parse(store.payment_config) : null;
  } catch (e) {
    console.error("Failed to parse payment_config", e);
  }
  const bankAccounts = paymentConfig?.bankAccounts || [];
  const manualEnabled = !!paymentConfig?.manualEnabled;

  const handleCopy = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be smaller than 10 MB.");
      return;
    }
    setUploadError("");
    setEvidenceFile(file);
    setEvidencePreview(URL.createObjectURL(file));
  };

  const handleUploadPaymentEvidence = async () => {
    if (!evidenceFile) return;
    setUploadState("uploading");
    setUploadError("");
    try {
      await uploadPaymentEvidence(orderId, evidenceFile);
      setUploadState("done");
      setPaymentStage("done");
      // Refresh order to show evidence uploaded
      await fetchOrderData();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload. Please try again.");
      setUploadState("idle");
    }
  };

  const renderPaymentPortal = () => {
    if (!showPaymentPortal) return null;

    return createPortal(
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
        <div className="bg-white w-full max-w-md rounded-[6px] border border-brand-accent/25 overflow-hidden shadow-2xl animate-fade-in animate-duration-300 text-left p-6 relative">
          <button
            onClick={() => {
              setShowPaymentPortal(false);
              setPaymentStage("choose");
              setEvidenceFile(null);
              setEvidencePreview(null);
              setUploadError("");
            }}
            className="absolute top-4 right-4 text-brand-muted hover:text-brand-primary cursor-pointer transition p-1 hover:bg-brand-bg rounded-full"
          >
            <X size={16} />
          </button>

          {paymentStage === "choose" && (
            <div>
              <div className="flex items-center space-x-3 border-b border-brand-accent/10 pb-3 mb-6">
                <div className="p-2 bg-brand-bg rounded-full text-brand-accent">
                  <CreditCard size={16} />
                </div>
                <h3 className="font-sans text-xs font-bold text-brand-primary uppercase tracking-wider">
                  Complete Payment
                </h3>
              </div>

              <p className="text-brand-muted text-xs leading-relaxed font-sans mb-6">
                How would you like to pay for order <strong className="text-brand-primary">#{shortId}</strong>?
              </p>

              <div className="space-y-4">
                {order.payment_url && (
                  <button
                    onClick={() => {
                      if (order.payment_url) {
                        window.location.href = order.payment_url;
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 border border-brand-accent/25 rounded-[4px] hover:border-brand-primary hover:bg-brand-bg transition-all group cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent shrink-0">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="font-sans text-xs font-bold text-brand-primary">Automated Payment</p>
                        <p className="text-[10px] text-brand-muted font-sans mt-0.5">QRIS, E-wallet, Virtual Account</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-brand-muted group-hover:text-brand-primary transition-colors" />
                  </button>
                )}

                {manualEnabled && (
                  <button
                    onClick={() => setPaymentStage("manual")}
                    className="w-full flex items-center justify-between p-4 border border-brand-accent/25 rounded-[4px] hover:border-brand-primary hover:bg-brand-bg transition-all group cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent shrink-0">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="font-sans text-xs font-bold text-brand-primary">Manual Bank Transfer</p>
                        <p className="text-[10px] text-brand-muted font-sans mt-0.5">Transfer manually & upload receipt</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-brand-muted group-hover:text-brand-primary transition-colors" />
                  </button>
                )}

                {!order.payment_url && !manualEnabled && (
                  <p className="text-xs text-brand-muted italic text-center py-4">
                    No payment methods configured for this store.
                  </p>
                )}
              </div>
            </div>
          )}

          {paymentStage === "manual" && (
            <div>
              <div className="flex items-center space-x-3 border-b border-brand-accent/10 pb-3 mb-6">
                <button
                  onClick={() => setPaymentStage("choose")}
                  className="p-1 hover:bg-brand-bg rounded-full text-brand-muted hover:text-brand-primary transition cursor-pointer"
                >
                  <ArrowLeft size={16} />
                </button>
                <h3 className="font-sans text-xs font-bold text-brand-primary uppercase tracking-wider">
                  Manual Transfer Details
                </h3>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-brand-bg border border-brand-accent/15 rounded-[4px] mb-6">
                <Info size={16} className="text-brand-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-brand-primary font-sans leading-relaxed">
                    Total to pay: <strong className="font-bold text-brand-accent">{formatPrice(order.total_amount, currency)}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-1">
                <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Target Accounts</p>
                {bankAccounts.length > 0 ? (
                  bankAccounts.map((acc: { id: string; bankName: string; accountNumber: string; accountHolder: string }) => (
                    <div key={acc.id} className="bg-brand-bg p-3 rounded-[4px] border border-brand-accent/15 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">{acc.bankName}</p>
                        <p className="text-sm font-mono font-bold text-brand-primary tracking-wider my-0.5">{acc.accountNumber}</p>
                        <p className="text-[9px] text-brand-muted font-sans">a/n {acc.accountHolder}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(acc.accountNumber, acc.id)}
                        className="p-2 hover:bg-white border border-transparent hover:border-brand-accent/20 rounded-[4px] text-brand-accent transition cursor-pointer shrink-0"
                        title="Copy account number"
                      >
                        {copiedId === acc.id ? (
                          <span className="text-[9px] font-sans font-bold text-teal-600">Copied!</span>
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-muted italic">No bank accounts configured by seller.</p>
                )}
              </div>

              <div className="mb-6">
                <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-3">Upload Proof of Transfer</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`relative h-32 border-2 border-dashed rounded-[4px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all overflow-hidden
                    ${evidencePreview ? 'border-brand-accent bg-brand-bg' : 'border-brand-accent/25 hover:border-brand-accent/50 hover:bg-brand-bg'}`}
                >
                  {evidencePreview ? (
                    <img src={evidencePreview} alt="Receipt preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-muted">
                        <ImageIcon size={16} />
                      </div>
                      <p className="text-xs text-brand-primary font-sans font-bold">Tap to select photo</p>
                      <p className="text-[9px] text-brand-muted font-serif italic">JPEG or PNG up to 10MB</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleEvidenceFileChange} />
              </div>

              {uploadError && (
                <div className="flex items-center space-x-1.5 text-[11px] text-red-700 font-serif italic mb-4">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <button
                onClick={handleUploadPaymentEvidence}
                disabled={!evidenceFile || uploadState === "uploading"}
                className={`w-full py-3.5 rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
                  !evidenceFile || uploadState === "uploading"
                    ? "bg-brand-accent/25 text-brand-accent/60 cursor-not-allowed border border-brand-accent/15"
                    : "bg-brand-primary text-white hover:bg-brand-accent"
                }`}
              >
                {uploadState === "uploading" ? (
                  <><Loader2 size={12} className="animate-spin text-white" /><span>Uploading...</span></>
                ) : (
                  <><Upload size={12} /><span>Submit Proof of Payment</span></>
                )}
              </button>
            </div>
          )}

          {paymentStage === "done" && (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="flex justify-center">
                <div className="p-3 bg-brand-bg text-brand-accent rounded-full">
                  <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="font-sans text-base font-bold text-brand-primary">
                Payment Proof Submitted!
              </h2>
              <p className="text-brand-muted text-xs leading-relaxed font-sans max-w-xs mx-auto">
                Thank you. Your payment evidence has been uploaded. The store will verify your transfer and update your order status shortly.
              </p>
              <button
                onClick={() => {
                  setShowPaymentPortal(false);
                  setPaymentStage("choose");
                  setEvidenceFile(null);
                  setEvidencePreview(null);
                  setUploadError("");
                }}
                className="w-full py-3.5 bg-brand-bg border border-brand-accent/15 hover:bg-brand-bg/80 text-brand-primary rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Back to Order
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-brand-bg fade-in-up pb-20">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-10 flex-1">

        {/* Back navigation */}
        <button
          onClick={onBack}
          className="flex items-center text-brand-text/60 hover:text-brand-primary mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-brand-primary/10 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-brand-text mb-2">Order Tracking</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-brand-text/70">
                Order <span className="font-bold text-brand-primary">#{shortId}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-1 bg-white rounded-md text-xs text-brand-text/60 font-medium border border-brand-primary/10">
                {orderDate}
              </span>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white border border-brand-primary/10 rounded-xl overflow-hidden mb-8 shadow-sm">
          <div className="p-6 border-b border-brand-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-brand-primary/5 gap-4">
            <div>
              <h3 className="font-serif font-semibold text-brand-text text-lg mb-1">Current Status</h3>
              <p className="text-sm text-brand-text/70">
                {order.status === "awaiting_quote" && "We are calculating your total and shipping price. We'll notify you soon."}
                {order.status === "pending" && "Please complete your payment to proceed."}
                {order.status === "paid" && "Your order is being prepared for shipment."}
                {order.status === "shipped" && "Your package is currently traveling to the destination sorting center."}
                {order.status === "completed" && "Your package has been delivered successfully."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {order.status === "pending" && (
                <button
                  onClick={() => setShowPaymentPortal(true)}
                  className="px-4 py-2 bg-brand-primary text-white rounded-[4px] text-xs font-sans font-bold uppercase tracking-wider shadow-xs hover:bg-brand-accent transition cursor-pointer flex items-center gap-2"
                >
                  <CreditCard size={14} />
                  <span>Pay Now</span>
                </button>
              )}
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-primary/10 text-brand-text rounded-md text-sm font-semibold shadow-sm whitespace-nowrap">
                {order.status === "shipped" ? (
                  <Truck className="h-4 w-4" />
                ) : order.status === "awaiting_quote" ? (
                  <Clock className="h-4 w-4 text-brand-primary" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                {getStatusString()}
              </span>
            </div>
          </div>

          {/* Timeline steps */}
          <div className="p-8 pb-10 overflow-x-auto">
            {isPreorder ? (
              <div className="min-w-[600px] relative flex justify-between">
                <div className="absolute top-5 left-10 right-10 h-0.5 bg-brand-bg -z-10" />
                <div
                  className="absolute top-5 left-10 h-0.5 bg-brand-primary -z-10 transition-all duration-500"
                  style={{ width: `${(Math.min(currentIdx, 3) / 3) * 100}%` }}
                />
                {[
                  { label: "Quote Request", icon: <Package className="h-5 w-5" />, idx: 0 },
                  { label: "Quote Sent", icon: <Clock className="h-5 w-5" />, idx: 1 },
                  { label: "Payment", icon: <CreditCard className="h-5 w-5" />, idx: 2 },
                  { label: currentIdx >= 4 ? "Delivered" : "Shipped", icon: currentIdx >= 4 ? <Home className="h-5 w-5" /> : <Truck className="h-5 w-5" />, idx: 3 },
                ].map(({ label, icon, idx }) => (
                  <div key={idx} className={`flex flex-col items-center w-32 ${currentIdx >= idx ? "" : "opacity-40"}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${currentIdx >= idx ? "bg-brand-primary text-white shadow-sm" : "bg-brand-bg text-brand-text/40 border border-brand-primary/10"}`}>
                      {icon}
                    </div>
                    <h5 className={`text-sm font-bold ${currentIdx >= idx ? "text-brand-text" : "text-brand-text/40"}`}>{label}</h5>
                  </div>
                ))}
              </div>
            ) : (
              <div className="min-w-[600px] relative flex justify-between">
                <div className="absolute top-5 left-10 right-10 h-0.5 bg-brand-bg -z-10" />
                <div
                  className="absolute top-5 left-10 h-0.5 bg-brand-primary -z-10 transition-all duration-500"
                  style={{ width: `${(currentIdx / 3) * 100}%` }}
                />
                {[
                  { label: "Ordered", icon: <Package className="h-5 w-5" />, idx: 0 },
                  { label: "Paid", icon: <CreditCard className="h-5 w-5" />, idx: 1 },
                  { label: "Shipped", icon: <Truck className="h-5 w-5" />, idx: 2 },
                  { label: "Delivered", icon: <Home className="h-5 w-5" />, idx: 3 },
                ].map(({ label, icon, idx }) => (
                  <div key={idx} className={`flex flex-col items-center w-32 ${currentIdx >= idx ? "" : "opacity-40"}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${currentIdx >= idx ? "bg-brand-primary text-white shadow-sm" : "bg-brand-bg text-brand-text/40 border border-brand-primary/10"}`}>
                      {icon}
                    </div>
                    <h5 className={`text-sm font-bold ${currentIdx >= idx ? "text-brand-text" : "text-brand-text/40"}`}>{label}</h5>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">

          {/* Order Items */}
          <div className="flex-1 bg-white border border-brand-primary/10 rounded-xl overflow-hidden shadow-sm w-full">
            <div className="p-5 border-b border-brand-primary/10 flex items-center justify-between">
              <h3 className="font-serif font-semibold text-lg text-brand-text">Order Items</h3>
              <span className="text-xs font-medium text-brand-text/60">{itemsWithProducts.length} Items</span>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {itemsWithProducts.map((item, i) => (
                <div key={item.id || i}>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-brand-bg border border-brand-primary/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-brand-text/30" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <h4 className="text-sm font-semibold text-brand-text">{item.product?.name || "Unknown Product"}</h4>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center px-2 py-1 bg-brand-bg text-xs font-medium rounded text-brand-text/60 border border-brand-primary/10">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-bold text-brand-primary">{formatPrice(item.price, currency)}</span>
                      </div>
                    </div>
                  </div>
                  {i < itemsWithProducts.length - 1 && (
                    <div className="h-px bg-brand-primary/10 w-full mt-6" />
                  )}
                </div>
              ))}
            </div>

            {/* Price summary */}
            <div className="bg-brand-primary/5 p-6 border-t border-brand-primary/10">
              <div className="flex flex-col gap-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-brand-text/70">Subtotal</span>
                  <span className="text-brand-text font-medium">{formatPrice(itemsSubtotal, currency)}</span>
                </div>
                {!isAwaitingQuote && order.shipping_cost != null && order.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-brand-text/70">Shipping</span>
                    <span className="text-brand-text font-medium">{formatPrice(order.shipping_cost, currency)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-brand-primary/10">
                <span className="font-serif font-bold text-brand-text text-lg">Total</span>
                <span className="font-serif font-bold text-brand-primary text-xl">
                  {isAwaitingQuote ? "Calculating..." : formatPrice(order.total_amount, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">

            {/* Shipping Details */}
            <div className="bg-white border border-brand-primary/10 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-brand-primary/10 flex items-center gap-3">
                <Truck className="h-5 w-5 text-brand-primary" />
                <h3 className="font-serif font-semibold text-brand-text">Shipping Details</h3>
              </div>
              <div className="p-5">
                {order.status === "shipped" || order.status === "completed" ? (
                  order.tracking_link ? (
                    <div className="flex flex-col gap-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold w-fit">
                        Instant Courier
                      </span>
                      <a
                        href={order.tracking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Track My Order
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 text-sm">
                      {order.courier && (
                        <div className="flex justify-between">
                          <span className="text-brand-text/70">Courier</span>
                          <span className="font-semibold text-brand-text">{order.courier}</span>
                        </div>
                      )}
                      {order.tracking_number && (
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-brand-text/70">Tracking Number</span>
                          <span className="font-mono font-bold text-brand-primary text-base tracking-wider break-all">
                            {order.tracking_number}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <p className="text-sm text-brand-text/50 italic text-center py-2">
                    Will be updated once shipped
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Confirmation — only when in-transit and no photo yet */}
            {showDeliverConfirm && (
              <DeliverConfirm orderId={orderId} onDone={handleDeliveryDone} />
            )}

            {/* Payment evidence */}
            {order.payment_evidence_url && (
              <div className="rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-4 shadow-sm">
                <p className="text-xs font-semibold text-brand-primary mb-2 uppercase tracking-wide">
                  Payment Evidence
                </p>
                <img
                  src={order.payment_evidence_url}
                  alt="Payment evidence"
                  className="w-full rounded-lg object-cover max-h-48 shadow-sm"
                />
                <p className="text-[10px] text-brand-text/50 mt-2 text-center italic">
                  Waiting for seller verification
                </p>
              </div>
            )}

            {/* Delivery photo evidence */}
            {order.delivery_photo_url && (
              <div className="rounded-xl border border-teal-500/30 bg-teal-50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-teal-700 mb-2 uppercase tracking-wide">
                  Delivery Evidence
                </p>
                <img
                  src={order.delivery_photo_url}
                  alt="Delivery evidence"
                  className="w-full rounded-lg object-cover max-h-48 shadow-sm"
                />
              </div>
            )}

            {/* Delivery Address */}
            <div className="bg-white border border-brand-primary/10 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-brand-primary/10 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-brand-primary" />
                <h3 className="font-serif font-semibold text-brand-text">Delivery Address</h3>
              </div>
              <div className="p-5 text-sm text-brand-text">
                <p className="font-bold mb-1">{order.buyer_name || "—"}</p>
                {order.buyer_phone && (
                  <p className="text-brand-text/70 mb-3">{order.buyer_phone}</p>
                )}
                {order.buyer_address && (
                  <p className="text-brand-text/70 leading-relaxed whitespace-pre-wrap">
                    {order.buyer_address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderPaymentPortal()}
    </div>
  );
}
