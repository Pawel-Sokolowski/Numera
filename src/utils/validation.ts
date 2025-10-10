// Email validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmailDomain(email: string): boolean {
  const domain = email.split('@')[1];
  // Basic domain validation
  return domain && domain.includes('.') && domain.length > 3;
}

export function getEmailDomainType(email: string): 'business' | 'personal' | 'government' | 'unknown' {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return 'unknown';

  // Business domains
  const businessDomains = ['company.com', 'corp.com', 'business.pl', 'firma.pl'];
  if (businessDomains.some(bd => domain.includes(bd))) return 'business';

  // Government domains
  const govDomains = ['.gov.pl', '.gov', '.pl'];
  if (govDomains.some(gd => domain.endsWith(gd))) return 'government';

  // Personal domains
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'o2.pl', 'wp.pl'];
  if (personalDomains.some(pd => domain.includes(pd))) return 'personal';

  return 'unknown';
}

// Date utilities for ZUS calculations
export function calculateZusEndDate(startDate: string, duration: number = 12): string {
  if (!startDate) return '';
  
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return '';
  
  const end = new Date(start);
  end.setMonth(end.getMonth() + duration);
  
  if (isNaN(end.getTime())) return '';
  
  return end.toISOString().split('T')[0];
}

export function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate).toLocaleDateString('pl-PL');
  const end = new Date(endDate).toLocaleDateString('pl-PL');
  return `${start} - ${end}`;
}

// Email folder generation for different business types
export function generateEmailFolders(data: {
  company?: string;
  firstName?: string;
  lastName?: string;
  businessType?: string;
  nip?: string;
}): string[] {
  const { company, firstName, lastName, businessType, nip } = data;
  const folders: string[] = [];
  
  // Main folder based on company name or person name
  if (company) {
    const cleanName = company
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    
    // Add business type suffix
    let suffix = '';
    switch (businessType) {
      case 'spZoo':
        suffix = '_sp_z_o_o';
        break;
      case 'komandytowa':
        suffix = '_sp_k';
        break;
      case 'akcyjna':
        suffix = '_sa';
        break;
      case 'fundacja':
        suffix = '_fundacja';
        break;
      case 'stowarzyszenie':
        suffix = '_stowarzyszenie';
        break;
      default:
        suffix = '';
    }
    
    folders.push(cleanName + suffix);
    
    // Add subfolders
    folders.push(`${cleanName + suffix}/faktury`);
    folders.push(`${cleanName + suffix}/dokumenty`);
    folders.push(`${cleanName + suffix}/korespondencja`);
  } else if (firstName && lastName) {
    const cleanName = `${firstName}_${lastName}`.toLowerCase();
    folders.push(cleanName);
    folders.push(`${cleanName}/faktury`);
    folders.push(`${cleanName}/dokumenty`);
  }
  
  // Add NIP-based folder if available
  if (nip) {
    folders.push(`nip_${nip}`);
  }
  
  return folders;
}

// Additional utility functions that might be needed
export function formatPhoneNumber(phone: string): string {
  // Simple Polish phone number formatting
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+48 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('48')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

export function validateNIP(nip: string): boolean {
  const cleaned = nip.replace(/[-\s]/g, '');
  if (cleaned.length !== 10) return false;
  
  // NIP validation algorithm
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }
  
  const checksum = sum % 11;
  return checksum === parseInt(cleaned[9]);
}

export function validateREGON(regon: string): boolean {
  const cleaned = regon.replace(/[-\s]/g, '');
  return cleaned.length === 9 || cleaned.length === 14;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
}