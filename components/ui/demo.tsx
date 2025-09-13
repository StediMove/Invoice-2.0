import { AI_Prompt } from "@/components/ui/animated-ai-input"
import { useState } from "react"
import JobCard from "@/components/ui/job-card";

export default function DemoOne() {
  return <JobCard />;
}

const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    company_name: 'TechCorp',
    email: 'john@techcorp.com',
    address: '123 Tech Street',
    city: 'San Francisco',
    country: 'USA',
    postal_code: '94105',
    preferred_currency: 'USD',
    default_tax_rate: 8.5,
    payment_terms: 30
  },
  {
    id: '2',
    name: 'Jane Smith',
    company_name: 'Design Studio',
    email: 'jane@designstudio.com',
    address: '456 Creative Ave',
    city: 'New York',
    country: 'USA',
    postal_code: '10001',
    preferred_currency: 'USD',
    default_tax_rate: 10.0,
    payment_terms: 15
  }
];

const mockTemplates = [
  {
    id: '1',
    name: 'Modern Template',
    description: 'Clean and professional design',
    template_data: { colorScheme: 'blue' }
  },
  {
    id: '2',
    name: 'Classic Template',
    description: 'Traditional business style',
    template_data: { colorScheme: 'gray' }
  }
];

export function AI_Prompt_Demo() {
    const [value, setValue] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleSubmit = () => {
        console.log('Submitted:', {
            value,
            selectedCustomer,
            selectedTemplate
        });
        // Handle AI generation here
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2">AI Invoice Generator Demo</h1>
                <p className="text-muted-foreground">
                    Select a customer and template, then describe your invoice in any language.
                </p>
            </div>
            
            <AI_Prompt
                value={value}
                onChange={setValue}
                onSubmit={handleSubmit}
                customers={mockCustomers}
                templates={mockTemplates}
                selectedCustomer={selectedCustomer}
                selectedTemplate={selectedTemplate}
                onCustomerChange={setSelectedCustomer}
                onTemplateChange={setSelectedTemplate}
                placeholder="Describe your invoice... e.g., 'Invoice for web design services, $2,500, 20% tax'"
            />
            
            {/* Display selected values */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Current Selection:</h3>
                <p><strong>Customer:</strong> {selectedCustomer ? (selectedCustomer.company_name || selectedCustomer.name) : 'None'}</p>
                <p><strong>Template:</strong> {selectedTemplate ? selectedTemplate.name : 'Default'}</p>
                <p><strong>Description:</strong> {value || 'Empty'}</p>
            </div>
        </div>
    );
}