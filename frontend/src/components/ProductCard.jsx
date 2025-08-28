// import { ShoppingCart } from "lucide-react";

// export default function ProductCard({ product, onAddToCart }) {
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
//       {/* Product Image */}
//       <div className="relative w-full h-48">
//         <img
//           src={product.image}
//           alt={product.name}
//           className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
//         />
//         <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
//           {product.category}
//         </span>
//       </div>

//       {/* Product Info */}
//       <div className="p-4 flex flex-col justify-between h-40">
//         <div>
//           <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
//             {product.name}
//           </h3>
//           <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
//             {product.description}
//           </p>
//         </div>

//         {/* Price + Add Button */}
//         <div className="flex items-center justify-between mt-3">
//           <span className="text-xl font-bold text-green-600 dark:text-green-400">
//             ${product.price}
//           </span>
//           <button
//             onClick={() => onAddToCart(product)}
//             className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
//           >
//             <ShoppingCart size={18} />
//             <span>Add</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
