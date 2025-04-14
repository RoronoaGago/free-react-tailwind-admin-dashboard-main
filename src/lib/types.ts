export type User = {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone_number: string;

}

export type ComponentCardProps = {
    title: string;
    children: React.ReactNode;
    placeholder?: string;
    className?: string; // Additional custom classes for styling
    desc?: string; // Description text
}
// Define the type for the form data
export type TransactionFormData = {
    firstName: string;
    lastName: string;
    address: string;
    contactNumber: string;
    regularClothesWeight: number;
    jeansWeight: number;
    linensWeight: number;
    comforterWeight: number;
    serviceType: string;
}

export type UserFormData = {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    date_of_birth: string; // Update the type to allow Date | null
    email: string;
    phone_number: string;
}

export type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export type Transaction = {
    order_id: string;
    customer_name: string;
    contact_number: string;
    regular_clothes: number;
    jeans: number;
    beddings: number;
    comforter: number;
    grand_total: number;
    status: "Ready for Pick Up" | "Finishing" | "Pending";
    date_created: string;
}
export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
    children: React.ReactNode; // Button text or content
    size?: "sm" | "md"; // Button size
    variant?: "primary" | "outline" | "error"; // Button variant
    loading?: boolean;
    startIcon?: React.ReactNode; // Icon before the text
    endIcon?: React.ReactNode; // Icon after the text
    dataModal?: string;
}