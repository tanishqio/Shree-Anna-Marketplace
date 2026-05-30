// Mock notification data for the Shree Anna marketplace
export type NotificationType = 'weather' | 'season' | 'scheme' | 'disaster' | 'order' | 'logistics';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    titleHi: string;
    message: string;
    messageHi: string;
    timestamp: Date;
    isRead: boolean;
    icon: string;
    priority: 'low' | 'medium' | 'high';
    actionUrl?: string;
}

export const mockNotifications: Notification[] = [
    // Weather Notifications
    {
        id: 'weather-1',
        type: 'weather',
        title: 'Heavy Rain Alert',
        titleHi: 'भारी बारिश की चेतावनी',
        message: 'Heavy rainfall expected in your area in the next 24 hours. Protect your crops.',
        messageHi: 'अगले 24 घंटों में आपके क्षेत्र में भारी बारिश की संभावना है। अपनी फसलों की रक्षा करें।',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        icon: '🌧️',
        priority: 'high',
    },
    {
        id: 'weather-2',
        type: 'weather',
        title: 'Temperature Warning',
        titleHi: 'तापमान चेतावनी',
        message: 'High temperatures (38°C+) forecasted for next 3 days. Ensure adequate irrigation.',
        messageHi: 'अगले 3 दिनों के लिए उच्च तापमान (38°C+) का पूर्वानुमान। पर्याप्त सिंचाई सुनिश्चित करें।',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        isRead: true,
        icon: '🌡️',
        priority: 'medium',
    },
    {
        id: 'weather-3',
        type: 'weather',
        title: 'Good Weather for Harvest',
        titleHi: 'कटाई के लिए अच्छा मौसम',
        message: 'Clear skies and dry weather perfect for harvesting in the next 5 days.',
        messageHi: 'अगले 5 दिनों में कटाई के लिए साफ़ आसमान और सूखा मौसम एकदम सही।',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
        icon: '☀️',
        priority: 'low',
    },

    // Season Alerts
    {
        id: 'season-1',
        type: 'season',
        title: 'Rabi Season Starting',
        titleHi: 'रबी का मौसम शुरू हो रहा है',
        message: 'Optimal time to plant rabi millets like Ragi and Bajra. Order your seeds now!',
        messageHi: 'रागी और बाजरा जैसी रबी बाजरा बोने का सबसे अच्छा समय। अभी अपने बीज ऑर्डर करें!',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: false,
        icon: '🌱',
        priority: 'high',
        actionUrl: '/marketplace?category=seeds',
    },
    {
        id: 'season-2',
        type: 'season',
        title: 'Harvest Season Peak',
        titleHi: 'कटाई का मौसम चरम पर',
        message: 'Peak harvest season for Kodo and Little Millet. List your produce for best prices.',
        messageHi: 'कोदो और छोटे बाजरा के लिए चरम कटाई का मौसम। सर्वोत्तम कीमतों के लिए अपनी उपज सूचीबद्ध करें।',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        isRead: false,
        icon: '🌾',
        priority: 'medium',
        actionUrl: '/farmer/listing/create',
    },

    // Government Scheme Alerts
    {
        id: 'scheme-1',
        type: 'scheme',
        title: 'New PM-KISAN Payment Released',
        titleHi: 'नया पीएम-किसान भुगतान जारी',
        message: '₹2,000 installment credited to eligible farmers. Check your account.',
        messageHi: '₹2,000 की किस्त पात्र किसानों के खाते में जमा। अपना खाता जांचें।',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: false,
        icon: '💰',
        priority: 'high',
        actionUrl: '/schemes',
    },
    {
        id: 'scheme-2',
        type: 'scheme',
        title: 'Millet Subsidy Available',
        titleHi: 'बाजरा सब्सिडी उपलब्ध',
        message: 'Get 40% subsidy on millet processing equipment. Apply before Dec 31.',
        messageHi: 'बाजरा प्रसंस्करण उपकरण पर 40% सब्सिडी प्राप्त करें। 31 दिसंबर से पहले आवेदन करें।',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: true,
        icon: '🏭',
        priority: 'medium',
        actionUrl: '/schemes',
    },
    {
        id: 'scheme-3',
        type: 'scheme',
        title: 'Organic Certification Program',
        titleHi: 'जैविक प्रमाणन कार्यक्रम',
        message: 'Free organic certification training starting next week. Register now!',
        messageHi: 'अगले सप्ताह से मुफ्त जैविक प्रमाणन प्रशिक्षण शुरू। अभी पंजीकरण करें!',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isRead: true,
        icon: '🎓',
        priority: 'low',
        actionUrl: '/schemes',
    },

    // Disaster Alerts
    {
        id: 'disaster-1',
        type: 'disaster',
        title: 'Drought Warning',
        titleHi: 'सूखा चेतावनी',
        message: 'Prolonged dry spell predicted. Conserve water and apply for drought relief.',
        messageHi: 'लंबे समय तक सूखे की भविष्यवाणी। पानी बचाएं और सूखा राहत के लिए आवेदन करें।',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        isRead: false,
        icon: '🏜️',
        priority: 'high',
    },
    {
        id: 'disaster-2',
        type: 'disaster',
        title: 'Pest Attack Alert',
        titleHi: 'कीट हमले की चेतावनी',
        message: 'Fall armyworm detected in nearby areas. Take preventive measures immediately.',
        messageHi: 'आस-पास के क्षेत्रों में फॉल आर्मीवर्म का पता चला। तुरंत निवारक उपाय करें।',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: false,
        icon: '🐛',
        priority: 'high',
    },

    // Listing and Buying Updates
    {
        id: 'order-1',
        type: 'order',
        title: 'New Offer Received',
        titleHi: 'नया ऑफर प्राप्त हुआ',
        message: 'A buyer offered ₹52/kg for your Foxtail Millet listing (500 kg).',
        messageHi: 'एक खरीदार ने आपकी कंगनी बाजरा लिस्टिंग (500 किलो) के लिए ₹52/किलो की पेशकश की।',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: false,
        icon: '💵',
        priority: 'high',
        actionUrl: '/farmer/offers',
    },
    {
        id: 'order-2',
        type: 'order',
        title: 'Order Confirmed',
        titleHi: 'आदेश की पुष्टि',
        message: 'Your order for 200kg Barnyard Millet has been confirmed. Expected delivery: 3 days.',
        messageHi: 'आपका 200 किलो सांवा बाजरा का ऑर्डर confirm हो गया है। अपेक्षित डिलीवरी: 3 दिन।',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        isRead: true,
        icon: '✅',
        priority: 'medium',
        actionUrl: '/buyer/orders',
    },
    {
        id: 'order-3',
        type: 'order',
        title: 'Price Drop Alert',
        titleHi: 'कीमत में गिरावट की चेतावनी',
        message: 'Little Millet prices dropped by 8%. Good time to buy in bulk!',
        messageHi: 'छोटे बाजरा की कीमतों में 8% की गिरावट। थोक में खरीदने का अच्छा समय!',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        isRead: true,
        icon: '📉',
        priority: 'low',
        actionUrl: '/marketplace',
    },
    {
        id: 'order-4',
        type: 'order',
        title: 'Your Listing is Trending',
        titleHi: 'आपकी लिस्टिंग ट्रेंड कर रही है',
        message: '15 buyers viewed your Premium Ragi listing today. Consider increasing stock!',
        messageHi: 'आज 15 खरीदारों ने आपकी प्रीमियम रागी लिस्टिंग देखी। स्टॉक बढ़ाने पर विचार करें!',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: false,
        icon: '🔥',
        priority: 'medium',
        actionUrl: '/farmer/listings',
    },

    // Logistics Alerts
    {
        id: 'logistics-1',
        type: 'logistics',
        title: 'Shipment Out for Delivery',
        titleHi: 'शिपमेंट डिलीवरी के लिए रवाना',
        message: 'Your 300kg Kodo Millet shipment is out for delivery. Track: #KM300912A',
        messageHi: 'आपका 300 किलो कोदो बाजरा शिपमेंट डिलीवरी के लिए रवाना हो गया है। ट्रैक: #KM300912A',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        isRead: false,
        icon: '🚚',
        priority: 'high',
        actionUrl: '/logistics/track/KM300912A',
    },
    {
        id: 'logistics-2',
        type: 'logistics',
        title: 'Delivery Completed',
        titleHi: 'डिलीवरी पूर्ण',
        message: 'Order #BM450812 successfully delivered. Please confirm receipt.',
        messageHi: 'ऑर्डर #BM450812 सफलतापूर्वक वितरित। कृपया रसीद की पुष्टि करें।',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: true,
        icon: '📦',
        priority: 'medium',
        actionUrl: '/orders/BM450812',
    },
    {
        id: 'logistics-3',
        type: 'logistics',
        title: 'Transport Available',
        titleHi: 'परिवहन उपलब्ध',
        message: 'Shared transport to Bangalore market available on Dec 12. Book your slot!',
        messageHi: 'बैंगलोर बाजार के लिए साझा परिवहन 12 दिसंबर को उपलब्ध। अपना स्लॉट बुक करें!',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRead: true,
        icon: '🚛',
        priority: 'low',
        actionUrl: '/logistics/transport',
    },
];

// Get notifications by type
export const getNotificationsByType = (type: NotificationType): Notification[] => {
    return mockNotifications.filter(n => n.type === type);
};

// Get unread count
export const getUnreadCount = (): number => {
    return mockNotifications.filter(n => !n.isRead).length;
};

// Get unread count by type
export const getUnreadCountByType = (type: NotificationType): number => {
    return mockNotifications.filter(n => n.type === type && !n.isRead).length;
};
