"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  Wallet,
  Building,
  CreditCard,
  Phone,
  FileText,
  TrendingUp,
  RefreshCw,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePayments } from '@/lib/hooks/useData';
import { paymentsApi, Payment } from '@/lib/api';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'pending';
  amount: number;
  description: string;
  descriptionHi: string;
  orderId?: string;
  buyerName?: string;
  milletType?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod?: string;
  utrNumber?: string;
}

// Transform API payment to transaction format
const transformPayment = (payment: Payment): Transaction => ({
  id: payment.id,
  type: payment.status === 'pending' ? 'pending' : 'credit',
  amount: payment.amount,
  description: `Payment for Order ${payment.order_id}`,
  descriptionHi: `ऑर्डर ${payment.order_id} के लिए भुगतान`,
  orderId: payment.order_id,
  buyerName: 'Buyer',
  milletType: 'Millet',
  timestamp: new Date(payment.created_at),
  status: payment.status,
  paymentMethod: payment.payment_method || 'Bank Transfer',
  utrNumber: payment.utr_number,
});

const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'credit',
    amount: 14400,
    description: 'Payment for Ragi - 300kg',
    descriptionHi: 'रागी के लिए भुगतान - 300 किलो',
    orderId: 'ORD-2024-001',
    buyerName: 'Organic Foods Ltd.',
    milletType: 'Ragi',
    timestamp: new Date(Date.now() - 86400000),
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    utrNumber: 'UTR123456789',
  },
  {
    id: 'TXN-002',
    type: 'pending',
    amount: 7000,
    description: 'Payment for Bajra - 200kg',
    descriptionHi: 'बाजरा के लिए भुगतान - 200 किलो',
    orderId: 'ORD-2024-002',
    buyerName: 'HealthyGrains Co.',
    milletType: 'Bajra',
    timestamp: new Date(Date.now() + 259200000),
    status: 'pending',
  },
  {
    id: 'TXN-003',
    type: 'credit',
    amount: 8250,
    description: 'Payment for Foxtail Millet - 150kg',
    descriptionHi: 'कांगनी के लिए भुगतान - 150 किलो',
    orderId: 'ORD-2024-003',
    buyerName: 'Millet Masters',
    milletType: 'Foxtail',
    timestamp: new Date(Date.now() - 345600000),
    status: 'completed',
    paymentMethod: 'UPI',
    utrNumber: 'UPI987654321',
  },
  {
    id: 'TXN-004',
    type: 'credit',
    amount: 12000,
    description: 'Payment for Jowar - 300kg',
    descriptionHi: 'ज्वार के लिए भुगतान - 300 किलो',
    orderId: 'ORD-2024-004',
    buyerName: 'AgriTech Foods',
    milletType: 'Jowar',
    timestamp: new Date(Date.now() - 604800000),
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    utrNumber: 'UTR567891234',
  },
  {
    id: 'TXN-005',
    type: 'debit',
    amount: 500,
    description: 'Platform fee for March 2024',
    descriptionHi: 'मार्च 2024 के लिए प्लेटफॉर्म शुल्क',
    timestamp: new Date(Date.now() - 172800000),
    status: 'completed',
    paymentMethod: 'Auto-deduct',
  },
];

const bankDetails = {
  accountName: 'Ramesh Kumar',
  accountNumber: 'XXXX XXXX 4521',
  bankName: 'State Bank of India',
  ifsc: 'SBIN0001234',
  upiId: 'ramesh.kumar@sbi',
};

