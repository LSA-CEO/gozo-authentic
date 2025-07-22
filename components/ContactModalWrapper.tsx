'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { ContactModal } from './ContactModal';
import { ExperienceWithDetails } from '../types';

interface ContactModalWrapperProps {
  experience: ExperienceWithDetails;
  buttonText?: string;
  buttonClass?: string;
}

export function ContactModalWrapper({ 
  experience, 
  buttonText = "Contacter",
  buttonClass = "w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
}: ContactModalWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={buttonClass}
      >
        {buttonText}
      </button>
      
      <Modal isOpen={showModal}>
        <ContactModal
          experience={experience}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </>
  );
}
