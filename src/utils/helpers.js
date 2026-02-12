import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount).replace("NGN", "₦");
};

export const getOptimizedImageUrl = (url, type = "upload") => {
  if (!url || !url.includes("cloudinary.com")) return url;

  // Split the URL to inject transformations
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  // Define transformations based on usage
  const transformations = {
    card: "w_500,h_500,c_fill,q_auto,f_auto", // Square crop for cards
    detail: "w_800,q_auto,f_auto", // Larger for details
    upload: "w_1200,h_1200,c_limit,q_auto,f_auto", // Limit max size for storage/view
  };

  const transform = transformations[type] || transformations.upload;
  return `${parts[0]}/upload/${transform}/${parts[1]}`;
};
