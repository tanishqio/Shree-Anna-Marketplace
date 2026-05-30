
export type FieldType = 'text' | 'number' | 'email' | 'tel' | 'select' | 'multiselect' | 'radio' | 'file';

export interface Option {
    label: string;
    value: string;
}

export interface Field {
    id: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: Option[];
    required?: boolean;
    dependsOn?: {
        field: string;
        value: string;
    };
}

export interface Step {
    id: string;
    title: string;
    description?: string;
    fields: Field[];
}

export interface RoleConfig {
    role: string;
    steps: Step[];
}

export const farmerRegistration: RoleConfig = {
    role: 'farmer',
    steps: [
        {
            id: 'identification',
            title: 'Basic Identification',
            description: 'Tell us who you are',
            fields: [
                { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
                { id: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: 'Enter 10-digit mobile number' },
                {
                    id: 'state',
                    label: 'State',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Karnataka', value: 'karnataka' },
                        { label: 'Maharashtra', value: 'maharashtra' },
                        { label: 'Rajasthan', value: 'rajasthan' },
                        // Add more as needed
                    ]
                },
                { id: 'district', label: 'District', type: 'select', required: true, options: [] }, // This would ideally be dynamic
                { id: 'village', label: 'Village / Block', type: 'text', required: true, placeholder: 'Enter village name' },
            ]
        },
        {
            id: 'farmDetails',
            title: 'Farm Details',
            description: 'About your land and crops',
            fields: [
                {
                    id: 'farmerType',
                    label: 'Type of Farmer',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Marginal', value: 'marginal' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' },
                    ]
                },
                {
                    id: 'landOwnership',
                    label: 'Land Ownership Type',
                    type: 'radio',
                    required: true,
                    options: [
                        { label: 'Own Land', value: 'own' },
                        { label: 'Leased Land', value: 'leased' },
                        { label: 'Both', value: 'both' },
                    ]
                },
                {
                    id: 'landArea',
                    label: 'Land Area Under Millets',
                    type: 'select',
                    required: true,
                    options: [
                        { label: '0–1 acre', value: '0-1' },
                        { label: '1–3 acre', value: '1-3' },
                        { label: '3–5 acre', value: '3-5' },
                        { label: '5+ acre', value: '5+' },
                    ]
                },
                {
                    id: 'milletsGrown',
                    label: 'Millets You Grow',
                    type: 'multiselect',
                    required: true,
                    options: [
                        { label: 'Ragi', value: 'ragi' },
                        { label: 'Jowar', value: 'jowar' },
                        { label: 'Bajra', value: 'bajra' },
                        { label: 'Foxtail millet', value: 'foxtail' },
                        { label: 'Little millet', value: 'little' },
                        { label: 'Barnyard millet', value: 'barnyard' },
                        { label: 'Kodo millet', value: 'kodo' },
                        { label: 'Browntop millet', value: 'browntop' },
                    ]
                }
            ]
        },
        {
            id: 'quality',
            title: 'Quality & Certification',
            fields: [
                {
                    id: 'hasCertification',
                    label: 'Do you have any quality certifications?',
                    type: 'radio',
                    required: true,
                    options: [
                        { label: 'Yes', value: 'yes' },
                        { label: 'No', value: 'no' },
                    ]
                },
                {
                    id: 'certificationType',
                    label: 'Select Certification Type',
                    type: 'select',
                    dependsOn: { field: 'hasCertification', value: 'yes' },
                    options: [
                        { label: 'Organic Certification', value: 'organic' },
                        { label: 'FSSAI (for processed)', value: 'fssai' },
                        { label: 'State Agriculture Certification', value: 'state' },
                        { label: 'Other', value: 'other' },
                    ]
                },
                {
                    id: 'certFile',
                    label: 'Upload Certificate',
                    type: 'file',
                    dependsOn: { field: 'hasCertification', value: 'yes' }
                }
            ]
        },
        {
            id: 'logistics',
            title: 'Logistics',
            fields: [
                {
                    id: 'needPickup',
                    label: 'Do you need pickup for produce?',
                    type: 'radio',
                    required: true,
                    options: [
                        { label: 'Yes', value: 'yes' },
                        { label: 'No', value: 'no' },
                    ]
                },
                {
                    id: 'nearestCenter',
                    label: 'Nearest Collection Center / Mandi',
                    type: 'select',
                    options: [
                        { label: 'Mandi A', value: 'mandi_a' }, // Placeholder
                        { label: 'Mandi B', value: 'mandi_b' },
                    ]
                }
            ]
        },
        {
            id: 'banking',
            title: 'Banking',
            description: 'For payments',
            fields: [
                {
                    id: 'paymentMethod',
                    label: 'Preferred Payment Method',
                    type: 'radio',
                    required: true,
                    options: [
                        { label: 'UPI', value: 'upi' },
                        { label: 'Bank Transfer', value: 'bank' },
                    ]
                },
                {
                    id: 'bankDetails',
                    label: 'Bank Account + IFSC',
                    type: 'text',
                    placeholder: 'Account Number - IFSC',
                    required: false
                }
            ]
        }
    ]
};

