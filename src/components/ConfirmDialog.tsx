import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <FaExclamationTriangle className="text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
              </div>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <p className="text-gray-300 mb-6">{message}</p>

            <div className="flex space-x-3">
              <motion.button
                type="button"
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative z-10 flex-1 px-4 py-2 bg-transparent text-primary-500/80 font-bold border-2 border-primary-500/50 rounded-lg hover:bg-primary-500/10 hover:text-primary-500 hover:border-primary-500/70 transition-all cursor-pointer select-none"
                style={{ userSelect: "none" }}
              >
                <span className="pointer-events-none">{cancelLabel}</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative z-10 flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none"
                style={{ userSelect: "none" }}
              >
                <span className="pointer-events-none">
                  {isLoading ? "Working..." : confirmLabel}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
