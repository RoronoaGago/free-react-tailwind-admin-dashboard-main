import { Transaction } from "./types";

export const options = [
  { value: "marketing", label: "Marketing" },
  { value: "template", label: "Template" },
  { value: "development", label: "Development" },
];
export const serviceTypeOptions = [
  { value: "regular", label: "Regular" },
  { value: "rush", label: "Rush" },

];

export const countries = [
  { code: "US", label: "+1" },
  { code: "GB", label: "+44" },
  { code: "CA", label: "+1" },
  { code: "AU", label: "+61" },
];

export const customerFrequency = [
  {
    "customerName": "David Lee",
    "frequency": 6,
    "totalSpend": 180.00,
    "averageSpend": 30.00
  },
  {
    "customerName": "John Doe",
    "frequency": 5,
    "totalSpend": 150.00,
    "averageSpend": 30.00
  },
  {
    "customerName": "Lisa Nguyen",
    "frequency": 5,
    "totalSpend": 150.00,
    "averageSpend": 30.00
  },
  {
    "customerName": "Bob Johnson",
    "frequency": 4,
    "totalSpend": 120.00,
    "averageSpend": 30.00
  },
  {
    "customerName": "Michael Brown",
    "frequency": 4,
    "totalSpend": 120.00,
    "averageSpend": 30.00
  },
  {
    "customerName": "Jane Smith",
    "frequency": 3,
    "totalSpend": 90.00,
    "averageSpend": 30.00
  },
  {
    "customerName": "Sarah Taylor",
    "frequency": 3,
    "totalSpend": 90.00,
    "averageSpend": 30.00
  },
  {
    "customerName": "Kevin White",
    "frequency": 2,
    "totalSpend": 60.00,
    "averageSpend": 30.00
  },
  {
    "customerName": "Maria Rodriguez",
    "frequency": 2,
    "totalSpend": 60.00,
    "averageSpend": 30.00
  },
  {
    "customerName": "Emily Chen",
    "frequency": 1,
    "totalSpend": 30.00,
    "averageSpend": 30.00
  }
]
export const ranges = [{ id: 1, name: 'Last 7 days' }, { id: 2, name: 'Last 14 days' }, { id: 3, name: 'Last 30 days' }, { id: 4, name: 'Last 90 days' }];
export const transactionsData: Transaction[] = [
  {
    order_id: "#001",
    customer_name: "john_doe",
    contact_number: "123-456-7890",
    regular_clothes: 5,
    jeans: 2,
    beddings: 3,
    comforter: 1,
    grand_total: 150.0,
    status: "Ready for Pick Up",
    date_created: "2025-04-01T10:00:00Z",
  },
  {
    order_id: "#002",
    customer_name: "jane_smith",
    contact_number: "987-654-3210",
    regular_clothes: 3,
    jeans: 1,
    beddings: 2,
    comforter: 0,
    grand_total: 100.0,
    status: "Ready for Pick Up",
    date_created: "2025-04-02T11:30:00Z",
  },
  {
    order_id: "#003",
    customer_name: "bob_johnson",
    contact_number: "555-123-4567",
    regular_clothes: 4,
    jeans: 2,
    beddings: 1,
    comforter: 1,
    grand_total: 120.0,
    status: "Finishing",
    date_created: "2025-04-03T14:15:00Z",
  },
  {
    order_id: "#004",
    customer_name: "maria_rodriguez",
    contact_number: "111-222-3333",
    regular_clothes: 2,
    jeans: 1,
    beddings: 1,
    comforter: 0,
    grand_total: 80.0,
    status: "Pending",
    date_created: "2025-04-04T09:45:00Z",
  },
  {
    order_id: "#005",
    customer_name: "david_lee",
    contact_number: "444-555-6666",
    regular_clothes: 6,
    jeans: 3,
    beddings: 2,
    comforter: 1,
    grand_total: 200.0,
    status: "Finishing",
    date_created: "2025-04-05T16:20:00Z",
  },
  {
    order_id: "#006",
    customer_name: "emily_chen",
    contact_number: "777-888-9999",
    regular_clothes: 1,
    jeans: 0,
    beddings: 1,
    comforter: 0,
    grand_total: 50.0,
    status: "Ready for Pick Up",
    date_created: "2025-04-06T08:10:00Z",
  },
  {
    order_id: "#007",
    customer_name: "kevin_white",
    contact_number: "333-444-5555",
    regular_clothes: 5,
    jeans: 2,
    beddings: 3,
    comforter: 1,
    grand_total: 180.0,
    status: "Pending",
    date_created: "2025-04-07T12:00:00Z",
  },
  {
    order_id: "#008",
    customer_name: "sophia_patel",
    contact_number: "222-333-4444",
    regular_clothes: 3,
    jeans: 1,
    beddings: 2,
    comforter: 0,
    grand_total: 110.0,
    status: "Finishing",
    date_created: "2025-04-08T15:30:00Z",
  },
  {
    order_id: "#009",
    customer_name: "michael_brown",
    contact_number: "666-777-8888",
    regular_clothes: 4,
    jeans: 2,
    beddings: 1,
    comforter: 1,
    grand_total: 140.0,
    status: "Ready for Pick Up",
    date_created: "2025-04-09T10:50:00Z",
  },
  {
    order_id: "#010",
    customer_name: "olivia_taylor",
    contact_number: "999-000-1111",
    regular_clothes: 2,
    jeans: 1,
    beddings: 1,
    comforter: 0,
    grand_total: 90.0,
    status: "Pending",
    date_created: "2025-04-09T13:40:00Z",
  },
];