export const fpoRegistration: RoleConfig = {
    role: 'fpo',
    steps: [
        {
            id: 'orgDetails',
            title: 'Organization Details',
            fields: [
                { id: 'orgName', label: 'Name of FPO/SHG', type: 'text', required: true },
                {
                    id: 'regType',
                    label: 'Registration Type',
                    type: 'radio',
                    required: true,
                    options: [
                        { label: 'FPO', value: 'fpo' },
                        { label: 'SHG', value: 'shg' },
                        { label: 'Cooperative Society', value: 'coop' },
                    ]
                },
                { id: 'regNumber', label: 'Registration Number', type: 'text' },
                { id: 'state', label: 'State', type: 'select', options: [{ label: 'Karnataka', value: 'karnataka' }] },
                { id: 'district', label: 'District', type: 'select', options: [] },
                { id: 'village', label: 'Village / Block', type: 'text' },
            ]
        },
        {
            id: 'membership',
            title: 'Membership',
            fields: [
                {
                    id: 'memberCount',
                    label: 'Number of Farmer Members',
                    type: 'select',
                    required: true,
                    options: [
                        { label: '1–50', value: '1-50' },
                        { label: '50–100', value: '50-100' },
                        { label: '100–300', value: '100-300' },
                        { label: '300+', value: '300+' },
                    ]
                }
            ]
        },
        {
            id: 'production',
            title: 'Production Details',
            fields: [
                {
                    id: 'crops',
                    label: 'Primary Millet Crops Produced',
                    type: 'multiselect',
                    options: [
                        { label: 'Ragi', value: 'ragi' },
                        { label: 'Jowar', value: 'jowar' },
                        { label: 'Bajra', value: 'bajra' },
                    ]
                },
                { id: 'annualOutput', label: 'Average Annual Output (tonnes)', type: 'number' }
            ]
        },
        {
            id: 'storage',
            title: 'Storage & Processing',
            fields: [
                {
                    id: 'hasStorage',
                    label: 'Do you have any storage facilities?',
                    type: 'radio',
                    options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]
                },
                {
                    id: 'processing',
                    label: 'Do you do primary processing?',
                    type: 'multiselect',
                    options: [
                        { label: 'Cleaning', value: 'cleaning' },
                        { label: 'Grading', value: 'grading' },
                        { label: 'Hulling', value: 'hulling' },
                        { label: 'Packaging', value: 'packaging' },
                        { label: 'None', value: 'none' },
                    ]
                }
            ]
        },
        {
            id: 'certifications',
            title: 'Certifications',
            fields: [
                {
                    id: 'certs',
                    label: 'FPO/SHG Certifications',
                    type: 'multiselect',
                    options: [
                        { label: 'SFAC', value: 'sfac' },
                        { label: 'NABARD', value: 'nabard' },
                        { label: 'Organic', value: 'organic' },
                        { label: 'Others', value: 'others' },
                    ]
                }
            ]
        },
        {
            id: 'logisticsBank',
            title: 'Logistics & Bank',
            fields: [
                {
                    id: 'needLogistics',
                    label: 'Need logistic partner?',
                    type: 'radio',
                    options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]
                },
                { id: 'bankDetails', label: 'Banking details (UPI/Account)', type: 'text' }
            ]
        }
    ]
};

export const processorRegistration: RoleConfig = {
    role: 'processor',
    steps: [
        {
            id: 'companyDetails',
            title: 'Company Details',
            fields: [
                { id: 'companyName', label: 'Processor / Company Name', type: 'text', required: true },
                {
                    id: 'unitType',
                    label: 'Type of Processing Unit',
                    type: 'select',
                    options: [
                        { label: 'Micro Unit', value: 'micro' },
                        { label: 'Small Unit', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' },
                    ]
                },
                { id: 'fssai', label: 'FSSAI License Number', type: 'text', required: true },
                { id: 'gst', label: 'GST Number', type: 'text' },
                { id: 'location', label: 'Location (State, District, City)', type: 'text' },
            ]
        },
        {
            id: 'capabilities',
            title: 'Processing Capabilities',
            fields: [
                {
                    id: 'products',
                    label: 'What Millet Products Do You Produce?',
                    type: 'multiselect',
                    options: [
                        { label: 'Flour', value: 'flour' },
                        { label: 'Ready-to-cook mixes', value: 'rtc' },
                        { label: 'Snacks', value: 'snacks' },
                        { label: 'Biscuits/Cookies', value: 'biscuits' },
                        { label: 'Ready-to-eat products', value: 'rte' },
                        { label: 'Malted drink powders', value: 'malt' },
                        { label: 'Other', value: 'other' },
                    ]
                },
                {
                    id: 'capacity',
                    label: 'Daily/Monthly Production Capacity',
                    type: 'select',
                    options: [
                        { label: '< 100 kg/day', value: 'lt100' },
                        { label: '100–500 kg/day', value: '100-500' },
                        { label: '500–1000 kg/day', value: '500-1000' },
                        { label: '1 tonne/day+', value: '1t+' },
                    ]
                }
            ]
        },
        {
            id: 'procurement',
            title: 'Procurement Preferences',
            fields: [
                {
                    id: 'directBuy',
                    label: 'Do you buy directly from farmers/FPOs?',
                    type: 'radio',
                    options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]
                },
                {
                    id: 'preferredMillet',
                    label: 'Preferred Millet Type for Procurement',
                    type: 'multiselect',
                    options: [
                        { label: 'Ragi', value: 'ragi' },
                        { label: 'Jowar', value: 'jowar' },
                        { label: 'Bajra', value: 'bajra' },
                    ]
                }
            ]
        },
        {
            id: 'certifications',
            title: 'Certifications',
            fields: [
                {
                    id: 'certs',
                    label: 'Certifications Held',
                    type: 'multiselect',
                    options: [
                        { label: 'FSSAI', value: 'fssai' },
                        { label: 'ISO', value: 'iso' },
                        { label: 'Organic', value: 'organic' },
                        { label: 'MSME', value: 'msme' },
                        { label: 'Others', value: 'others' },
                    ]
                }
            ]
        },
        {
            id: 'logistics',
            title: 'Logistics',
            fields: [
                {
                    id: 'transport',
                    label: 'Requirement of transport partners?',
                    type: 'radio',
                    options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]
                }
            ]
        }
    ]
};

