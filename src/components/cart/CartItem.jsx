import React, { useEffect, useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/format";
import { toast } from "react-hot-toast";


export const CartItem = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const [quantityInput, setQuantityInput] = useState(item.quantity);

  useEffect(() => {
    setQuantityInput(item.quantity);
  }, [item.quantity]);

  const commitQuantity = (value) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      updateItemQuantity(item.id, 1);
      setQuantityInput(1);
      return;
    }

    updateItemQuantity(item.id, parsed);
    setQuantityInput(parsed);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setQuantityInput(value === "" ? "" : Number(value));
    }
  };

  const handleQuantityBlur = () => {
    if (quantityInput === "" || !Number.isInteger(Number(quantityInput)) || Number(quantityInput) < 1) {
      commitQuantity(1);
    } else {
      commitQuantity(quantityInput);
    }
  };

  const handleIncrease = () => {
    commitQuantity(Number(item.quantity) + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      commitQuantity(Number(item.quantity) - 1);
    } else {
      handleRemove();
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
    toast.success(`Removed ${item.name} from cart`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 gap-4">
      
      {/* Thumbnail + info */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-16 h-16 rounded-xl bg-gray-50/50 dark:bg-gray-950 p-1 border border-gray-100 dark:border-gray-800 flex-shrink-0 flex items-center justify-center">
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            onError={(e) => { e.target.src = '/placeholder.svg'; }}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div className="space-y-0.5 max-w-[200px]">
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            {item.name}
          </h4>
          <p className="text-xs text-blue-600 font-extrabold">
            {formatCurrency(item.price)}
          </p>
        </div>
      </div>

      {/* Incrementor Adjusted */}
      <div className="flex items-center justify-between sm:justify-start gap-6 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 dark:border-gray-850 pt-3 sm:pt-0">
        
        {/* Adjusted controls */}
        <div className="flex items-center border border-gray-250 dark:border-gray-750 bg-gray-55/70 dark:bg-gray-950 rounded-lg overflow-hidden h-9">
          <button
            onClick={handleDecrease}
            className="px-3 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 transition-colors"
          >
            <Minus size={12} />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantityInput}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            className="w-12 text-center text-xs font-bold text-gray-900 dark:text-white bg-transparent border-l border-r border-gray-200 dark:border-gray-800 outline-none"
          />
          <button
            onClick={handleIncrease}
            className="px-3 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Price sub-sum */}
        <span className="text-sm font-black text-gray-900 dark:text-gray-100 min-w-[70px] text-right">
          {formatCurrency(item.price * item.quantity)}
        </span>

        {/* Delete action */}
        <button
          onClick={handleRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
          title="Remove Item"
        >
          <Trash2 size={16} />
        </button>

      </div>

    </div>
  );
};

export default CartItem;
