import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, Shield, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface FinanceCalculatorProps {
  carPrice: string | number;
  showTitle?: boolean;
}

export default function FinanceCalculator({ carPrice, showTitle = true }: FinanceCalculatorProps) {
  const [downPayment, setDownPayment] = useState("5000");
  const [loanTerm, setLoanTerm] = useState("60");
  const [interestRate, setInterestRate] = useState("6.5");
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [creditScore, setCreditScore] = useState("700");

  // Get estimated interest rate based on credit score
  const getEstimatedRate = (score: string) => {
    const scoreNum = parseInt(score);
    if (scoreNum >= 750) return "4.5";
    if (scoreNum >= 700) return "6.5";
    if (scoreNum >= 650) return "8.5";
    if (scoreNum >= 600) return "12.0";
    return "15.0";
  };

  // Update interest rate when credit score changes
  const handleCreditScoreChange = (score: string) => {
    setCreditScore(score);
    setInterestRate(getEstimatedRate(score));
  };

  // Finance calculation function
  const calculateFinancing = () => {
    const price = parseFloat(carPrice.toString());
    const down = parseFloat(downPayment) || 0;
    const principal = price - down;
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numPayments = parseInt(loanTerm);
    
    if (principal <= 0 || monthlyRate <= 0 || numPayments <= 0) {
      setMonthlyPayment(0);
      setTotalInterest(0);
      return;
    }
    
    const monthlyPaymentCalc = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                              (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalPayments = monthlyPaymentCalc * numPayments;
    const totalInterestCalc = totalPayments - principal;
    
    setMonthlyPayment(monthlyPaymentCalc);
    setTotalInterest(totalInterestCalc);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="h-5 w-5 text-carstore-orange" />
            <h3 className="text-lg font-semibold text-gray-900">Auto Loan Calculator</h3>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Price</label>
            <Input 
              type="text" 
              value={formatPrice(carPrice)}
              className="bg-gray-50" 
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment</label>
            <Input 
              type="number" 
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="5000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: {((parseFloat(carPrice.toString()) * 0.2)).toFixed(0)} (20%)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score Range</label>
            <Select value={creditScore} onValueChange={handleCreditScoreChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="800">Excellent (750+)</SelectItem>
                <SelectItem value="700">Good (700-749)</SelectItem>
                <SelectItem value="650">Fair (650-699)</SelectItem>
                <SelectItem value="600">Poor (600-649)</SelectItem>
                <SelectItem value="550">Bad (Below 600)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term</label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 months</SelectItem>
                <SelectItem value="36">36 months</SelectItem>
                <SelectItem value="48">48 months</SelectItem>
                <SelectItem value="60">60 months</SelectItem>
                <SelectItem value="72">72 months</SelectItem>
                <SelectItem value="84">84 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <Input 
              type="number" 
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="6.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Estimated rate based on your credit score
            </p>
          </div>
          
          <Button 
            onClick={calculateFinancing}
            className="w-full bg-carstore-orange text-white hover:bg-carstore-orange-dark"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Payment
          </Button>
          
          {monthlyPayment !== null && (
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-gradient-to-r from-carstore-orange/10 to-carstore-orange/5 rounded-lg border border-carstore-orange/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Monthly Payment:</span>
                  <span className="text-2xl font-bold text-carstore-orange">
                    ${monthlyPayment.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Based on {loanTerm} months at {interestRate}% APR
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Total Interest</span>
                  </div>
                  <span className="font-semibold">${totalInterest?.toFixed(2) || '0'}</span>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-1 mb-1">
                    <DollarSign className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Total Cost</span>
                  </div>
                  <span className="font-semibold">
                    ${((parseFloat(carPrice.toString()) - parseFloat(downPayment || '0')) + (totalInterest || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
              <Shield className="h-4 w-4 text-carstore-orange" />
              <span>Secure financing through trusted lenders</span>
            </div>
            
            <Button variant="outline" className="w-full">
              Get Pre-Approved
            </Button>
            <Button variant="outline" className="w-full">
              Apply for Financing
            </Button>
            <Button variant="outline" className="w-full">
              Compare Loan Options
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-3">
              * Rates may vary based on creditworthiness, loan term, and other factors.
              Pre-approval does not guarantee final loan approval.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}