export const buyerRegistration: RoleConfig = {
    role: 'buyer',
    steps: [
        {
            id: 'buyerType',
            title: 'Buyer Type',
            fields: [
                {
                    id: 'type',
                    label: 'Type of Buyer',
                    type: 'select',
                    options: [
                        { label: 'Retail Consumer', value: 'retail' },
                        { label: 'Bulk Buyer', value: 'bulk' },
                        { label: 'Distributor', value: 'distributor' },
                        { label: 'Exporter', value: 'exporter' },
                        { label: 'Institutional Buyer', value: 'institutional' },
                    ]
                }
            ]
        },
        {
            id: 'basicDetails',
            title: 'Basic Details',
            fields: [
                { id: 'name', label: 'Name / Company Name', type: 'text', required: true },
                { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
                { id: 'email', label: 'Email', type: 'email' },
                { id: 'state', label: 'State', type: 'select', options: [{ label: 'Karnataka', value: 'karnataka' }] },
                { id: 'district', label: 'District', type: 'select', options: [] },
                { id: 'address', label: 'Delivery Address', type: 'text' },
            ]
        },
        {
            id: 'buyingIntent',
            title: 'Buying Intent',
            fields: [
                {
                    id: 'purchaseItems',
                    label: 'What are you looking to purchase?',
                    type: 'multiselect',
                    options: [
                        { label: 'Raw grains', value: 'raw' },
                        { label: 'Cleaned grains', value: 'cleaned' },
                        { label: 'Flour', value: 'flour' },
                        { label: 'Value-added products', value: 'value_added' },
                    ]
                },
                {
                    id: 'requirement',
                    label: 'Expected Monthly Requirement',
                    type: 'select',
                    options: [
                        { label: '50–100 kg', value: '50-100' },
                        { label: '100–500 kg', value: '100-500' },
                        { label: '500–1000 kg', value: '500-1000' },
                        { label: '1 tonne', value: '1t' },
                    ]
                }
            ]
        },
        {
            id: 'certifications',
            title: 'Certifications Needed',
            fields: [
                {
                    id: 'needCertified',
                    label: 'Do you need certified/organic produce?',
                    type: 'radio',
                    options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]
                }
            ]
        },
        {
            id: 'payment',
            title: 'Preferred Payment Method',
            fields: [
                {
                    id: 'paymentMethod',
                    label: 'Payment Method',
                    type: 'radio',
                    options: [
                        { label: 'UPI', value: 'upi' },
                        { label: 'Bank Transfer', value: 'bank' },
                        { label: 'Cash on Delivery', value: 'cod' },
                    ]
                }
            ]
        }
    ]
};

export const kscRegistration: RoleConfig = {
    role: 'ksc',
    steps: [
        {
            id: 'basic',
            title: 'KSC Details',
            fields: [
                { id: 'fullName', label: 'Full Name', type: 'text', required: true },
                { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
                { id: 'centerName', label: 'Center Name', type: 'text', required: true },
                { id: 'centerCode', label: 'Center Code', type: 'text', required: false },
                {
                    id: 'district',
                    label: 'Service District',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Bangalore Urban', value: 'bangalore_urban' },
                        { label: 'Bangalore Rural', value: 'bangalore_rural' },
                        { label: 'Tumkur', value: 'tumkur' },
                        { label: 'Hassan', value: 'hassan' },
                        { label: 'Mandya', value: 'mandya' },
                        { label: 'Mysore', value: 'mysore' },
                    ]
                },
                {
                    id: 'state',
                    label: 'State',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Karnataka', value: 'karnataka' },
                        { label: 'Maharashtra', value: 'maharashtra' },
                        { label: 'Tamil Nadu', value: 'tamil_nadu' },
                        { label: 'Andhra Pradesh', value: 'andhra_pradesh' },
                        { label: 'Telangana', value: 'telangana' },
                    ]
                },
            ]
        }
    ]
};

