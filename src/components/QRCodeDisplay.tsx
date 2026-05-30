"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Printer, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  subtitle?: string;
  size?: number;
  showActions?: boolean;
  className?: string;
}

export function QRCodeDisplay({
  value,
  title,
  subtitle,
  size = 200,
  showActions = true,
  className = '',
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Generate QR code URL using a public API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=1c1917`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${value.slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'QR Code',
          text: subtitle || 'Scan this QR code',
          url: value,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title || 'QR Code'}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: sans-serif;
              }
              img { margin: 20px 0; }
              h1 { font-size: 24px; margin-bottom: 8px; }
              p { color: #666; }
            </style>
          </head>
          <body>
            ${title ? `<h1>${title}</h1>` : ''}
            ${subtitle ? `<p>${subtitle}</p>` : ''}
            <img src="${qrUrl}" alt="QR Code" />
            <p style="font-size: 12px; word-break: break-all; max-width: 300px; text-align: center;">${value}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center ${className}`}
    >
      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold mb-1 font-heading">{title}</h3>
      )}
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      )}

      {/* QR Code */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-border">
        <img
          src={qrUrl}
          alt="QR Code"
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>

      {/* Value display */}
      <div className="mt-4 flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-full">
        <code className="text-xs text-muted-foreground truncate max-w-[200px]">
          {value}
        </code>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-background rounded transition-colors"
          aria-label="Copy"
        >
          {copied ? (
            <Check className="w-4 h-4 text-accent" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="touch-target"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="touch-target"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="touch-target"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
