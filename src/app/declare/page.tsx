"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Send, AlertTriangle, Monitor, Download, Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";

export default function DeclarePage() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  const startAgent = () => {
    setStep(2);
    const socket = io();
    socketRef.current = socket;

    socket.on("agent_update", (update) => {
      if (update.type === "screenshot") {
        setScreenshot(update.data);
      } else {
        setStatus(update.status);
        setMessage(update.message);
        if (update.status === "submitted") {
          setPaymentData(update.data);
          setStep(3);
        }
      }
    });

    socket.emit("start_declaration", {
      month: 6,
      year: 2024,
      aggregates: [
        { rate: 0.0035, count: 4, base: 4500, tax: 15.75 },
        { rate: 0.0132, count: 2, base: 1200, tax: 15.84 }
      ]
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">New TOB Declaration</h1>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Aggregate Transactions for June 2024</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rate Type</TableHead>
                        <TableHead className="text-center">Count</TableHead>
                        <TableHead className="text-right">Tax Base</TableHead>
                        <TableHead className="text-right">TOB Due</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Stocks (0.35%)</TableCell>
                        <TableCell className="text-center">4</TableCell>
                        <TableCell className="text-right">€4,500.00</TableCell>
                        <TableCell className="text-right font-bold">€15.75</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>ETFs (1.32%)</TableCell>
                        <TableCell className="text-center">2</TableCell>
                        <TableCell className="text-right">€1,200.00</TableCell>
                        <TableCell className="text-right font-bold">€15.84</TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-50/50 font-bold">
                        <TableCell colSpan={3}>Total to declare</TableCell>
                        <TableCell className="text-right text-blue-600">€31.59</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md flex items-start space-x-3">
                <AlertTriangle className="text-orange-600 h-5 w-5 mt-0.5" />
                <p className="text-sm text-orange-800">
                    You are about to start a live session with MyMinfin. Please have your <strong>itsme®</strong> app ready for authentication.
                </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={startAgent}>
                <Monitor className="mr-2 h-4 w-4" /> Start Agent Session
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
            <Card className="bg-black overflow-hidden border-0 relative min-h-[400px]">
                {screenshot ? (
                    <img src={`data:image/jpeg;base64,${screenshot}`} className="w-full h-auto" alt="Agent View" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-gray-400">Waiting for browser stream...</p>
                    </div>
                )}
            </Card>
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium text-sm">{message || "Initializing agent..."}</span>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Record</Button>
                    <Button variant="danger" size="sm" onClick={() => { socketRef.current?.disconnect(); setStep(1); }}>Abort</Button>
                </div>
            </div>
        </div>
      )}

      {step === 3 && (
        <Card className="border-green-200 bg-green-50/20">
          {/* ... Success UI ... */}
          <CardHeader>
             <CardTitle className="text-green-800">Declaration Submitted</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="p-4 bg-white border rounded">
                <p>Reference: {paymentData?.reference}</p>
                <p>IBAN: {paymentData?.iban}</p>
             </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setStep(1)}>Done</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
