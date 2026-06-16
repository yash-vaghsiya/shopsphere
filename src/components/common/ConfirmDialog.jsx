import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";


export const ConfirmDialog = ({
  isOpen,
  title = "Are you sure?",
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="flex flex-col">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3.5">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
