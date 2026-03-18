// components/ConfirmModal.jsx
import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { AlertTriangle, Trash2 } from "lucide-react";

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  icon = null
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onHide();
  };

  const IconComponent = icon || (variant === "danger" ? Trash2 : AlertTriangle);

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title className="d-flex align-items-center gap-2">
          <IconComponent 
            size={24} 
            className={variant === "danger" ? "text-danger" : "text-warning"} 
          />
          {title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <p className="mb-0">{message}</p>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button 
          variant={variant} 
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;