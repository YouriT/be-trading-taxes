"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, CheckCircle2, Circle } from "lucide-react";

const mockTransactions = [
  { id: 1, date: "2024-06-12", isin: "IE00BK5BQT80", name: "Vanguard FTSE All-World", type: "Buy", amount: "€1,200.00", tax: "€15.84", status: "Pending" },
  { id: 2, date: "2024-06-15", isin: "US0378331005", name: "Apple Inc.", type: "Buy", amount: "€500.00", tax: "€1.75", status: "Pending" },
  { id: 3, date: "2024-05-20", isin: "IE00B4L5Y983", name: "iShares Core MSCI World", type: "Buy", amount: "€2,500.00", tax: "€3.00", status: "Declared" },
];

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transaction Ledger</h1>
        <div className="flex space-x-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-10 w-64" placeholder="Search ISIN or name..." />
            </div>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>TOB Tax</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.date}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{tx.name}</p>
                      <p className="text-xs text-gray-500">{tx.isin}</p>
                    </div>
                  </TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell className="font-semibold text-blue-600">{tx.tax}</TableCell>
                  <TableCell>
                    <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        tx.status === "Declared" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    )}>
                        {tx.status === "Declared" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Circle className="mr-1 h-3 w-3" />}
                        {tx.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
