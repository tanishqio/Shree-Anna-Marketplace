"use client";

import React from 'react';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, CheckCircle2, Info, FileText, ClipboardList, Gift } from 'lucide-react';

interface Scheme {
    id: string;
    title: string;
    link: string;
    whoIsEligible: string;
    benefits: string[];
    process: string[];
    documentsRequired: string[];
    specificCriteria: {
        label?: string;
        items: string[];
    }[];
}

const schemesData: Record<string, Scheme[]> = {
    en: [
        {
            id: '15',
            title: 'PM Kisan Samman Nidhi (PM-KISAN)',
            link: 'https://pmkisan.gov.in/',
            whoIsEligible: 'All landholding farmer families.',
            benefits: [
                'Financial benefit of ₹6,000 per year.',
                'Payable in three equal installments of ₹2,000 each.',
                'Direct transfer to bank accounts.'
            ],
            process: [
                'Visit pmkisan.gov.in and click on "New Farmer Registration".',
                'Enter Aadhaar number, Mobile number and select State.',
                'Verify using OTP sent to mobile.',
                'Fill in personal and land details (Survey/Khasra No.).',
                'Submit the form and note the application reference.',
                'Alternatively, visit nearest Common Service Centre (CSC).'
            ],
            documentsRequired: [
                'Aadhaar Card (Mandatory)',
                'Land Ownership Documents (7/12, 8A, etc.)',
                'Bank Account Passbook',
                'Mobile Number linked with Aadhaar'
            ],
            specificCriteria: [
                { label: 'Land', items: ['Must own cultivable land (no upper limit on land size).'] },
                { label: 'Exclusions', items: ['Institutional landholders.', 'Present/Former Ministers, MPs, MLAs, Mayors.', 'Serving/Retired Govt employees (except Group D).', 'Income Tax Payers.', 'Professionals (Doctors, Engineers, etc.).'] }
            ]
        },
        {
            id: '1',
            title: 'Mukhya Mantri Kisan Mitra Energy Yojana (Rajasthan)',
            link: 'https://energy.rajasthan.gov.in/',
            whoIsEligible: 'General category rural farmers with metered agricultural power connections.',
            benefits: [
                'Flat subsidy of ₹1,000 per month on electricity bill.',
                'Maximum benefit of ₹12,000 per year.',
                'Adjustment of remaining balance in subsequent months.'
            ],
            process: [
                'Link Aadhaar number with electricity account.',
                'Apply through the electricity distribution company (Discom) portal or office.',
                'Benefits are automatically adjusted in the electricity bill.'
            ],
            documentsRequired: [
                'Aadhaar Card',
                'Bhamashah Card / Jan Aadhaar Card',
                'Bank Account linked with Bamashah/Jan Aadhaar'
            ],
            specificCriteria: [
                { label: 'Residency', items: ['Must be a resident of Rajasthan.'] },
                { label: 'Exclusions', items: ['Central and State Government employees and Income Tax payers are not eligible.'] }
            ]
        },
        {
            id: '5',
            title: 'PM Formalization of Micro Food Processing Enterprises (PM-FME)',
            link: 'https://pmfme.mofpi.gov.in/',
            whoIsEligible: 'Unorganized Micro Food Processing Enterprises, FPOs, SHGs, and Cooperatives.',
            benefits: [
                'Credit-linked subsidy of 35% of eligible project cost.',
                'Maximum ceiling of ₹10 Lakh per unit.',
                'Seed capital for SHG members for working capital & tools.'
            ],
            process: [
                'Register on pmfme.mofpi.gov.in.',
                'Submit application along with DPR (Detailed Project Report).',
                'District Resource Persons (DRP) provide handholding support.',
                'Application sent to bank for loan sanction.',
                'Subsidy released after loan approval.'
            ],
            documentsRequired: [
                'Aadhaar Card & PAN Card',
                'Proof of Address & Date of Birth',
                'Bank Statement (last 6 months)',
                'Enterprise Registration details (Udyam)',
                'Detailed Project Report (DPR)'
            ],
            specificCriteria: [
                { label: 'Individual Micro Units', items: ['Must be an existing unit, employing fewer than 10 workers.', 'New units also eligible for ODOP products.'] },
                { label: 'Requirements', items: ['Applicant above 18 years.', 'Minimum VIII standard pass.', 'Only one person per family.'] }
            ]
        },
        {
            id: '3',
            title: 'National Food Security Mission (NFSM) - Nutri Cereals',
            link: 'https://nfsm.gov.in/',
            whoIsEligible: 'Farmers in identified districts with yield gaps.',
            benefits: [
                'Distribution of seed minikits of high-yielding varieties.',
                'Demonstrations on improved package of practices.',
                'Assistance for micronutrients, bio-fertilizers, and machinery.'
            ],
            process: [
                'Contact local Agriculture Extension Officer or District Agriculture Officer.',
                'Participate in selection for demonstrations.',
                'Register on state agriculture portal if applicable for subsidy.'
            ],
            documentsRequired: [
                'Farmer Registration details',
                'Land records',
                'Bank account details'
            ],
            specificCriteria: [
                { label: 'Focus', items: ['Special focus on Millets (Shree Anna).'] },
                { label: 'Priority Groups', items: ['33% for Small/Marginal Farmers;', '30% for Women;', '16% SC and 8% ST.'] }
            ]
        },
        {
            id: '13',
            title: 'Kisan Credit Card (KCC)',
            link: 'https://pmkisan.gov.in/',
            whoIsEligible: 'All farmers, tenant farmers, oral lessees, sharecroppers.',
            benefits: [
                'Flexible limit of ₹1.60 to ₹3.00 Lakh collateral-free.',
                'Low interest rate (effectively 4% on timely repayment).',
                'ATM-enabled RuPay Debit Card.'
            ],
            process: [
                'Download application form from bank website or pmkisan.gov.in.',
                'Fill details of land, crops sown.',
                'Submit to nearest bank branch.',
                'Bank verifies land records and issues card.'
            ],
            documentsRequired: [
                'Duly filled application form',
                'Identity Proof (Aadhaar/Voter ID/PAN)',
                'Address Proof',
                'Land Records (7/12 extract)'
            ],
            specificCriteria: [
                { label: 'Age', items: ['18 to 75 years.'] },
                { label: 'Criteria', items: ['Based on operational land holding and cropping pattern.'] }
            ]
        },
        {
            id: '14',
            title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
            link: 'https://pmfby.gov.in/',
            whoIsEligible: 'Farmers growing notified crops in notified areas.',
            benefits: [
                'Comprehensive insurance cover against crop failure.',
                'Lowest premium (2% Kharif, 1.5% Rabi, 5% Commercial).',
                'Covers prevented sowing and mid-season adversity.'
            ],
            process: [
                'Loanee farmers are automatically enrolled by banks.',
                'Non-loanee farmers can apply via PMFBY portal, CSC, or Insurance Agent.',
                'Submit sowing declaration and pay premium.'
            ],
            documentsRequired: [
                'Land Possession Certificate (LPC) / Land Records',
                'Aadhaar Card',
                'Bank Passbook',
                'Sowing Certificate'
            ],
            specificCriteria: [
                { label: 'Enrollment', items: ['Voluntary for all farmers.'] },
                { label: 'Cut-off', items: ['Apply before the cut-off date for the season.'] }
            ]
        },
        {
            id: '4',
            title: 'Kisan Drone Subsidy Scheme',
            link: 'https://agricoop.nic.in/',
            whoIsEligible: 'Individual Farmers, FPOs, SHGs, CHCs.',
            benefits: [
                'Subsidy up to 50% or ₹5 Lakhs for drone purchase.',
                'Use for pesticide spraying and crop monitoring.',
                'Training for drone pilots.'
            ],
            process: [
                'Apply through Digital Sky Platform or State Agriculture Dept.',
                'Obtain Remote Pilot Certificate.',
                'Submit purchase invoice for subsidy claim.'
            ],
            documentsRequired: [
                'Remote Pilot Certificate',
                'Aadhaar/KYC documents',
                'Bank details',
                'FPO/SHG registration (if applicable)'
            ],
            specificCriteria: [
                { label: 'Subsidy Rates', items: ['50%: SC/ST, Women, Small/Marginal Farmers, NE States.', '40%: Other farmers.', '75%: FPOs.'] }
            ]
        },
        {
            id: '12',
            title: 'PM Krishi Sinchai Yojana (Per Drop More Crop)',
            link: 'https://pmksy.gov.in/',
            whoIsEligible: 'Farmers with cultivable land.',
            benefits: [
                'Subsidy for Drip and Sprinkler irrigation systems.',
                '45% to 55% subsidy on system cost.',
                'Water saving and higher yield.'
            ],
            process: [
                'Apply on state horticulture/agriculture portal (e.g., Miahadbt in TN).',
                'Select authorized vendor.',
                'Vendor installs system.',
                'Physical verification leads to subsidy release.'
            ],
            documentsRequired: [
                'Land records (Chitta/Adangal)',
                'Aadhaar Card',
                'Passport size photo',
                'Field map'
            ],
            specificCriteria: [
                { label: 'Priority', items: ['Small & Marginal Farmers get higher subsidy.'] }
            ]
        },
        {
            id: '10',
            title: 'PM Kisan Maandhan Yojana (PMKMY)',
            link: 'https://pmkmy.gov.in/',
            whoIsEligible: 'Small and Marginal Farmers (SMF).',
            benefits: [
                'Assured pension of ₹3,000/- month after age 60.',
                'Voluntary and contributory pension scheme.',
                'Matching contribution by Government.'
            ],
            process: [
                'Visit nearest Common Service Centre (CSC).',
                'Carry Aadhaar and Bank details.',
                'Village Level Entrepreneur (VLE) completes registration.',
                'System auto-calculates monthly contribution.'
            ],
            documentsRequired: [
                'Aadhaar Card',
                'Savings Bank Account / Jan Dhan Account',
                'Mobile Number'
            ],
            specificCriteria: [
                { label: 'Age', items: ['Entry age 18 to 40 years.'] },
                { label: 'Land', items: ['Up to 2 hectares cultivable land.'] }
            ]
        },
        {
            id: '11',
            title: 'Soil Health Card Scheme',
            link: 'https://soilhealth.dac.gov.in/',
            whoIsEligible: 'All farmers.',
            benefits: [
                'Report on soil nutrient status (12 parameters).',
                'Fertilizer recommendations based on soil test.',
                'Reduces input cost and improves yield.'
            ],
            process: [
                'Soil samples collected by State Agriculture Dept staff.',
                'Can also get soil tested at Soil Testing Labs (STL).',
                'Card is generated and distributed to farmers.'
            ],
            documentsRequired: [
                'Land details (Survey No.)',
                'Aadhaar (for record)'
            ],
            specificCriteria: [
                { label: 'Cycle', items: ['Issued every 2-3 years.'] }
            ]
        }
        ,
        {
            id: '2',
            title: 'Bangla Shasya Bima Yojana (West Bengal)',
            link: 'https://banglashasyabima.net/',
            whoIsEligible: 'All farmers in West Bengal growing notified crops.',
            benefits: [
                'Free crop insurance with 100% premium paid by state government.',
                'Coverage for crop loss due to flood, drought, and cyclones.',
                'Direct claim settlement to bank accounts.'
            ],
            process: [
                'Visit banglashasyabima.net or nearest agriculture office.',
                'Fill application for Kharif/Rabi season.',
                'Submit documents to Gram Panchayat or Duare Sarkar camp.',
                'Collect acknowledgement receipt.'
            ],
            documentsRequired: [
                'Voter ID / Aadhaar Card',
                'Bank Passbook copy',
                'Land Record (RoR/Patta) or Cultivation Certificate',
                'Passport size photo'
            ],
            specificCriteria: [
                { label: 'Crops', items: ['Aman Paddy, Jute, Maize, Wheat, etc.'] },
                { label: 'Applicants', items: ['Landowners, Sharecroppers, and Tenant farmers eligible.'] }
            ]
        },
        {
            id: '6',
            title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
            link: 'https://pgsindia-ncof.gov.in/',
            whoIsEligible: 'Farmers adopting organic farming in clusters.',
            benefits: [
                '₹50,000 per hectare for 3 years.',
                '₹31,000/ha for organic inputs (bio-fertilizers, pesticides).',
                'Support for organic certification and marketing.'
            ],
            process: [
                'Form a cluster of 20 hectares with other farmers.',
                'Register cluster via Regional Council or State Dept.',
                'Adopt organic farming practices.',
                'Certification via PGS-India system.'
            ],
            documentsRequired: [
                'Aadhaar Card',
                'Land Documents',
                'Bank Passbook',
                'Cluster details'
            ],
            specificCriteria: [
                { label: 'Cluster', items: ['Must form a group (min 20 hectares) for eligibility.'] },
                { label: 'Limit', items: ['Max 2 hectares per farmer for subsidy.'] }
            ]
        },
        {
            id: '7',
            title: 'Sub Mission on Agriculture Mechanization (SMAM)',
            link: 'https://agrimachinery.nic.in/',
            whoIsEligible: 'Farmers, SHGs, and Co-operatives.',
            benefits: [
                '50% to 80% subsidy on agricultural machinery.',
                'Support for establishing Custom Hiring Centers (CHCs).',
                'Access to modern farm equipment.'
            ],
            process: [
                'Register on agrimachinery.nic.in.',
                'Select "Direct Benefit Transfer" option.',
                'Select equipment and dealer.',
                'After departmental approval, purchase machine and upload bill.'
            ],
            documentsRequired: [
                'Aadhaar Card',
                'Land Record (RoR)',
                'Bank Passbook',
                'Caste Certificate (for higher subsidy)',
                'Passport photo'
            ],
            specificCriteria: [
                { label: 'Subsidy', items: ['SC/ST/Small/Marginal/Women farmers get higher subsidy rates.'] }
            ]
        },
        {
            id: '8',
            title: 'Agriculture Infrastructure Fund (AIF)',
            link: 'https://agriinfra.dac.gov.in/',
            whoIsEligible: 'Farmers, FPOs, Agri-entrepreneurs.',
            benefits: [
                '3% interest subvention on loans up to ₹2 Crore.',
                'Credit guarantee fee coverage.',
                'Moratorium up to 2 years.'
            ],
            process: [
                'Prepare Detailed Project Report (DPR).',
                'Apply for loan at lending bank.',
                'Register on AIF portal and submit project.',
                'After sanction, subvention is released.'
            ],
            documentsRequired: [
                'DPR (Project Report)',
                'Bank Loan Application',
                'Land/Lease documents',
                'KYC documents'
            ],
            specificCriteria: [
                { label: 'Projects', items: ['Post-harvest infra like Cold Storage, Warehouses, Grading Units.'] }
            ]
        },
        {
            id: '9',
            title: 'Gramin Bhandaran Yojana (Rural Godown Scheme)',
            link: 'https://www.nabard.org/',
            whoIsEligible: 'Individuals, Farmers, FPOs, Companies.',
            benefits: [
                '25% subsidy on capital cost (33.33% for SC/ST/Women).',
                'Scientific storage capacity creation.',
                'Facilitates pledge financing.'
            ],
            process: [
                'Submit godown construction proposal to bank.',
                'Bank appraises and sanctions term loan.',
                'Bank forwards subsidy claim to NABARD.',
                'Joint inspection after completion releases subsidy.'
            ],
            documentsRequired: [
                'Project Report',
                'Land ownership/Lease (min 15 years)',
                'Approved plan/map',
                'Bank loan documents'
            ],
            specificCriteria: [
                { label: 'Location', items: ['Must be outside municipal corporation limits.'] },
                { label: 'Standards', items: ['Must meet CPWD/WDRA technical specifications.'] }
            ]
        }
    ],
    hi: [
        {
            id: '15',
            title: 'पीएम किसान सम्मान निधि (PM-KISAN)',
            link: 'https://pmkisan.gov.in/',
            whoIsEligible: 'सभी भू-धारक किसान परिवार।',
            benefits: [
                'प्रति वर्ष ₹6,000 का वित्तीय लाभ।',
                '₹2,000 की तीन समान किस्तों में देय।',
                'सीधे बैंक खातों में स्थानांतरण (DBT)।'
            ],
            process: [
                'pmkisan.gov.in पर जाएं और "New Farmer Registration" पर क्लिक करें।',
                'आधार नंबर, मोबाइल नंबर दर्ज करें और राज्य चुनें।',
                'मोबाइल पर प्राप्त OTP से सत्यापित करें।',
                'व्यक्तिगत और भूमि विवरण (सर्वे/खसरा नंबर) भरें।',
                'फॉर्म जमा करें और आवेदन संदर्भ नोट करें।',
                'वैकल्पिक रूप से, निकटतम कॉमन सर्विस सेंटर (CSC) पर जाएं।'
            ],
            documentsRequired: [
                'आधार कार्ड (अनिवार्य)',
                'भूमि स्वामित्व दस्तावेज (खतौनी, 7/12 आदि)',
                'बैंक खाता पासबुक',
                'मोबाइल नंबर (आधार से लिंक)'
            ],
            specificCriteria: [
                { label: 'भूमि', items: ['कृषि योग्य भूमि होनी चाहिए (आकार की कोई सीमा नहीं)।'] },
                { label: 'बहिष्करण', items: ['संस्थागत भूमिधारक, मंत्री, सांसद, विधायक, सरकारी कर्मचारी, आयकर दाता अपात्र हैं।'] }
            ]
        },
        {
            id: '1',
            title: 'मुख्यमंत्री किसान मित्र ऊर्जा योजना (राजस्थान)',
            link: 'https://energy.rajasthan.gov.in/',
            whoIsEligible: 'मीटर्ड कृषि बिजली कनेक्शन वाले सामान्य श्रेणी के ग्रामीण किसान।',
            benefits: [
                'बिजली बिल पर ₹1,000 प्रति माह की फ्लैट सब्सिडी।',
                'प्रति वर्ष अधिकतम ₹12,000 का लाभ।',
                'शेष राशि का समायोजन अगले महीनों में।'
            ],
            process: [
                'आधार नंबर को बिजली खाते से लिंक करें।',
                'डिस्कॉम पोर्टल या कार्यालय के माध्यम से आवेदन करें।',
                'लाभ स्वचालित रूप से बिजली बिल में समायोजित किया जाता है।'
            ],
            documentsRequired: [
                'आधार कार्ड',
                'भामाशाह कार्ड / जन आधार कार्ड',
                'बैंक खाता'
            ],
            specificCriteria: [
                { label: 'निवास', items: ['राजस्थान का निवासी होना चाहिए।'] },
                { label: 'बहिष्करण', items: ['सरकारी कर्मचारी और आयकर दाता पात्र नहीं हैं।'] }
            ]
        },
        {
            id: '5',
            title: 'पीएम सूक्ष्म खाद्य प्रसंस्करण उद्यम (PM-FME)',
            link: 'https://pmfme.mofpi.gov.in/',
            whoIsEligible: 'असंगठित सूक्ष्म खाद्य प्रसंस्करण इकाइयाँ, FPO, SHG और सहकारी समितियाँ।',
            benefits: [
                'पात्र परियोजना लागत का 35% क्रेडिट-लिंक्ड सब्सिडी।',
                'प्रति इकाई अधिकतम ₹10 लाख की सीमा।',
                'SHG सदस्यों के लिए सीड कैपिटल।'
            ],
            process: [
                'pmfme.mofpi.gov.in पर पंजीकरण करें।',
                'DPR (विस्तृत परियोजना रिपोर्ट) के साथ आवेदन जमा करें।',
                'जिला संसाधन व्यक्ति (DRP) सहायता प्रदान करते हैं।',
                'आवेदन ऋण स्वीकृति के लिए बैंक को भेजा जाता है।',
                'ऋण स्वीकृति के बाद सब्सिडी जारी की जाती है।'
            ],
            documentsRequired: [
                'आधार कार्ड और पैन कार्ड',
                'पते और जन्म तिथि का प्रमाण',
                'बैंक विवरण (पिछले 6 महीने)',
                'उद्यम पंजीकरण',
                'विस्तृत परियोजना रिपोर्ट (DPR)'
            ],
            specificCriteria: [
                { label: 'माइक्रो यूनिट', items: ['मौजूदा इकाई, 10 से कम कर्मचारी।', 'ODOP उत्पादों के लिए नई इकाइयाँ भी पात्र।'] },
                { label: 'आवश्यकताएँ', items: ['18 वर्ष से अधिक आयु, 8वीं पास।'] }
            ]
        },
        {
            id: '3',
            title: 'राष्ट्रीय खाद्य सुरक्षा मिशन (NFSM) - पोषक अनाज',
            link: 'https://nfsm.gov.in/',
            whoIsEligible: 'पहचान किए गए जिलों के किसान।',
            benefits: [
                'उच्च उपज वाली किस्मों के बीज मिनीकिट का वितरण।',
                'बेहतर कृषि तकनीकों का प्रदर्शन।',
                'सूक्ष्म पोषक तत्वों और मशीनरी के लिए सहायता।'
            ],
            process: [
                'स्थानीय कृषि विस्तार अधिकारी या जिला कृषि अधिकारी से संपर्क करें।',
                'प्रदर्शन के लिए चयन में भाग लें।',
                'सब्सिडी के लिए राज्य कृषि पोर्टल पर पंजीकरण करें।'
            ],
            documentsRequired: [
                'किसान पंजीकरण विवरण',
                'भूमि रिकॉर्ड',
                'बैंक खाता विवरण'
            ],
            specificCriteria: [
                { label: 'फोकस', items: ['मिलेट (श्री अन्न) पर विशेष ध्यान।'] },
                { label: 'प्राथमिकता', items: ['33% छोटे किसानों, 30% महिलाओं के लिए।'] }
            ]
        },
        {
            id: '13',
            title: 'किसान क्रेडिट कार्ड (KCC)',
            link: 'https://pmkisan.gov.in/',
            whoIsEligible: 'सभी किसान, बटाईदार और पट्टेदार।',
            benefits: [
                '₹1.60 से ₹3.00 लाख तक की लचीली सीमा।',
                'कम ब्याज दर (समय पर भुगतान पर 4%)।',
                'एटीएम सक्षम रुपे डेबिट कार्ड।'
            ],
            process: [
                'बैंक वेबसाइट या pmkisan.gov.in से फॉर्म डाउनलोड करें।',
                'भूमि और फसल विवरण भरें।',
                'निकटतम बैंक शाखा में जमा करें।',
                'बैंक सत्यापन के बाद कार्ड जारी करता है।'
            ],
            documentsRequired: [
                'भरा हुआ आवेदन फॉर्म',
                'पहचान प्रमाण (आधार/वोटर आईडी)',
                'पता प्रमाण',
                'भूमि रिकॉर्ड (खतौनी)'
            ],
            specificCriteria: [
                { label: 'आयु', items: ['18 से 75 वर्ष।'] },
                { label: 'आधार', items: ['फसल पैटर्न और भूमि जोत पर आधारित।'] }
            ]
        },
        {
            id: '14',
            title: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
            link: 'https://pmfby.gov.in/',
            whoIsEligible: 'अधिसूचित क्षेत्रों में फसल उगाने वाले किसान।',
            benefits: [
                'फसल विफलता के खिलाफ व्यापक बीमा कवर।',
                'न्यूनतम प्रीमियम (खरीफ 2%, रबी 1.5%)।',
                'बुवाई न कर पाने और मध्य-मौसम की प्रतिकूलता को कवर करता है।'
            ],
            process: [
                'ऋणी किसानों का बैंकों द्वारा स्वतः नामांकन होता है।',
                'गैर-ऋणी किसान PMFBY पोर्टल या CSC से आवेदन कर सकते हैं।',
                'बुवाई घोषणा जमा करें और प्रीमियम का भुगतान करें।'
            ],
            documentsRequired: [
                'भूमि कब्जा प्रमाण पत्र / रिकॉर्ड',
                'आधार कार्ड',
                'बैंक पासबुक',
                'बुवाई प्रमाण पत्र'
            ],
            specificCriteria: [
                { label: 'नामांकन', items: ['सभी के लिए स्वैच्छिक।'] },
                { label: 'अंतिम तिथि', items: ['सीजन की कट-ऑफ तारीख से पहले आवेदन करें।'] }
            ]
        },
        {
            id: '4',
            title: 'किसान ड्रोन सब्सिडी योजना',
            link: 'https://agricoop.nic.in/',
            whoIsEligible: 'व्यक्तिगत किसान, FPO, SHG।',
            benefits: [
                'ड्रोन खरीद पर 50% या ₹5 लाख तक की सब्सिडी।',
                'कीटनाशक छिड़काव और निगरानी के लिए उपयोग।',
                'ड्रोन पायलट प्रशिक्षण।'
            ],
            process: [
                'डिजिटल स्काई प्लेटफॉर्म या राज्य कृषि विभाग के माध्यम से आवेदन करें।',
                'रिमोट पायलट सर्टिफिकेट प्राप्त करें।',
                'सब्सिडी दावे के लिए खरीद चालान जमा करें।'
            ],
            documentsRequired: [
                'रिमोट पायलट सर्टिफिकेट',
                'आधार/KYC दस्तावेज',
                'FPO/SHG पंजीकरण (यदि लागू हो)'
            ],
            specificCriteria: [
                { label: 'दरें', items: ['अजा/जजा, लघु/सीमांत, महिलाओं के लिए 50%।', 'अन्य के लिए 40%।', 'FPO के लिए 75%।'] }
            ]
        },
        {
            id: '12',
            title: 'पीएम कृषि सिंचाई योजना (प्रति बूंद अधिक फसल)',
            link: 'https://pmksy.gov.in/',
            whoIsEligible: 'कृषि भूमि वाले किसान।',
            benefits: [
                'ड्रिप और स्प्रिंकलर सिस्टम पर सब्सिडी।',
                'सिस्टम लागत पर 45% से 55% सब्सिडी।',
                'पानी की बचत और अधिक उपज।'
            ],
            process: [
                'राज्य बागवानी/कृषि पोर्टल पर आवेदन करें।',
                'अधिकृत विक्रेता चुनें।',
                'वेंडर सिस्टम स्थापित करेगा।',
                'भौतिक सत्यापन के बाद सब्सिडी जारी होती है।'
            ],
            documentsRequired: [
                'भूमि रिकॉर्ड',
                'आधार कार्ड',
                'फोटो',
                'खेत का नक्शा'
            ],
            specificCriteria: [
                { label: 'प्राथमिकता', items: ['छोटे और सीमांत किसानों को अधिक सब्सिडी।'] }
            ]
        },
        {
            id: '10',
            title: 'पीएम किसान मानधन योजना (PMKMY)',
            link: 'https://pmkmy.gov.in/',
            whoIsEligible: 'लघु और सीमांत किसान।',
            benefits: [
                '60 वर्ष की आयु के बाद ₹3,000/माह की सुनिश्चित पेंशन।',
                'स्वैच्छिक और अंशदायी पेंशन योजना।',
                'सरकार द्वारा समान योगदान।'
            ],
            process: [
                'निकटतम कॉमन सर्विस सेंटर (CSC) पर जाएं।',
                'आधार और बैंक विवरण साथ ले जाएं।',
                'VLE पंजीकरण पूरा करेगा।',
                'सिस्टम मासिक योगदान की गणना करेगा।'
            ],
            documentsRequired: [
                'आधार कार्ड',
                'बचत बैंक खाता',
                'मोबाइल नंबर'
            ],
            specificCriteria: [
                { label: 'पात्रता', items: ['प्रवेश आयु 18-40 वर्ष।', '2 हेक्टेयर तक भूमि।'] }
            ]
        },
        {
            id: '11',
            title: 'मृदा स्वास्थ्य कार्ड योजना',
            link: 'https://soilhealth.dac.gov.in/',
            whoIsEligible: 'सभी किसान।',
            benefits: [
                'मिट्टी के पोषक तत्वों (12 मापदंडों) की रिपोर्ट।',
                'मिट्टी परीक्षण के आधार पर खाद की सिफारिश।',
                'लागत कम और उपज में सुधार।'
            ],
            process: [
                'कृषि विभाग के कर्मचारियों द्वारा मिट्टी के नमूने लिए जाते हैं।',
                'प्रयोगशाला में परीक्षण किया जाता है।',
                'कार्ड तैयार कर किसानों को वितरित किया जाता है।'
            ],
            documentsRequired: [
                'भूमि विवरण (सर्वे नंबर)',
                'आधार कार्ड'
            ],
            specificCriteria: [
                { label: 'चक्र', items: ['हर 2-3 साल में जारी किया जाता है।'] }
            ]
        }
        ,
        {
            id: '2',
            title: 'बांग्ला शस्य बीमा योजना (पश्चिम बंगाल)',
            link: 'https://banglashasyabima.net/',
            whoIsEligible: 'अधिसूचित फसल उगाने वाले पश्चिम बंगाल के सभी किसान।',
            benefits: [
                'राज्य सरकार द्वारा 100% प्रीमियम भुगतान के साथ मुफ्त फसल बीमा।',
                'बाढ़, सूखा और चक्रवात के कारण फसल नुकसान के लिए कवरेज।',
                'बैंक खातों में सीधे दावा निपटान।'
            ],
            process: [
                'banglashasyabima.net या निकटतम कृषि कार्यालय पर जाएं।',
                'खरीफ/रबी सीजन के लिए आवेदन भरें।',
                'ग्राम पंचायत या दुआरे सरकार कैंप में दस्तावेज जमा करें।',
                'पावती रसीद प्राप्त करें।'
            ],
            documentsRequired: [
                'वोटर आईडी / आधार कार्ड',
                'बैंक पासबुक की कॉपी',
                'भूमि रिकॉर्ड (पट्टा) या खेती प्रमाण पत्र',
                'पासपोर्ट साइज फोटो'
            ],
            specificCriteria: [
                { label: 'फसलें', items: ['अमन धान, जूट, मक्का, गेहूं आदि शामिल हैं।'] },
                { label: 'आवेदक', items: ['भूमि मालिक, बटाईदार और किरायेदार किसान पात्र हैं।'] }
            ]
        },
        {
            id: '6',
            title: 'परंपरागत कृषि विकास योजना (PKVY)',
            link: 'https://pgsindia-ncof.gov.in/',
            whoIsEligible: 'जैविक खेती अपनाने वाले किसान (समूह में)।',
            benefits: [
                '3 वर्षों के लिए प्रति हेक्टेयर ₹50,000।',
                'जैविक इनपुट (जैव उर्वरक) के लिए ₹31,000/हेक्टेयर।',
                'जैविक प्रमाणीकरण और विपणन के लिए सहायता।'
            ],
            process: [
                'अन्य किसानों के साथ 20 हेक्टेयर का क्लस्टर बनाएं।',
                'क्षेत्रीय परिषद या राज्य विभाग के माध्यम से क्लस्टर पंजीकृत करें।',
                'जैविक खेती के तरीके अपनाएं।',
                'PGS-India प्रणाली के माध्यम से प्रमाणीकरण।'
            ],
            documentsRequired: [
                'आधार कार्ड',
                'भूमि दस्तावेज',
                'बैंक पासबुक',
                'क्लस्टर विवरण'
            ],
            specificCriteria: [
                { label: 'क्लस्टर', items: ['पात्रता के लिए समूह (न्यूनतम 20 हेक्टेयर) बनाना अनिवार्य।'] },
                { label: 'सीमा', items: ['सब्सिडी के लिए प्रति किसान अधिकतम 2 हेक्टेयर।'] }
            ]
        },
        {
            id: '7',
            title: 'कृषि यंत्रीकरण उप-मिशन (SMAM)',
            link: 'https://agrimachinery.nic.in/',
            whoIsEligible: 'किसान, स्वयं सहायता समूह (SHG) और सहकारी समितियां।',
            benefits: [
                'कृषि मशीनरी पर 50% से 80% सब्सिडी।',
                'कस्टम हायरिंग सेंटर (CHC) स्थापित करने के लिए सहायता।',
                'आधुनिक कृषि उपकरणों तक पहुंच।'
            ],
            process: [
                'agrimachinery.nic.in पर पंजीकरण करें।',
                '"प्रत्यक्ष लाभ हस्तांतरण" (DBT) विकल्प चुनें।',
                'उपकरण और डीलर का चयन करें।',
                'विभागीय स्वीकृति के बाद मशीन खरीदें और बिल अपलोड करें।'
            ],
            documentsRequired: [
                'आधार कार्ड',
                'भूमि रिकॉर्ड',
                'बैंक पासबुक',
                'जाति प्रमाण पत्र (उच्च सब्सिडी के लिए)',
                'पासपोर्ट फोटो'
            ],
            specificCriteria: [
                { label: 'सब्सिडी', items: ['SC/ST/छोटे/सीमांत/महिला किसानों को उच्च सब्सिडी दरें मिलती हैं।'] }
            ]
        },
        {
            id: '8',
            title: 'कृषि अवसंरचना कोष (AIF)',
            link: 'https://agriinfra.dac.gov.in/',
            whoIsEligible: 'किसान, FPO, कृषि उद्यमी।',
            benefits: [
                '₹2 करोड़ तक के ऋण पर 3% ब्याज छूट।',
                'क्रेडिट गारंटी शुल्क कवरेज।',
                '2 साल तक की मोहलत (Moratorium)।'
            ],
            process: [
                'विस्तृत परियोजना रिपोर्ट (DPR) तैयार करें।',
                'ऋणदाता बैंक में ऋण के लिए आवेदन करें।',
                'AIF पोर्टल पर पंजीकरण करें और परियोजना जमा करें।',
                'स्वीकृति के बाद, ब्याज छूट जारी की जाती है।'
            ],
            documentsRequired: [
                'DPR (प्रोजेक्ट रिपोर्ट)',
                'बैंक ऋण आवेदन',
                'भूमि/पट्टा दस्तावेज',
                'KYC दस्तावेज'
            ],
            specificCriteria: [
                { label: 'परियोजनाएं', items: ['पोस्ट- हार्वेस्ट इंफ्रा जैसे कोल्ड स्टोरेज, गोदाम, ग्रेडिंग यूनिट।'] }
            ]
        },
        {
            id: '9',
            title: 'ग्रामीण भंडारण योजना',
            link: 'https://www.nabard.org/',
            whoIsEligible: 'व्यक्तिगत किसान, FPO, कंपनियां।',
            benefits: [
                'पूंजीगत लागत पर 25% सब्सिडी (SC/ST/महिलाओं के लिए 33.33%)।',
                'वैज्ञानिक भंडारण क्षमता का निर्माण।',
                'प्लेज फाइनेंसिंग की सुविधा।'
            ],
            process: [
                'बैंक को गोदाम निर्माण प्रस्ताव जमा करें।',
                'बैंक टर्म लोन का मूल्यांकन और स्वीकृति करता है।',
                'बैंक नाबार्ड को सब्सिडी का दावा भेजता है।',
                'पूर्ण होने के बाद संयुक्त निरीक्षण से सब्सिडी जारी होती है।'
            ],
            documentsRequired: [
                'प्रोजेक्ट रिपोर्ट',
                'भूमि स्वामित्व/लीज (न्यूनतम 15 वर्ष)',
                'अनुमोदित नक्शा/प्लान',
                'बैंक ऋण दस्तावेज'
            ],
            specificCriteria: [
                { label: 'स्थान', items: ['नगर निगम सीमा से बाहर होना चाहिए।'] },
                { label: 'मानक', items: ['CPWD/WDRA तकनीकी विनिर्देशों को पूरा करना चाहिए।'] }
            ]
        }
    ]
};

