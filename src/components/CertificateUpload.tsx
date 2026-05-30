'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { listingsApi, Certificate } from '@/lib/api';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2,
  Award,
  Leaf,
  FlaskConical,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

// Certificate types with display info
const CERTIFICATE_TYPES = [
  { value: 'fssai', label: 'FSSAI License', labelHi: 'FSSAI लाइसेंस', icon: ShieldCheck },
  { value: 'organic', label: 'Organic Certification', labelHi: 'जैविक प्रमाणपत्र', icon: Leaf },
  { value: 'lab_report', label: 'Lab Test Report', labelHi: 'लैब परीक्षण रिपोर्ट', icon: FlaskConical },
  { value: 'quality_test', label: 'Quality Certificate', labelHi: 'गुणवत्ता प्रमाणपत्र', icon: Award },
  { value: 'pesticide_free', label: 'Pesticide Free', labelHi: 'कीटनाशक मुक्त', icon: ShieldCheck },
  { value: 'gmo_free', label: 'Non-GMO', labelHi: 'गैर-जीएमओ', icon: CheckCircle2 },
];

// Translations
const translations = {
  en: {
    title: 'Quality Certificates',
    description: 'Upload quality certificates to increase buyer trust',
    uploadNew: 'Upload New Certificate',
    certType: 'Certificate Type',
    certNumber: 'Certificate Number',
    issuer: 'Issued By',
    issueDate: 'Issue Date',
    expiryDate: 'Expiry Date',
    fileUrl: 'Certificate File URL',
    notes: 'Additional Notes',
    upload: 'Upload Certificate',
    cancel: 'Cancel',
    noCertificates: 'No certificates uploaded yet',
    addFirst: 'Add your first certificate to build trust with buyers',
    verified: 'Verified',
    pending: 'Pending Verification',
    rejected: 'Rejected',
    expired: 'Expired',
    delete: 'Delete',
    uploading: 'Uploading...',
    selectType: 'Select certificate type',
    optional: '(Optional)',
    viewFile: 'View Certificate',
    verifiedBy: 'Verified by admin',
    expiresOn: 'Expires on',
    issuedBy: 'Issued by',
    uploadSuccess: 'Certificate uploaded successfully!',
    deleteSuccess: 'Certificate deleted successfully!',
    deleteConfirm: 'Are you sure you want to delete this certificate?',
  },
  hi: {
    title: 'गुणवत्ता प्रमाणपत्र',
    description: 'खरीदार का भरोसा बढ़ाने के लिए गुणवत्ता प्रमाणपत्र अपलोड करें',
    uploadNew: 'नया प्रमाणपत्र अपलोड करें',
    certType: 'प्रमाणपत्र का प्रकार',
    certNumber: 'प्रमाणपत्र संख्या',
    issuer: 'जारीकर्ता',
    issueDate: 'जारी करने की तारीख',
    expiryDate: 'समाप्ति तिथि',
    fileUrl: 'प्रमाणपत्र फ़ाइल URL',
    notes: 'अतिरिक्त नोट्स',
    upload: 'प्रमाणपत्र अपलोड करें',
    cancel: 'रद्द करें',
    noCertificates: 'अभी तक कोई प्रमाणपत्र अपलोड नहीं हुआ',
    addFirst: 'खरीदारों के साथ विश्वास बनाने के लिए अपना पहला प्रमाणपत्र जोड़ें',
    verified: 'सत्यापित',
    pending: 'सत्यापन लंबित',
    rejected: 'अस्वीकृत',
    expired: 'समाप्त',
    delete: 'हटाएं',
    uploading: 'अपलोड हो रहा है...',
    selectType: 'प्रमाणपत्र का प्रकार चुनें',
    optional: '(वैकल्पिक)',
    viewFile: 'प्रमाणपत्र देखें',
    verifiedBy: 'व्यवस्थापक द्वारा सत्यापित',
    expiresOn: 'समाप्ति तिथि',
    issuedBy: 'द्वारा जारी',
    uploadSuccess: 'प्रमाणपत्र सफलतापूर्वक अपलोड हुआ!',
    deleteSuccess: 'प्रमाणपत्र सफलतापूर्वक हटाया गया!',
    deleteConfirm: 'क्या आप वाकई इस प्रमाणपत्र को हटाना चाहते हैं?',
  }
};

interface CertificateUploadProps {
  listingId: string;
  certificates?: Certificate[];
  onCertificateAdded?: (cert: Certificate) => void;
  onCertificateDeleted?: (certId: string) => void;
  language?: 'en' | 'hi';
  readOnly?: boolean;
}

