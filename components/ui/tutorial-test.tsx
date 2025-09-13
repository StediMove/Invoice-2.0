import React, { useState } from 'react';
import { TutorialOverlay } from './tutorial-overlay';
import { Button } from '@/components/ui/button';

const testSteps = [
  {
    id: 'step1',
    title: 'Welcome to InvoiceAI',
    description: 'This is a guided tour to help you get familiar with the application features.',
    targetElementId: 'test-button-1',
    position: 'right'
  },
  {
    id: 'step2',
    title: 'Dashboard Overview',
    description: 'This is your main dashboard where you can see an overview of your invoices and revenue.',
    targetElementId: 'test-button-2',
    position: 'bottom'
  },
  {
    id: 'step3',
    title: 'Invoice Management',
    description: 'Create, view, and manage all your invoices in one place.',
    targetElementId: 'test-button-3',
    position: 'left'
  }
];

export const TutorialTest: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartTutorial = () => {
    setIsOpen(true);
  };

  const handleCloseTutorial = () => {
    setIsOpen(false);
  };

  const handleCompleteTutorial = () => {
    console.log('Tutorial completed!');
    setIsOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tutorial Test Page</h1>
      <p className="mb-4">Click the button below to start the tutorial:</p>
      
      <Button onClick={handleStartTutorial} className="mb-8">
        Start Tutorial
      </Button>
      
      <div className="flex gap-4">
        <Button id="test-button-1" variant="outline">
          Button 1
        </Button>
        <Button id="test-button-2" variant="outline">
          Button 2
        </Button>
        <Button id="test-button-3" variant="outline">
          Button 3
        </Button>
      </div>
      
      <TutorialOverlay
        steps={testSteps}
        isOpen={isOpen}
        onClose={handleCloseTutorial}
        onComplete={handleCompleteTutorial}
      />
    </div>
  );
};