export function GovernmentSchemesHub({ compact = false }: { compact?: boolean }) {
    const { language } = useLanguage();
    // Always use both English and Hindi data
    const schemesEn = schemesData.en;
    const schemesHi = schemesData.hi;

    const headers = {
        en: { title: "Government Schemes", description: "Stay updated with the latest government schemes and subsidies", checkEligibility: "Guide & Eligibility", applyNow: "Apply Now", sections: { benefits: "Benefits", process: "Application Process", documents: "Documents Required", criteria: "Eligibility Criteria" } },
        hi: { title: "सरकारी योजनाएं", description: "नवीनतम सरकारी योजनाओं और सब्सिडी के साथ अपडेट रहें", checkEligibility: "गाइड और पात्रता", applyNow: "आवेदन करें", sections: { benefits: "लाभ", process: "आवेदन प्रक्रिया", documents: "आवश्यक दस्तावेज", criteria: "पात्रता मानदंड" } },
        kn: { title: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", description: "ಇತ್ತೀಚಿನ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳೊಂದಿಗೆ ನವೀಕೃತವಾಗಿರಿ", checkEligibility: "ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ಅರ್ಹತೆ", applyNow: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ", sections: { benefits: "ಪ್ರಯೋಜನಗಳು", process: "ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆ", documents: "ಅಗತ್ಯ ದಾಖಲೆಗಳು", criteria: "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು" } },
        te: { title: "ప్రభుత్వ పథకాలు", description: "తాజా ప్రభుత్వ పథకాలు మరియు సబ్సిడీలతో అప్‌డేట్‌గా ఉండండి", checkEligibility: "గైడ్ & అర్హత", applyNow: "దరఖాస్తు చేయండి", sections: { benefits: "ప్రయోజనాలు", process: "దరఖాస్తు ప్రక్రియ", documents: "అవసరమైన పత్రాలు", criteria: "అర్హత ప్రమాణాలు" } },
        ta: { title: "அரசு திட்டங்கள்", description: "சமீபத்திய அரசு திட்டங்கள் மற்றும் மானியங்களுடன் புதுப்பித்த நிலையில் இருங்கள்", checkEligibility: "வழிகாட்டி மற்றும் தகுதி", applyNow: "விண்ணப்பிக்கவும்", sections: { benefits: "நன்மைகள்", process: "விண்ணப்ப செயல்முறை", documents: "தேவையான ஆவணங்கள்", criteria: "தகுதி அளவுகோல்கள்" } },
        mr: { title: "सरकारी योजना", description: "नवीनतम सरकारी योजना आणि सबसिडीसह अद्यतनित रहा", checkEligibility: "मार्गदर्शक आणि पात्रता", applyNow: "अर्ज करा", sections: { benefits: "फायदे", process: "अर्ज प्रक्रिया", documents: "आवश्यक कागदपत्रे", criteria: "पात्रता निकष" } }
    };

    const t = headers[language] || headers.en;

    return (
        <div className="w-full">
            {compact && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-heading font-bold">{t.title}</h2>
                    <Button variant="outline" size="sm" asChild>
                        <a href="/schemes">View All</a>
                    </Button>
                </div>
            )}

            {!compact && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {schemesEn.map((schemeEn, index) => {
                            const schemeHi = schemesHi[index];
                            return (
                                <Card key={schemeEn.id} className="overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow group">
                                    <CardHeader className="bg-muted/30 pb-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex gap-3 flex-1">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg sm:text-xl text-primary group-hover:text-primary/80 transition-colors mb-2">
                                                        {schemeEn.title}
                                                    </CardTitle>
                                                    <CardTitle className="text-base sm:text-lg text-primary/80 group-hover:text-primary/70 transition-colors font-medium">
                                                        {schemeHi.title}
                                                    </CardTitle>
                                                    <CardDescription className="mt-2">
                                                        <div className="space-y-1">
                                                            <p className="text-sm">{schemeEn.whoIsEligible}</p>
                                                            <p className="text-sm text-muted-foreground/80">{schemeHi.whoIsEligible}</p>
                                                        </div>
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild className="shrink-0 gap-2">
                                                <a href={schemeEn.link} target="_blank" rel="noopener noreferrer">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-semibold">Apply Now</span>
                                                        <span className="text-[10px] font-medium">आवेदन करें</span>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="details" className="border-b-0">
                                                <AccordionTrigger className="hover:no-underline py-2 text-sm font-medium text-muted-foreground w-auto justify-start gap-2">
                                                    <Info className="w-4 h-4" />
                                                    <div className="flex flex-col items-start">
                                                        <span>Guide & Eligibility</span>
                                                        <span className="text-xs">गाइड और पात्रता</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="pt-4 grid gap-6 md:grid-cols-2">
                                                        {/* Benefits Section - Bilingual */}
                                                        <div className="space-y-3">
                                                            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground/90">
                                                                <Gift className="w-4 h-4 text-accent" />
                                                                <div className="flex flex-col">
                                                                    <span>Benefits</span>
                                                                    <span className="text-xs font-medium text-muted-foreground">लाभ</span>
                                                                </div>
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {schemeEn.benefits.map((benefitEn, i) => (
                                                                    <div key={i} className="space-y-1">
                                                                        <div className="text-sm text-foreground flex items-start gap-2">
                                                                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary/60 shrink-0" />
                                                                            <span>{benefitEn}</span>
                                                                        </div>
                                                                        {schemeHi?.benefits?.[i] && (
                                                                            <div className="text-sm text-muted-foreground flex items-start gap-2 pl-5">
                                                                                <span className="text-xs">•</span>
                                                                                <span>{schemeHi.benefits[i]}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Eligibility Criteria - Bilingual */}
                                                        <div className="space-y-3">
                                                            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground/90">
                                                                <FileText className="w-4 h-4 text-accent" />
                                                                <div className="flex flex-col">
                                                                    <span>Eligibility Criteria</span>
                                                                    <span className="text-xs font-medium text-muted-foreground">पात्रता मानदंड</span>
                                                                </div>
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {schemeEn.specificCriteria.map((criteriaEn, i) => {
                                                                    const criteriaHi = schemeHi?.specificCriteria?.[i];
                                                                    return (
                                                                        <div key={i} className="bg-card/50 p-2.5 rounded-lg border border-border/50">
                                                                            {criteriaEn.label && (
                                                                                <div className="mb-1">
                                                                                    <span className="text-xs font-semibold text-primary/80 block">
                                                                                        {criteriaEn.label}
                                                                                    </span>
                                                                                    {criteriaHi?.label && (
                                                                                        <span className="text-xs font-semibold text-primary/60 block">
                                                                                            {criteriaHi.label}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                            <div className="space-y-1">
                                                                                {criteriaEn.items.map((itemEn, j) => (
                                                                                    <div key={j} className="space-y-0.5">
                                                                                        <div className="text-xs text-foreground pl-3 border-l-2 border-accent/20">
                                                                                            {itemEn}
                                                                                        </div>
                                                                                        {criteriaHi?.items?.[j] && (
                                                                                            <div className="text-xs text-muted-foreground/80 pl-3 border-l-2 border-accent/10">
                                                                                                {criteriaHi.items[j]}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Documents Required - Bilingual */}
                                                        <div className="space-y-3">
                                                            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground/90">
                                                                <ClipboardList className="w-4 h-4 text-accent" />
                                                                <div className="flex flex-col">
                                                                    <span>Documents Required</span>
                                                                    <span className="text-xs font-medium text-muted-foreground">आवश्यक दस्तावेज</span>
                                                                </div>
                                                            </h4>
                                                            <div className="w-full bg-muted/20 rounded-lg p-3 space-y-2">
                                                                {schemeEn.documentsRequired.map((docEn, i) => (
                                                                    <div key={i} className="space-y-0.5">
                                                                        <div className="text-xs text-foreground flex items-center gap-2">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                                                                            {docEn}
                                                                        </div>
                                                                        {schemeHi?.documentsRequired?.[i] && (
                                                                            <div className="text-xs text-muted-foreground/80 flex items-center gap-2 pl-3.5">
                                                                                <span className="text-[10px]">•</span>
                                                                                {schemeHi.documentsRequired[i]}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Application Process - Bilingual */}
                                                        <div className="space-y-3">
                                                            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground/90">
                                                                <Info className="w-4 h-4 text-accent" />
                                                                <div className="flex flex-col">
                                                                    <span>Application Process</span>
                                                                    <span className="text-xs font-medium text-muted-foreground">आवेदन प्रक्रिया</span>
                                                                </div>
                                                            </h4>
                                                            <ol className="space-y-3">
                                                                {schemeEn.process.map((stepEn, i) => (
                                                                    <li key={i} className="space-y-1">
                                                                        <div className="text-sm text-foreground flex gap-3">
                                                                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                                                                                {i + 1}
                                                                            </span>
                                                                            <span>{stepEn}</span>
                                                                        </div>
                                                                        {schemeHi?.process?.[i] && (
                                                                            <div className="text-sm text-muted-foreground flex gap-3 pl-8">
                                                                                <span className="text-xs">•</span>
                                                                                <span>{schemeHi.process[i]}</span>
                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {compact && (
                <div className="space-y-3">
                    {schemesEn.slice(0, 3).map((schemeEn, idx) => {
                        const schemeHi = schemesHi[idx];
                        return (
                            <div key={schemeEn.id} className="p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
                                <h4 className="font-medium text-sm line-clamp-1">{schemeEn.title}</h4>
                                <h4 className="font-medium text-xs text-muted-foreground line-clamp-1">{schemeHi.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{schemeEn.whoIsEligible}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
