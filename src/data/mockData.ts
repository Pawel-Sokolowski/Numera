import { ChatChannelOld, ChatMessage, Email, Invoice, User, CalendarEvent, EmailTemplate, Company } from '../types/client';

export const mockChatChannels: ChatChannelOld[] = [
  {
    id: '1',
    name: 'Zespół Projektowy',
    description: 'Główny kanał komunikacji zespołu',
    members: ['1', '2', '3'],
    isPrivate: false
  },
  {
    id: '2',
    name: 'Klienci VIP',
    description: 'Dyskusje o klientach premium',
    members: ['1', '2'],
    isPrivate: true
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    senderId: '1',
    senderName: 'Jan Kowalski',
    content: 'Witam wszystkich! Mamy nowy projekt do omówienia.',
    timestamp: '2024-12-09T10:30:00Z',
    type: 'text',
    channelId: '1'
  },
  {
    id: '2',
    senderId: '2',
    senderName: 'Anna Nowak',
    content: 'Świetnie! Kiedy możemy się spotkać?',
    timestamp: '2024-12-09T10:35:00Z',
    type: 'text',
    channelId: '1'
  },
  {
    id: '3',
    senderId: '1',
    senderName: 'Jan Kowalski',
    content: 'Klient premium wymaga szczególnej uwagi przy tym projekcie.',
    timestamp: '2024-12-09T11:00:00Z',
    type: 'text',
    channelId: '2'
  }
];

