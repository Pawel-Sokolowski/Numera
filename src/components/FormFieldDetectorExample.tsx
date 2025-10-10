import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PdfFieldDetectorDialog } from './PdfFieldDetectorDialog';
import { FileSearch, Upload, Download, Eye } from 'lucide-react';

/**
 * Example component demonstrating how to use the PDF Field Detection system
 * 
 * This component can be integrated into the admin panel or settings page
 * to allow users to automatically detect and configure form fields.
 */
export function FormFieldDetectorExample() {
  const [detectorOpen, setDetectorOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Automated Form Field Detection</h1>
        <p className="text-muted-foreground">
          Use OCR and image processing to automatically detect form fields in PDF documents
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Detection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Detect Fields
            </CardTitle>
            <CardDescription>
              Automatically detect form fields using OCR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setDetectorOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Open Field Detector
            </Button>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Features
            </CardTitle>
            <CardDescription>
              What the detection system can do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Detect rectangles and boxes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>OCR text recognition (Polish)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Smart field matching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Visual editor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Export to mapping.json</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Supported Forms Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Supported Forms
            </CardTitle>
            <CardDescription>
              Works with all Polish tax forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="font-medium">Pełnomocnictwa:</div>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                <span>• UPL-1</span>
                <span>• UPL-1P</span>
                <span>• PEL</span>
                <span>• ZAW-FA</span>
              </div>
              <div className="font-medium mt-3">Deklaracje:</div>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                <span>• PIT-37</span>
                <span>• PIT-R</span>
                <span>• PIT-OP</span>
                <span>• IFT-1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            The automated field detection process in 5 steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <div className="font-medium">Upload PDF</div>
                <div className="text-sm text-muted-foreground">
                  Select the PDF form you want to analyze
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <div className="font-medium">Automatic Detection</div>
                <div className="text-sm text-muted-foreground">
                  System detects rectangles and uses OCR to identify labels
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <div className="font-medium">Review Results</div>
                <div className="text-sm text-muted-foreground">
                  See all detected fields with confidence scores
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <div className="font-medium">Adjust as Needed</div>
                <div className="text-sm text-muted-foreground">
                  Edit field names, coordinates, or delete incorrect detections
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <div className="font-medium">Export Mapping</div>
                <div className="text-sm text-muted-foreground">
                  Download mapping.json and use it with your forms
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Time Saving</h4>
              <p className="text-sm text-muted-foreground">
                No more manual coordinate mapping. Detect all fields in seconds instead of hours.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Accuracy</h4>
              <p className="text-sm text-muted-foreground">
                Computer vision and OCR ensure precise field detection with confidence scores.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Easy Updates</h4>
              <p className="text-sm text-muted-foreground">
                When forms change, simply re-run detection instead of manually updating coordinates.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Flexibility</h4>
              <p className="text-sm text-muted-foreground">
                Works with any PDF form - Polish tax forms, contracts, or custom documents.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Detector Dialog */}
      <PdfFieldDetectorDialog 
        open={detectorOpen}
        onOpenChange={setDetectorOpen}
      />
    </div>
  );
}
