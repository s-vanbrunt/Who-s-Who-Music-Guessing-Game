// src/components/Modal.js
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 3rem;
  border-radius: 5px;
  width: 240%;
  max-width: 1200px;
  position: relative;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ccc;
  border: 1px solid #000;
  border-radius: 5px;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 2px 5px;
`;

const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <ModalWrapper>
      <ModalContent>
        {children}
        <Link to="/">
          <button>New Game</button>
        </Link>
        <CloseButton type="button" onClick={onClose}>
          &times;
        </CloseButton>
      </ModalContent>
    </ModalWrapper>
  );
};

export default Modal;