export function CertificateUpload({
  listingId,
  certificates = [],
  onCertificateAdded,
  onCertificateDeleted,
  language = 'en',
  readOnly = false
}: CertificateUploadProps) {
  const t = translations[language];
  
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    cert_type: '',
    cert_number: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    file_url: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      cert_type: '',
      cert_number: '',
      issuer: '',
      issue_date: '',
      expiry_date: '',
      file_url: '',
      notes: ''
    });
    setShowForm(false);
    setError(null);
  };

  const handleUpload = useCallback(async () => {
    if (!formData.cert_type || !formData.file_url) {
      setError('Certificate type and file URL are required');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const result = await listingsApi.uploadCertificate(listingId, {
        cert_type: formData.cert_type,
        cert_number: formData.cert_number || undefined,
        issuer: formData.issuer || undefined,
        issue_date: formData.issue_date || undefined,
        expiry_date: formData.expiry_date || undefined,
        file_url: formData.file_url,
        notes: formData.notes || undefined
      });
      
      setSuccess(t.uploadSuccess);
      resetForm();
      onCertificateAdded?.(result);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [formData, listingId, onCertificateAdded, t.uploadSuccess]);

  const handleDelete = useCallback(async (certId: string) => {
    if (!confirm(t.deleteConfirm)) return;
    
    try {
      await listingsApi.deleteCertificate(listingId, certId);
      onCertificateDeleted?.(certId);
      setSuccess(t.deleteSuccess);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }, [listingId, onCertificateDeleted, t.deleteConfirm, t.deleteSuccess]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t.verified}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            {t.pending}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            {t.rejected}
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t.expired}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCertTypeInfo = (type: string) => {
    return CERTIFICATE_TYPES.find(ct => ct.value === type) || CERTIFICATE_TYPES[0];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
          {!readOnly && !showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t.uploadNew}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Success/Error Messages */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Upload Form */}
        {showForm && (
          <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Certificate Type */}
              <div className="space-y-2">
                <Label htmlFor="cert_type">{t.certType} *</Label>
                <Select 
                  value={formData.cert_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cert_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {language === 'hi' ? type.labelHi : type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Certificate Number */}
              <div className="space-y-2">
                <Label htmlFor="cert_number">{t.certNumber} {t.optional}</Label>
                <Input
                  id="cert_number"
                  value={formData.cert_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, cert_number: e.target.value }))}
                  placeholder="e.g., FSSAI12345678"
                />
              </div>

              {/* Issuer */}
              <div className="space-y-2">
                <Label htmlFor="issuer">{t.issuer} {t.optional}</Label>
                <Input
                  id="issuer"
                  value={formData.issuer}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                  placeholder="e.g., FSSAI India"
                />
              </div>

              {/* Issue Date */}
              <div className="space-y-2">
                <Label htmlFor="issue_date">{t.issueDate} {t.optional}</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiry_date">{t.expiryDate} {t.optional}</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>

              {/* File URL */}
              <div className="space-y-2">
                <Label htmlFor="file_url">{t.fileUrl} *</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                  placeholder="https://example.com/certificate.pdf"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t.notes} {t.optional}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                {t.cancel}
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {uploading ? t.uploading : t.upload}
              </Button>
            </div>
          </div>
        )}

        {/* Certificate List */}
        {certificates.length === 0 && !showForm ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{t.noCertificates}</p>
            <p className="text-sm">{t.addFirst}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => {
              const typeInfo = getCertTypeInfo(cert.cert_type);
              const IconComponent = typeInfo.icon;
              
              return (
                <div 
                  key={cert.id}
                  className="p-4 border rounded-lg bg-white flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {language === 'hi' ? typeInfo.labelHi : typeInfo.label}
                        </span>
                        {getStatusBadge(cert.verification_status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {cert.cert_number && (
                          <p>#{cert.cert_number}</p>
                        )}
                        {cert.issuer && (
                          <p>{t.issuedBy}: {cert.issuer}</p>
                        )}
                        {cert.expiry_date && (
                          <p>{t.expiresOn}: {new Date(cert.expiry_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={cert.file_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-1" />
                        {t.viewFile}
                      </a>
                    </Button>
                    {!readOnly && cert.verification_status !== 'verified' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cert.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Certificate badges for listing cards
export function CertificateBadges({ 
  certificates,
  compact = false 
}: { 
  certificates: Certificate[];
  compact?: boolean;
}) {
  const verifiedCerts = certificates.filter(c => c.verification_status === 'verified');
  
  if (verifiedCerts.length === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {verifiedCerts.slice(0, 3).map((cert) => {
          const typeInfo = CERTIFICATE_TYPES.find(ct => ct.value === cert.cert_type);
          const IconComponent = typeInfo?.icon || Award;
          return (
            <div 
              key={cert.id}
              className="p-1 bg-green-100 rounded"
              title={typeInfo?.label}
            >
              <IconComponent className="w-3 h-3 text-green-700" />
            </div>
          );
        })}
        {verifiedCerts.length > 3 && (
          <span className="text-xs text-gray-500">+{verifiedCerts.length - 3}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {verifiedCerts.map((cert) => {
        const typeInfo = CERTIFICATE_TYPES.find(ct => ct.value === cert.cert_type);
        return (
          <Badge 
            key={cert.id}
            variant="outline"
            className="bg-green-50 border-green-200 text-green-700 text-xs"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {typeInfo?.label || cert.cert_type}
          </Badge>
        );
      })}
    </div>
  );
}

export default CertificateUpload;
