/**
 * Tax Form Service - Usage Examples
 * 
 * This file demonstrates how to use the TaxFormService for filling tax forms.
 * These are example patterns - not executable tests.
 */

import { TaxFormService } from './taxFormService';
import { AuthorizationFormGenerator } from './authorizationFormGenerator';

// ============================================================================
// Example 1: Using TaxFormService directly
// ============================================================================

export async function exampleDirectUsage() {
  const taxFormService = new TaxFormService();

  // Prepare form data
  const formData = {
    taxpayerName: 'Jan Kowalski',
    taxpayerId: '12345678901',
    taxpayerNIP: '1234567890',
    taxpayerAddress: 'ul. Przykładowa 1',
    taxpayerCity: 'Warszawa',
    taxpayerPostalCode: '00-001',
    taxOffice: 'US Warszawa Śródmieście',
    
    // Income fields
    employmentIncome: 60000,
    civilContractIncome: 15000,
    
    // Deduction fields
    numberOfChildren: 2,
    childDeduction: 1112.04, // Standard Polish child deduction
    
    // Tax paid
    taxPaid: 8500
  };

  // Generate filled PDF
  const pdfBlob = await taxFormService.fillFormAsBlob('PIT-37', '2023', formData);

  // Download the PDF
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'PIT-37_2023_Jan_Kowalski.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Example 2: Using AuthorizationFormGenerator (Recommended)
// ============================================================================

export async function exampleWithGenerator() {
  const generator = new AuthorizationFormGenerator();

  const formData = {
    client: {
      id: '1',
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '+48 123 456 789',
      pesel: '12345678901',
      nip: '1234567890',
      address: 'ul. Przykładowa 1',
      city: 'Warszawa',
      postalCode: '00-001',
      accountNumber: '',
      status: 'active' as const,
      companyName: '',
      regon: ''
    },
    employee: {
      id: '1',
      username: 'accountant',
      password: '',
      role: 'accountant' as const,
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      phone: '+48 987 654 321',
      address: 'ul. Księgowa 5',
      city: 'Warszawa',
      permissions: []
    },
    formType: 'PIT-37' as const,
    additionalData: {
      year: '2023',
      taxOffice: 'US Warszawa Śródmieście',
      employmentIncome: 60000,
      civilContractIncome: 15000,
      numberOfChildren: 2,
      childDeduction: 1112.04,
      taxPaid: 8500
    }
  };

  // Generate and download automatically
  await generator.downloadForm(formData);
}

// ============================================================================
// Example 3: Multiple children with different scenarios
// ============================================================================

export async function exampleMultipleChildren() {
  const taxFormService = new TaxFormService();

  // Scenario 1: Two children (standard)
  const scenario1 = {
    taxpayerName: 'Maria Wiśniewska',
    taxpayerId: '98765432109',
    taxpayerNIP: '9876543210',
    employmentIncome: 80000,
    civilContractIncome: 5000,
    numberOfChildren: 2,
    childDeduction: 1112.04,
    taxPaid: 12000
  };

  // Scenario 2: Three children (higher deduction)
  const scenario2 = {
    taxpayerName: 'Piotr Nowak',
    taxpayerId: '11223344556',
    taxpayerNIP: '1122334455',
    employmentIncome: 100000,
    civilContractIncome: 0,
    numberOfChildren: 3,
    childDeduction: 1112.04,
    taxPaid: 15000
  };

  // Generate both forms
  const pdf1 = await taxFormService.fillFormAsBlob('PIT-37', '2023', scenario1);
  const pdf2 = await taxFormService.fillFormAsBlob('PIT-37', '2023', scenario2);

  console.log('Generated forms for two different scenarios');
}

// ============================================================================
// Example 4: Loading and inspecting mappings
// ============================================================================

export async function exampleInspectMappings() {
  const taxFormService = new TaxFormService();

  // Load PIT-37 mappings
  const pit37Mappings = await taxFormService.loadMappings('PIT-37', '2023');
  
  console.log('PIT-37 Fields:', Object.keys(pit37Mappings.fields));
  console.log('PIT-37 Calculations:', pit37Mappings.calculations);

  // Load UPL-1 mappings
  const upl1Mappings = await taxFormService.loadMappings('UPL-1', '2023');
  
  console.log('UPL-1 Fields:', Object.keys(upl1Mappings.fields));
  console.log('UPL-1 Calculations:', upl1Mappings.calculations);
}

// ============================================================================
// Example 5: Error handling
// ============================================================================

export async function exampleErrorHandling() {
  const taxFormService = new TaxFormService();

  try {
    // Attempt to load non-existent form
    await taxFormService.fillFormAsBlob('INVALID-FORM', '2023', {});
  } catch (error) {
    console.error('Error loading form:', error);
    // Handle error: notify user, log, fallback to jsPDF, etc.
  }

  try {
    // Attempt to load non-existent year
    await taxFormService.fillFormAsBlob('PIT-37', '1999', {});
  } catch (error) {
    console.error('Error loading year:', error);
    // Handle error appropriately
  }
}

// ============================================================================
// Example 6: Form data validation before submission
// ============================================================================

export async function exampleDataValidation() {
  const taxFormService = new TaxFormService();

  // Load mappings to validate against
  const mappings = await taxFormService.loadMappings('PIT-37', '2023');
  
  const formData = {
    taxpayerName: 'Jan Kowalski',
    employmentIncome: 60000
    // Missing other required fields
  };

  // Validate that all required fields are present
  const requiredFields = ['taxpayerName', 'taxpayerId', 'taxpayerNIP'];
  const missingFields = requiredFields.filter(field => !formData[field]);

  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // If validation passes, generate form
  const pdf = await taxFormService.fillFormAsBlob('PIT-37', '2023', formData);
}

// ============================================================================
// Example 7: Batch form generation
// ============================================================================

export async function exampleBatchGeneration() {
  const taxFormService = new TaxFormService();

  const clients = [
    { name: 'Jan Kowalski', income: 60000, children: 2 },
    { name: 'Maria Nowak', income: 75000, children: 1 },
    { name: 'Piotr Wiśniewski', income: 90000, children: 3 }
  ];

  const pdfs = await Promise.all(
    clients.map(client => 
      taxFormService.fillFormAsBlob('PIT-37', '2023', {
        taxpayerName: client.name,
        taxpayerId: '00000000000', // Would be real PESEL
        employmentIncome: client.income,
        civilContractIncome: 0,
        numberOfChildren: client.children,
        childDeduction: 1112.04,
        taxPaid: client.income * 0.15 // Estimated
      })
    )
  );

  console.log(`Generated ${pdfs.length} forms`);
}

// ============================================================================
// Example 8: Different years/versions
// ============================================================================

export async function exampleDifferentYears() {
  const taxFormService = new TaxFormService();

  const formData = {
    taxpayerName: 'Jan Kowalski',
    taxpayerId: '12345678901',
    employmentIncome: 60000
    // ... other fields
  };

  // Generate for 2023
  const pdf2023 = await taxFormService.fillFormAsBlob('PIT-37', '2023', formData);

  // Generate for 2022 (if template and mappings exist)
  try {
    const pdf2022 = await taxFormService.fillFormAsBlob('PIT-37', '2022', formData);
    console.log('Generated forms for both years');
  } catch (error) {
    console.log('2022 template not available');
  }
}

// ============================================================================
// Example 9: Integration with UI components
// ============================================================================

export function exampleUIIntegration() {
  // This would be used in a React component
  const handleGeneratePIT37 = async (clientData: any, incomeData: any) => {
    const generator = new AuthorizationFormGenerator();

    try {
      await generator.downloadForm({
        client: clientData,
        employee: getCurrentEmployee(),
        formType: 'PIT-37',
        additionalData: {
          year: new Date().getFullYear().toString(),
          ...incomeData
        }
      });

      // Show success message
      console.log('Form generated successfully');
    } catch (error) {
      // Show error message to user
      console.error('Failed to generate form:', error);
    }
  };

  return handleGeneratePIT37;
}

// Helper function (mock)
function getCurrentEmployee() {
  return {
    id: '1',
    username: 'accountant',
    password: '',
    role: 'accountant' as const,
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna.nowak@example.com',
    phone: '+48 987 654 321',
    address: 'ul. Księgowa 5',
    city: 'Warszawa',
    permissions: []
  };
}

// ============================================================================
// Notes and Best Practices
// ============================================================================

/**
 * BEST PRACTICES:
 * 
 * 1. Always validate input data before calling fillFormAsBlob()
 * 2. Use try-catch for error handling
 * 3. Provide year explicitly for production use
 * 4. Cache TaxFormService instance when generating multiple forms
 * 5. Clean up object URLs after use (URL.revokeObjectURL)
 * 6. Test with edge cases (missing data, special characters, etc.)
 * 7. Use AuthorizationFormGenerator for consistency with existing code
 * 
 * CALCULATIONS:
 * 
 * - Child deduction: 1112.04 PLN per child (as of 2023)
 * - Tax rate: Simplified 17% used (actual rates may vary)
 * - Always verify calculations match Polish tax law
 * 
 * TEMPLATE REQUIREMENTS:
 * 
 * - PDF template must exist in assets/pdf-templates/
 * - mapping.json must be present and valid
 * - Coordinates must be accurate for proper text placement
 */
