import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "../../lib/supabase";
import { X, Upload, Loader, Plus } from "lucide-react";
import { cn } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";

export default function ProductForm({ onSuccess, initialData = null }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    brand: initialData?.brand || "",
    price: initialData?.price || "",
    category: initialData?.category || "smartphones",
    stock: initialData?.stock || "",
    features: initialData?.features || { colors: [], storage: [], specs: {} },
    images: initialData?.images || [],
  });

  const [newColor, setNewColor] = useState("");
  const [newStorage, setNewStorage] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        brand: initialData.brand || "",
        price: initialData.price || "",
        category: initialData.category || "smartphones",
        stock: initialData.stock || "",
        features: initialData.features || {
          colors: [],
          storage: [],
          specs: {},
        },
        images: initialData.images || [],
      });
    }
  }, [initialData]);

  const addColor = () => {
    if (newColor && !formData.features.colors.includes(newColor)) {
      setFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          colors: [...prev.features.colors, newColor.trim()],
        },
      }));
      setNewColor("");
    }
  };

  const addStorage = () => {
    if (newStorage && !formData.features.storage.includes(newStorage)) {
      setFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          storage: [...prev.features.storage, newStorage.trim()],
        },
      }));
      setNewStorage("");
    }
  };

  const addSpec = () => {
    if (newSpecKey && newSpecValue) {
      setFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          specs: {
            ...prev.features.specs,
            [newSpecKey.trim()]: newSpecValue.trim(),
          },
        },
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpec = (key) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.features.specs };
      delete newSpecs[key];
      return {
        ...prev,
        features: {
          ...prev.features,
          specs: newSpecs,
        },
      };
    });
  };

  const removeFeature = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [type]: prev.features[type].filter((item) => item !== value),
      },
    }));
  };

  // Cloudinary Config
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        toastError("Cloudinary configuration missing.");
        return;
      }

      setUploading(true);
      const uploadedUrls = [];

      try {
        for (const file of acceptedFiles) {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", UPLOAD_PRESET);
          data.append("folder", "pristine-products");

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: data,
            },
          );

          const fileData = await res.json();
          if (fileData.secure_url) {
            uploadedUrls.push(fileData.secure_url);
          }
        }

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        toastSuccess("Images uploaded successfully");
      } catch (error) {
        console.error("Upload failed:", error);
        toastError("Image upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [CLOUD_NAME, UPLOAD_PRESET, toastError, toastSuccess],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toastError("Please upload at least one product image.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        images: formData.images,
        features: formData.features,
      };

      if (initialData?.id) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert([payload]);

        if (error) throw error;
      }

      if (onSuccess) onSuccess();
      if (!initialData) {
        // Only reset if creating new
        setFormData({
          name: "",
          description: "",
          brand: "",
          price: "",
          category: "smartphones",
          stock: "",
          features: { colors: [], storage: [], specs: {} },
          images: [],
        });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toastError("Error saving product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              required
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. iPhone 15 Pro Max"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              required
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Apple"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Price (₦)
            </label>
            <input
              type="number"
              required
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. 1500000"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="smartphones">Smartphones</option>
              <option value="tablets">Tablets</option>
              <option value="laptops">Laptops</option>
              <option value="watches">Watches</option>
              <option value="audio">Audio</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Stock Quantity
            </label>
            <input
              type="number"
              required
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. 5"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            required
            rows={4}
            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Detailed description of the product..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* Variants Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Product Variants</h3>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colors
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="e.g. #000000 or Black"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addColor())
                }
              />
              <button
                type="button"
                onClick={addColor}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.colors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-gray-200"
                    style={{
                      backgroundColor: color.startsWith("#")
                        ? color
                        : undefined,
                    }}
                  />
                  {color}
                  <button
                    type="button"
                    onClick={() => removeFeature("colors", color)}
                    className="hover:text-purple-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Storage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Storage Options
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newStorage}
                onChange={(e) => setNewStorage(e.target.value)}
                placeholder="e.g. 128GB"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addStorage())
                }
              />
              <button
                type="button"
                onClick={addStorage}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.storage.map((storage) => (
                <span
                  key={storage}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                >
                  {storage}
                  <button
                    type="button"
                    onClick={() => removeFeature("storage", storage)}
                    className="hover:text-purple-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Key Specs */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              Technical Specifications
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input
                type="text"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                placeholder="Spec Name (e.g. Battery)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 bg-white"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  placeholder="Value (e.g. 5000mAh)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 bg-white"
                />
                <button
                  type="button"
                  onClick={addSpec}
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-sm active:scale-95"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(formData.features.specs || {}).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:border-purple-200"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-400 uppercase text-[10px] truncate">
                        {key}
                      </span>
                      <span className="text-gray-900 font-medium truncate">
                        {value}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpec(key)}
                      className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ),
              )}
              {Object.keys(formData.features.specs || {}).length === 0 && (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400 text-sm italic">
                    No specifications added yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Product Images
          </label>

          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-primary-300",
            )}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-primary-600">
                <Loader className="animate-spin" />
                <p>Uploading to Cloudinary...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Upload size={24} />
                <p>Drag & drop images here, or click to select</p>
                <p className="text-xs text-gray-400">
                  (Images will be auto-optimized)
                </p>
              </div>
            )}
          </div>

          {/* Image Previews */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mt-4">
              {formData.images.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200"
                >
                  <img
                    src={url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader className="animate-spin" /> : <Plus size={20} />}
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