// Download receipt as text file
const downloadReceipt = (transaction: Transaction) => {
  const receipt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SHREE ANNA PAYMENT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Transaction ID: ${transaction.id}
Date: ${transaction.timestamp.toLocaleString('en-IN')}

PAYMENT DETAILS
───────────────────────────────────────
Amount: ₹${transaction.amount.toLocaleString()}
Status: ${transaction.status.toUpperCase()}
${transaction.orderId ? `Order ID: ${transaction.orderId}` : ''}
${transaction.buyerName ? `Buyer: ${transaction.buyerName}` : ''}
${transaction.milletType ? `Millet Type: ${transaction.milletType}` : ''}
${transaction.paymentMethod ? `Payment Method: ${transaction.paymentMethod}` : ''}
${transaction.utrNumber ? `UTR Number: ${transaction.utrNumber}` : ''}

Description: ${transaction.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for using Shree Anna!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  const blob = new Blob([receipt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${transaction.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Download all transactions as CSV
const downloadAllTransactions = (transactions: Transaction[]) => {
  const headers = ['Transaction ID', 'Date', 'Type', 'Amount', 'Status', 'Description', 'Buyer', 'UTR Number'];
  const rows = transactions.map(t => [
    t.id,
    t.timestamp.toISOString(),
    t.type,
    t.amount.toString(),
    t.status,
    t.description,
    t.buyerName || '',
    t.utrNumber || ''
  ]);
  
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function PaymentsPage() {
  const [role, setRole] = useState('farmer');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  
  // Language and TTS support
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();
  
  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: 'Payments and Earnings page. View your total earnings, pending payments, and transaction history. Download receipts and track all your payment activity.',
      hi: 'भुगतान और कमाई पेज। अपनी कुल कमाई, लंबित भुगतान और लेनदेन इतिहास देखें। रसीदें डाउनलोड करें और अपनी सभी भुगतान गतिविधि ट्रैक करें।',
      kn: 'ಪಾವತಿಗಳು ಮತ್ತು ಗಳಿಕೆ ಪುಟ. ನಿಮ್ಮ ಒಟ್ಟು ಗಳಿಕೆ, ಬಾಕಿ ಪಾವತಿಗಳು ಮತ್ತು ವಹಿವಾಟು ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ. ರಸೀದಿಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಎಲ್ಲಾ ಪಾವತಿ ಚಟುವಟಿಕೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
      te: 'చెల్లింపులు మరియు ఆదాయాల పేజీ. మీ మొత్తం ఆదాయం, పెండింగ్ చెల్లింపులు మరియు లావాదేవీ చరిత్రను చూడండి. రసీదులు డౌన్‌లోడ్ చేసి మీ అన్ని చెల్లింపు కార్యకలాపాలను ట్రాక్ చేయండి.',
      ta: 'கட்டணங்கள் மற்றும் வருமானங்கள் பக்கம். உங்கள் மொத்த வருமானம், நிலுவையில் உள்ள கட்டணங்கள் மற்றும் பரிவர்த்தனை வரலாற்றைப் பார்க்கவும். ரசீதுகளைப் பதிவிறக்கி உங்கள் அனைத்து கட்டண செயல்பாடுகளையும் கண்காணிக்கவும்.',
      mr: 'पेमेंट आणि कमाई पेज। तुमची एकूण कमाई, प्रलंबित पेमेंट आणि व्यवहार इतिहास पहा। पावत्या डाउनलोड करा आणि तुमच्या सर्व पेमेंट अॅक्टिव्हिटी ट्रॅक करा.',
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  // Fetch payments from API
  const { data: apiPayments, isLoading, error } = usePayments();

  // Use API payments or fallback to mock
  const transactions = useMemo(() => {
    if (apiPayments && apiPayments.length > 0) {
      return apiPayments.map(transformPayment);
    }
    return mockTransactions;
  }, [apiPayments]);

  const totalEarnings = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthEarnings = transactions
    .filter(t => {
      const now = new Date();
      const txDate = new Date(t.timestamp);
      return t.type === 'credit' && 
             t.status === 'completed' && 
             txDate.getMonth() === now.getMonth() &&
             txDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'pending') return t.status === 'pending';
    if (activeTab === 'completed') return t.status === 'completed';
    return true;
  });

  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-accent/10 text-accent"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-primary/10 text-primary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/10 text-destructive"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold">
              Payments 💰
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={speakPageContent}
              className="touch-target"
              aria-label={isSpeaking ? 'Stop speaking' : 'Read page content aloud'}
            >
              {isSpeaking ? (
                <VolumeX className="w-5 h-5 text-destructive" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground mt-1">
            Track your earnings and transactions
          </p>
        </div>

        {/* Wallet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <Wallet className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white border-0">Available</Badge>
            </div>
            <p className="text-sm opacity-80">Total Earnings</p>
            <p className="text-3xl font-bold">₹{totalEarnings.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white border-0">Processing</Badge>
            </div>
            <p className="text-sm opacity-80">Pending Payments</p>
            <p className="text-3xl font-bold">₹{pendingAmount.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              <Badge variant="outline">This Month</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Month Earnings</p>
            <p className="text-3xl font-bold text-accent">₹{thisMonthEarnings.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Bank Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-4 sm:p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold">Payment Method</h3>
                <p className="text-sm text-muted-foreground">Your linked bank account</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">Account Name</p>
              <p className="font-medium">{bankDetails.accountName}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">Account Number</p>
              <p className="font-medium">{bankDetails.accountNumber}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">Bank</p>
              <p className="font-medium">{bankDetails.bankName}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">UPI ID</p>
              <p className="font-medium">{bankDetails.upiId}</p>
            </div>
          </div>
        </motion.div>

        {/* Transactions */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-heading font-semibold text-lg">Transaction History</h2>
              <div className="flex gap-2">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => downloadAllTransactions(transactions)}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 sm:px-6 border-b border-border">
              <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-6">
                <TabsTrigger 
                  value="all" 
                  className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="pending"
                  className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger 
                  value="completed"
                  className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Completed
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading transactions...</p>
                </div>
              ) : (
              <div className="divide-y divide-border">
                {filteredTransactions.map((transaction, idx) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedTransaction(transaction)}
                    className="p-4 sm:p-6 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        transaction.type === 'credit' 
                          ? 'bg-accent/10' 
                          : transaction.type === 'pending'
                          ? 'bg-primary/10'
                          : 'bg-muted'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="w-5 h-5 text-accent" />
                        ) : transaction.type === 'pending' ? (
                          <Clock className="w-5 h-5 text-primary" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{transaction.description}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.buyerName && `${transaction.buyerName} • `}
                          {transaction.timestamp.toLocaleDateString('en-IN', { 
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'credit' 
                            ? 'text-accent' 
                            : transaction.type === 'pending'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}>
                          {transaction.type === 'debit' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="py-12 text-center">
                    <IndianRupee className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions found</p>
                  </div>
                )}
              </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Transaction Details Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-md">
            {selectedTransaction && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading">Transaction Details</DialogTitle>
                  <DialogDescription>
                    {selectedTransaction.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  {/* Amount */}
                  <div className="text-center py-4 rounded-xl bg-muted/50">
                    <p className={`text-4xl font-bold ${
                      selectedTransaction.type === 'credit' ? 'text-accent' : 'text-muted-foreground'
                    }`}>
                      {selectedTransaction.type === 'debit' ? '-' : '+'}₹{selectedTransaction.amount.toLocaleString()}
                    </p>
                    <div className="mt-2">
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Description</span>
                      <span className="font-medium text-right max-w-[60%]">
                        {selectedTransaction.description}
                      </span>
                    </div>
                    {selectedTransaction.orderId && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="font-medium">{selectedTransaction.orderId}</span>
                      </div>
                    )}
                    {selectedTransaction.buyerName && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Buyer</span>
                        <span className="font-medium">{selectedTransaction.buyerName}</span>
                      </div>
                    )}
                    {selectedTransaction.milletType && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Millet Type</span>
                        <span className="font-medium">{selectedTransaction.milletType}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="font-medium">
                        {selectedTransaction.timestamp.toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                    {selectedTransaction.paymentMethod && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium">{selectedTransaction.paymentMethod}</span>
                      </div>
                    )}
                    {selectedTransaction.utrNumber && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">UTR Number</span>
                        <span className="font-medium font-mono text-sm">{selectedTransaction.utrNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => downloadReceipt(selectedTransaction)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => window.open('/help', '_blank')}>
                    <Phone className="w-4 h-4 mr-2" />
                    Get Help
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
