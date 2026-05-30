'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ClipboardCheck,
  FlaskConical,
  FileCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Beaker,
  Droplets,
  Wheat,
  Scale,
  Star,
  FileText,
} from 'lucide-react';
import { qaApi, type QARequest, type LabReport } from '@/lib/api';

interface QualityAssayerRequestProps {
  listingId: string;
  listingTitle: string;
  onRequestCreated?: (request: QARequest) => void;
  language?: 'en' | 'hi';
}

const translations = {
  en: {
    title: 'Quality Assayer',
    subtitle: 'Request lab quality inspection for your produce',
    requestInspection: 'Request Inspection',
    requestingInspection: 'Requesting...',
    notes: 'Notes (Optional)',
    notesPlaceholder: 'Add any notes for the inspector...',
    noRequests: 'No quality inspections requested yet',
    requestSuccess: 'Inspection request submitted successfully!',
    requestError: 'Failed to submit request. Please try again.',
    pendingRequests: 'Pending Requests',
    completedReports: 'Completed Reports',
    status: {
      pending: 'Pending',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    viewReport: 'View Report',
    generateReport: 'Generate Report',
    labReport: 'Lab Report',
    grade: 'Quality Grade',
    moisture: 'Moisture',
    foreignMatter: 'Foreign Matter',
    brokenGrains: 'Broken Grains',
    protein: 'Protein',
    weight: 'Weight/Unit',
    overallScore: 'Overall Score',
    remarks: 'Remarks',
    certified: 'Certified',
    notCertified: 'Not Certified',
    requestedOn: 'Requested on',
    scheduledFor: 'Scheduled for',
  },
  hi: {
    title: 'गुणवत्ता परीक्षक',
    subtitle: 'अपनी उपज के लिए लैब गुणवत्ता निरीक्षण का अनुरोध करें',
    requestInspection: 'निरीक्षण का अनुरोध करें',
    requestingInspection: 'अनुरोध हो रहा है...',
    notes: 'नोट्स (वैकल्पिक)',
    notesPlaceholder: 'निरीक्षक के लिए कोई नोट जोड़ें...',
    noRequests: 'अभी तक कोई गुणवत्ता निरीक्षण अनुरोध नहीं',
    requestSuccess: 'निरीक्षण अनुरोध सफलतापूर्वक जमा!',
    requestError: 'अनुरोध जमा करने में विफल। कृपया पुनः प्रयास करें।',
    pendingRequests: 'लंबित अनुरोध',
    completedReports: 'पूर्ण रिपोर्ट',
    status: {
      pending: 'लंबित',
      scheduled: 'निर्धारित',
      in_progress: 'प्रगति में',
      completed: 'पूर्ण',
      cancelled: 'रद्द',
    },
    viewReport: 'रिपोर्ट देखें',
    generateReport: 'रिपोर्ट बनाएं',
    labReport: 'लैब रिपोर्ट',
    grade: 'गुणवत्ता ग्रेड',
    moisture: 'नमी',
    foreignMatter: 'अशुद्धियाँ',
    brokenGrains: 'टूटे दाने',
    protein: 'प्रोटीन',
    weight: 'वजन/इकाई',
    overallScore: 'कुल स्कोर',
    remarks: 'टिप्पणी',
    certified: 'प्रमाणित',
    notCertified: 'अप्रमाणित',
    requestedOn: 'अनुरोध तिथि',
    scheduledFor: 'निर्धारित तिथि',
  },
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  scheduled: <Calendar className="h-4 w-4" />,
  in_progress: <FlaskConical className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const gradeColors: Record<string, string> = {
  A: 'bg-green-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-orange-500 text-white',
  F: 'bg-red-500 text-white',
};

export default function QualityAssayerRequest({
  listingId,
  listingTitle,
  onRequestCreated,
  language = 'en',
}: QualityAssayerRequestProps) {
  const t = translations[language];
  const [requests, setRequests] = useState<QARequest[]>([]);
  const [reports, setReports] = useState<Record<string, LabReport>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [listingId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await qaApi.getListingRequests(listingId);
      setRequests(response.requests || []);

      // Fetch reports for completed requests
      const completedRequests = (response.requests || []).filter(
        (r: QARequest) => r.status === 'completed'
      );
      for (const req of completedRequests) {
        try {
          const detailResponse = await qaApi.getRequest(req.id);
          if (detailResponse.report) {
            setReports((prev) => ({ ...prev, [req.id]: detailResponse.report! }));
          }
        } catch {
          // Report might not exist yet
        }
      }
    } catch (err) {
      console.error('Failed to fetch QA requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestInspection = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await qaApi.requestInspection(listingId, undefined, notes || undefined);
      setSuccess(t.requestSuccess);
      setNotes('');
      setRequests((prev) => [response.request, ...prev]);
      onRequestCreated?.(response.request);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to request inspection:', err);
      setError(t.requestError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateReport = async (requestId: string) => {
    try {
      const response = await qaApi.generateReport(requestId);
      setReports((prev) => ({ ...prev, [requestId]: response.report }));
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'completed' as const } : r))
      );
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const pendingRequests = requests.filter((r) => r.status !== 'completed');
  const completedRequests = requests.filter((r) => r.status === 'completed');

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Beaker className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg">{t.title}</CardTitle>
        </div>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success/Error Alerts */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Request Form */}
        <div className="space-y-3">
          <Textarea
            placeholder={t.notesPlaceholder}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <Button
            onClick={handleRequestInspection}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {t.requestingInspection}
              </>
            ) : (
              <>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                {t.requestInspection}
              </>
            )}
          </Button>
        </div>

        <Separator />

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FlaskConical className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t.noRequests}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t.pendingRequests}
                </h4>
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[request.status]}>
                          {statusIcons[request.status]}
                          <span className="ml-1">{t.status[request.status]}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {t.requestedOn}{' '}
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {request.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateReport(request.id)}
                        >
                          <FileCheck className="mr-1 h-4 w-4" />
                          {t.generateReport}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Reports */}
            {completedRequests.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-green-600" />
                  {t.completedReports}
                </h4>
                <div className="space-y-2">
                  {completedRequests.map((request) => {
                    const report = reports[request.id];
                    return (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={statusColors.completed}>
                            {statusIcons.completed}
                            <span className="ml-1">{t.status.completed}</span>
                          </Badge>
                          {report && (
                            <Badge className={gradeColors[report.grade]}>
                              {t.grade}: {report.grade}
                            </Badge>
                          )}
                        </div>
                        {report && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedReport(report)}
                              >
                                <FileText className="mr-1 h-4 w-4" />
                                {t.viewReport}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Beaker className="h-5 w-5" />
                                  {t.labReport}
                                </DialogTitle>
                                <DialogDescription>{listingTitle}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Grade Badge */}
                                <div className="flex justify-center">
                                  <Badge
                                    className={`${gradeColors[report.grade]} text-2xl px-6 py-2`}
                                  >
                                    {t.grade}: {report.grade}
                                  </Badge>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                  <MetricCard
                                    icon={<Droplets className="h-4 w-4 text-blue-500" />}
                                    label={t.moisture}
                                    value={`${report.moisture_percent}%`}
                                  />
                                  <MetricCard
                                    icon={<AlertCircle className="h-4 w-4 text-orange-500" />}
                                    label={t.foreignMatter}
                                    value={`${report.foreign_matter_percent}%`}
                                  />
                                  <MetricCard
                                    icon={<Wheat className="h-4 w-4 text-yellow-600" />}
                                    label={t.brokenGrains}
                                    value={`${report.broken_grains_percent}%`}
                                  />
                                  {report.protein_percent && (
                                    <MetricCard
                                      icon={<FlaskConical className="h-4 w-4 text-purple-500" />}
                                      label={t.protein}
                                      value={`${report.protein_percent}%`}
                                    />
                                  )}
                                  <MetricCard
                                    icon={<Scale className="h-4 w-4 text-gray-500" />}
                                    label={t.weight}
                                    value={`${report.weight_per_unit} kg`}
                                  />
                                  <MetricCard
                                    icon={<Star className="h-4 w-4 text-yellow-500" />}
                                    label={t.overallScore}
                                    value={`${report.overall_quality_score}/100`}
                                  />
                                </div>

                                {/* Remarks */}
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <p className="text-sm font-medium mb-1">{t.remarks}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {report.remarks}
                                  </p>
                                </div>

                                {/* Certification Status */}
                                <div className="flex justify-center">
                                  <Badge
                                    variant={report.certified ? 'default' : 'secondary'}
                                    className={
                                      report.certified
                                        ? 'bg-green-600'
                                        : 'bg-gray-400'
                                    }
                                  >
                                    {report.certified ? (
                                      <>
                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                        {t.certified}
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="mr-1 h-4 w-4" />
                                        {t.notCertified}
                                      </>
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for metrics display
function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-background rounded border">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}