export const mockEmails: Email[] = [
  {
    id: '1',
    from: 'jan.kowalski@firma.pl',
    to: ['anna.nowak@creative.pl'],
    subject: 'Propozycja współpracy',
    content: 'Dzień dobry,\n\nChciałbym zaproponować współpracę przy nowym projekcie...',
    timestamp: '2024-12-09T09:00:00Z',
    isRead: true,
    clientId: '2',
    folder: 'sent',
    isStarred: false,
    isArchived: false,
    isDeleted: false
  },
  {
    id: '2',
    from: 'info@klient.pl',
    to: ['biuro@nasza-firma.pl'],
    subject: 'Zapytanie o wycenę',
    content: 'Dzień dobry,\n\nProszę o przesłanie wyceny na usługi...',
    timestamp: '2024-12-09T08:30:00Z',
    isRead: false,
    folder: 'inbox',
    isStarred: false,
    isArchived: false,
    isDeleted: false
  },
  {
    id: '3',
    from: 'piotr.wisniewski@startup.pl',
    to: ['zespol@nasza-firma.pl'],
    subject: 'Miesięczne sprawozdanie',
    content: 'Witam,\n\nPrzesyłam miesięczne sprawozdanie z postępów projektu...',
    timestamp: '2024-12-08T16:45:00Z',
    isRead: true,
    clientId: '3',
    folder: 'inbox',
    isStarred: true,
    isArchived: false,
    isDeleted: false
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'FV/2024/001',
    clientId: '1',
    issueDate: '2024-12-01',
    dueDate: '2024-12-15',
    items: [
      {
        id: '1',
        description: 'Usługi konsultacyjne',
        quantity: 10,
        unitPrice: 150.00,
        taxRate: 23,
        netAmount: 1500.00,
        taxAmount: 345.00,
        grossAmount: 1845.00
      }
    ],
    totalNet: 1500.00,
    totalTax: 345.00,
    totalGross: 1845.00,
    status: 'zaplacona',
    notes: 'Płatność przelewem'
  },
  {
    id: '2',
    number: 'FV/2024/002',
    clientId: '2',
    issueDate: '2024-12-05',
    dueDate: '2024-12-19',
    items: [
      {
        id: '2',
        description: 'Projekt graficzny logo',
        quantity: 1,
        unitPrice: 800.00,
        taxRate: 23,
        netAmount: 800.00,
        taxAmount: 184.00,
        grossAmount: 984.00
      }
    ],
    totalNet: 800.00,
    totalTax: 184.00,
    totalGross: 984.00,
    status: 'wyslana'
  },
  {
    id: '3',
    number: 'FV/2024/003',
    clientId: '3',
    issueDate: '2024-11-20',
    dueDate: '2024-12-04',
    items: [
      {
        id: '3',
        description: 'Obsługa księgowa listopad',
        quantity: 1,
        unitPrice: 500.00,
        taxRate: 23,
        netAmount: 500.00,
        taxAmount: 115.00,
        grossAmount: 615.00
      }
    ],
    totalNet: 500.00,
    totalTax: 115.00,
    totalGross: 615.00,
    status: 'przeterminowana'
  },
  {
    id: '4',
    number: 'FV/2024/004',
    clientId: '1',
    issueDate: '2024-11-25',
    dueDate: '2024-12-09',
    items: [
      {
        id: '4',
        description: 'Doradztwo podatkowe',
        quantity: 5,
        unitPrice: 200.00,
        taxRate: 23,
        netAmount: 1000.00,
        taxAmount: 230.00,
        grossAmount: 1230.00
      }
    ],
    totalNet: 1000.00,
    totalTax: 230.00,
    totalGross: 1230.00,
    status: 'przeterminowana'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'jan.kowalski@firma.pl',
    role: 'administrator',
    isActive: true,
    permissions: [],
    avatar: undefined
  },
  {
    id: '2',
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna.nowak@firma.pl',
    role: 'wlasciciel',
    isActive: true,
    permissions: [],
    avatar: undefined
  },
  {
    id: '3',
    firstName: 'Piotr',
    lastName: 'Wiśniewski',
    email: 'piotr.wisniewski@firma.pl',
    role: 'sekretariat',
    isActive: true,
    permissions: [],
    avatar: undefined
  },
  {
    id: '4',
    firstName: 'Maria',
    lastName: 'Kowalczyk',
    email: 'maria.kowalczyk@firma.pl',
    role: 'ksiegowa',
    isActive: true,
    permissions: [],
    avatar: undefined
  },
  {
    id: '5',
    firstName: 'Tomasz',
    lastName: 'Lewandowski',
    email: 'tomasz.lewandowski@firma.pl',
    role: 'kadrowa',
    isActive: true,
    permissions: [],
    avatar: undefined
  },
  {
    id: '6',
    firstName: 'Katarzyna',
    lastName: 'Zielińska',
    email: 'katarzyna.zielinska@firma.pl',
    role: 'zarzadzanie_biurem',
    isActive: true,
    permissions: [],
    avatar: undefined
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Spotkanie z klientem - Tech Solutions',
    description: 'Omówienie nowego projektu',
    startDate: '2024-12-10T10:00:00Z',
    endDate: '2024-12-10T11:30:00Z',
    isAllDay: false,
    category: 'spotkanie',
    attendees: ['1', '2'],
    clientId: '1',
    createdBy: '2',
    location: 'Sala konferencyjna A'
  },
  {
    id: '2',
    title: 'Termin składania deklaracji VAT',
    description: 'Przypomnienie o terminie składania VAT-7',
    startDate: '2024-12-25T00:00:00Z',
    endDate: '2024-12-25T23:59:59Z',
    isAllDay: true,
    category: 'termin',
    attendees: ['3'],
    createdBy: '3'
  },
  {
    id: '3',
    title: 'Szkolenie zespołu księgowego',
    startDate: '2024-12-15T09:00:00Z',
    endDate: '2024-12-15T17:00:00Z',
    isAllDay: false,
    category: 'inne',
    attendees: ['1', '3'],
    createdBy: '1'
  }
];

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Powitanie nowego klienta - Sp. z o.o.',
    subject: 'Witamy w naszej kancelarii - dokumenty do podpisania',
    content: 'Szanowni Państwo,\n\nZ przyjemnością informujemy, że rozpoczynamy obsługę księgową Państwa spółki z ograniczoną odpowiedzialnością.\n\nW załączeniu przesyłamy:\n- Umowę o świadczenie usług księgowych\n- Upoważnienie do reprezentowania przed US\n- Ankietę klienta\n\nProsimy o podpisanie dokumentów i przesłanie z powrotem.\n\nZ poważaniem,\nZespół Księgowy',
    businessTypes: ['sp_zoo'],
    isActive: true
  },
  {
    id: '2',
    name: 'Przypomnienie o terminach - JDG',
    subject: 'Przypomnienie o zbliżających się terminach podatkowych',
    content: 'Szanowny Kliencie,\n\nPrzypominamy o zbliżających się terminach:\n- PIT-36 do 31 stycznia\n- Deklaracja VAT do 25 dnia miesiąca\n- Składki ZUS do 20 dnia miesiąca\n\nW razie pytań jesteśmy do dyspozycji.\n\nZ poważaniem,\nZespół Księgowy',
    businessTypes: ['jednoosobowa'],
    isActive: true
  },
  {
    id: '3',
    name: 'Informacja o KSeF',
    subject: 'Obowiązkowe e-faktury - przygotowanie do KSeF',
    content: 'Szanowni Państwo,\n\nInformujemy o zbliżającym się obowiązku wystawiania faktur elektronicznych w systemie KSeF.\n\nPotrzebne będzie:\n- Profil Zaufany lub e-Dowód\n- Aktywacja konta w systemie KSeF\n- Integracja z systemem księgowym\n\nChętnie pomożemy w całym procesie.\n\nZ poważaniem,\nZespół Księgowy',
    businessTypes: ['sp_zoo', 'komandytowa', 'akcyjna'],
    isActive: true
  }
];

export const mockCompany: Company = {
  id: '1',
  name: 'Biuro Rachunkowe ABC',
  nip: '1234567890',
  address: {
    street: 'ul. Księgowa 123',
    city: 'Warszawa',
    zipCode: '00-001',
    country: 'Polska'
  },
  totalEmployees: 12,
  departments: [
    { id: '1', name: 'Księgowość', managerId: '3', employeeCount: 4 },
    { id: '2', name: 'Sekretariat', managerId: '2', employeeCount: 2 },
    { id: '3', name: 'Kadry', managerId: '4', employeeCount: 2 },
    { id: '4', name: 'Zarząd', managerId: '1', employeeCount: 4 }
  ],
  settings: {
    workingHours: {
      start: '08:00',
      end: '16:00',
      days: [1, 2, 3, 4, 5] // poniedziałek-piątek
    },
    timezone: 'Europe/Warsaw',
    defaultEmailTemplate: '1',
    ksefIntegration: {
      enabled: true,
      endpoint: 'https://ksef.mf.gov.pl',
      token: 'ksef_api_token_example'
    }
  }
};